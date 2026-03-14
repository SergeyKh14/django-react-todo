"""
Board serializers.
"""

from rest_framework import serializers

from todos.models import Board, BoardMembership


class BoardMemberSerializer(serializers.Serializer):
    """Read-only serializer for an accepted board member (for board detail)."""

    user_id = serializers.UUIDField(source="user.id", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True, allow_blank=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True, allow_blank=True)
    role = serializers.CharField(read_only=True)
    joined_at = serializers.DateTimeField(read_only=True)


class BoardListSerializer(serializers.ModelSerializer):
    """Serializer for board list (cards)."""

    class Meta:  # type: ignore[meta-definition]
        model = Board
        fields = ("id", "title", "description", "created_at", "updated_at")


class BoardSerializer(serializers.ModelSerializer):
    """Full serializer for create, retrieve, and update."""

    owner_id = serializers.UUIDField(read_only=True)
    can_manage_invitations = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:  # type: ignore[meta-definition]
        model = Board
        fields = (
            "id",
            "title",
            "description",
            "owner_id",
            "can_manage_invitations",
            "members",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "owner_id", "created_at", "updated_at")

    def get_members(self, obj):
        """Owner first, then accepted memberships with user info."""
        owner = obj.owner
        owner_data = {
            "user_id": str(owner.id),
            "email": owner.email,
            "first_name": owner.first_name or "",
            "last_name": owner.last_name or "",
            "role": "owner",
            "joined_at": obj.created_at,
        }
        memberships = getattr(obj, "_accepted_memberships", None)
        if memberships is None:
            memberships = obj.memberships.filter(
                status=BoardMembership.Status.ACCEPTED,
            ).select_related("user")
        rest = BoardMemberSerializer(memberships, many=True).data
        return [owner_data] + list(rest)

    def get_can_manage_invitations(self, obj):
        """True if request user is board owner or an accepted admin."""
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        user_id = request.user.pk
        if obj.owner_id == user_id:
            return True
        return BoardMembership.objects.filter(
            board=obj,
            user_id=user_id,
            status=BoardMembership.Status.ACCEPTED,
            role=BoardMembership.Role.ADMIN,
        ).exists()

    def validate_title(self, value):
        return value.strip()
