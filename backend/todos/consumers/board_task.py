"""
WebSocket consumer for a single board's tasks.

BoardTaskConsumer: one channel per board; clients connect to receive
live task updates (create, update, reorder, delete) for that board.
"""

import logging
from typing import Any, Dict

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from todos.models import Task
from todos.services import TaskService

logger = logging.getLogger(__name__)


class BoardTaskConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket consumer for a single board.

    URL: ws/boards/<board_id>/
    - On connect: join channel group for this board.
    - On disconnect: leave group.
    - receive_json: handle task.update, task.create, task.delete.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.board_id = None
        self.group_name = None
        self.user = None

    async def connect(self):
        """Accept connection and join the board's channel group."""
        user = self.scope.get("user")
        if not getattr(user, "is_authenticated", False):
            await self.close(code=4401)
            return

        self.board_id = self.scope["url_route"]["kwargs"]["board_id"]

        has_access = await database_sync_to_async(TaskService.user_has_board_access)(user.id, self.board_id)
        if not has_access:
            await self.close(code=1008)
            return

        self.user = user
        self.group_name = f"board_{self.board_id}"

        channel_layer = self.channel_layer
        if channel_layer is not None:
            await channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()
        logger.info(
            "WebSocket connected: board_id=%s user_id=%s",
            self.board_id,
            getattr(self.user, "id", None),
        )

    async def disconnect(self, code):
        """Leave the board group on disconnect."""
        if self.group_name:
            channel_layer = self.channel_layer
            if channel_layer is not None:
                await channel_layer.group_discard(self.group_name, self.channel_name)
        logger.info(
            "WebSocket disconnected: board_id=%s user_id=%s code=%s",
            self.board_id,
            getattr(self.user, "id", None),
            code,
        )

    async def receive_json(self, content, **kwargs):
        """
        Handle messages from the client.

        Expected shapes:
          { "action": "task.update", "id": "<task_id>", "patch": { ... } }
          { "action": "task.create", "data": { ... } }
          { "action": "task.delete", "id": "<task_id>" }
        """
        logger.debug(
            "WebSocket receive: board_id=%s user_id=%s content=%s",
            self.board_id,
            getattr(self.user, "id", None),
            content,
        )

        action = content.get("action")
        handlers = {
            "task.update": self._handle_task_update,
            "task.create": self._handle_task_create,
            "task.delete": self._handle_task_delete,
        }
        handler = handlers.get(action)
        if handler is not None:
            await handler(content)
        else:
            await self.send_json(
                {
                    "type": "error",
                    "message": f"Unknown action: {action}",
                }
            )

    async def tasks_updated(self, event: Dict[str, Any]):
        """
        Group handler: forward task events to this WebSocket client.
        """
        await self.send_json(
            {
                "type": "tasks.updated",
                "event": event.get("event"),
                "task": event.get("task"),
            }
        )

    async def _handle_task_update(self, content: Dict[str, Any]):
        task_id = content.get("id")
        patch = content.get("patch") or {}
        if not task_id or not isinstance(patch, dict):
            await self.send_json(
                {
                    "type": "error",
                    "message": "task.update requires 'id' and 'patch' fields",
                }
            )
            return

        try:
            await database_sync_to_async(TaskService.update_task_for_board)(self.board_id, task_id, patch)
            task_data = await database_sync_to_async(TaskService.get_task)(self.board_id, task_id)
        except Task.DoesNotExist:
            await self.send_json({"type": "error", "message": "Task not found for this board"})
            return
        except ValueError as e:
            await self.send_json({"type": "error", "message": str(e)})
            return

        await self._broadcast("task_updated", task_data)

    async def _handle_task_create(self, content: Dict[str, Any]):
        data = content.get("data") or {}
        if not isinstance(data, dict) or "title" not in data:
            await self.send_json(
                {
                    "type": "error",
                    "message": "task.create requires 'data' with at least a 'title' field",
                }
            )
            return

        try:
            task_data = await database_sync_to_async(TaskService.create_task_for_board)(
                self.board_id,
                getattr(self.user, "id", None),
                data,
            )
        except ValueError as e:
            await self.send_json({"type": "error", "message": str(e)})
            return

        await self._broadcast("task_created", task_data)

    async def _handle_task_delete(self, content: Dict[str, Any]):
        task_id = content.get("id")
        if not task_id:
            await self.send_json({"type": "error", "message": "task.delete requires 'id' field"})
            return

        deleted = await database_sync_to_async(TaskService.delete_task_for_board)(self.board_id, task_id)
        if not deleted:
            await self.send_json({"type": "error", "message": "Task not found for this board"})
            return

        await self._broadcast("task_deleted", {"id": task_id})

    async def _broadcast(self, event: str, task: Dict[str, Any]) -> None:
        """Broadcast a task event to all board group members."""
        if self.channel_layer is None:
            return
        await self.channel_layer.group_send(
            self.group_name,
            {
                "type": "tasks.updated",
                "event": event,
                "task": task,
            },
        )
