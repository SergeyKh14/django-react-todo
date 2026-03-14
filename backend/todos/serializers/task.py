"""
Task serializers.
"""

from rest_framework import serializers

from todos.models import Task


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for tasks on a board (list/detail)."""

    board_id = serializers.UUIDField(source="board.id", read_only=True)
    created_by_email = serializers.EmailField(source="created_by.email", read_only=True, allow_null=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True, allow_null=True)

    class Meta:  # type: ignore[meta-definition]
        model = Task
        fields = (
            "id",
            "board_id",
            "title",
            "description",
            "status",
            "priority",
            "order",
            "due_date",
            "created_by_email",
            "assigned_to_email",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "board_id", "created_at", "updated_at")


class TaskWriteSerializer(serializers.ModelSerializer):
    """Serializer used for creating/updating tasks via WebSocket/service layer."""

    class Meta:  # type: ignore[meta-definition]
        model = Task
        fields = (
            "title",
            "description",
            "status",
            "priority",
            "order",
            "due_date",
            "assigned_to",
        )

    def validate_title(self, value: str) -> str:
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Title is required.")
        return value
