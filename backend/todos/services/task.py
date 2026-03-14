"""
Task-related business logic for boards.
"""

from typing import Any

from django.db.models import Q
from rest_framework.exceptions import ValidationError

from todos.models import Board, BoardMembership, Task
from todos.serializers.task import TaskSerializer, TaskWriteSerializer


def get_user_task_counts(user_id):
    """
    Return completed and pending task counts for tasks assigned to the user.

    Counts only tasks on boards the user has access to (owner or accepted member).
    - completed: status DONE
    - pending: status TODO or IN_PROGRESS
    """
    base = Task.objects.filter(assigned_to_id=user_id).filter(
        Q(board__owner_id=user_id)
        | Q(
            board__memberships__user_id=user_id,
            board__memberships__status=BoardMembership.Status.ACCEPTED,
        )
    ).distinct()
    completed = base.filter(status=Task.Status.DONE).count()
    pending = base.filter(
        status__in=(Task.Status.TODO, Task.Status.IN_PROGRESS)
    ).count()
    return {"completed": completed, "pending": pending}


def user_has_board_access(user_id, board_id) -> bool:
    """
    Return True if the user is allowed to access the given board.

    Allowed:
    - Board owner
    - Accepted member (BoardMembership.Status.ACCEPTED)
    """
    return Board.objects.filter(
        Q(pk=board_id, owner_id=user_id)
        | Q(
            pk=board_id,
            memberships__user_id=user_id,
            memberships__status=BoardMembership.Status.ACCEPTED,
        )
    ).exists()


def _extract_validation_error_message(exc: ValidationError) -> str:
    """Extract a simple string message from a DRF ValidationError."""
    detail = exc.detail
    if isinstance(detail, list):
        detail = detail[0]
    if isinstance(detail, dict):
        first_key = next(iter(detail))
        detail = detail[first_key]
        if isinstance(detail, list):
            detail = detail[0]
    return str(detail)


def update_task_for_board(board_id, task_id, patch: dict[str, Any]) -> None:
    """
    Update a task that belongs to the given board with allowed fields from patch.
    Raises Task.DoesNotExist if the task is not found on the board.
    """
    task = Task.objects.get(id=task_id, board_id=board_id)
    serializer = TaskWriteSerializer(task, data=patch, partial=True)
    try:
        serializer.is_valid(raise_exception=True)
    except ValidationError as exc:
        # Re-raise as ValueError so WebSocket layer can send a simple message.
        raise ValueError(_extract_validation_error_message(exc)) from exc
    serializer.save()


def get_task(board_id, task_id) -> dict[str, Any]:
    """
    Return a single serialized task belonging to the given board.
    Raises Task.DoesNotExist if not found.
    """
    task = Task.objects.select_related("created_by", "assigned_to").get(id=task_id, board_id=board_id)
    return dict(TaskSerializer(task).data)


def create_task_for_board(board_id, user_id, data: dict[str, Any]) -> dict[str, Any]:
    """
    Create a new task on the board and return its serialized representation.
    """
    serializer = TaskWriteSerializer(data=data)
    try:
        serializer.is_valid(raise_exception=True)
    except ValidationError as exc:
        raise ValueError(_extract_validation_error_message(exc)) from exc

    task = serializer.save(board_id=board_id, created_by_id=user_id)
    return dict(TaskSerializer(task).data)


def delete_task_for_board(board_id, task_id) -> bool:
    """
    Delete a task from the given board.

    Returns True if deleted, False if not found.
    """
    deleted_count, _ = Task.objects.filter(
        id=task_id,
        board_id=board_id,
    ).delete()
    return deleted_count > 0


class TaskService:
    """Namespace for task-related service functions."""

    get_user_task_counts = get_user_task_counts
    user_has_board_access = user_has_board_access
    update_task_for_board = update_task_for_board
    get_task = get_task
    create_task_for_board = create_task_for_board
    delete_task_for_board = delete_task_for_board
