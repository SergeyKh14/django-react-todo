"""
Invitation (BoardMembership) serializers.
"""

from rest_framework import serializers

from todos.models import BoardMembership
from todos.services import InvitationService, InvitationServiceError


class InvitationListSerializer(serializers.ModelSerializer):
    """Serializer for listing/retrieving board invitations (pending memberships)."""

    board_id = serializers.UUIDField(source="board.id", read_only=True)
    board_title = serializers.CharField(source="board.title", read_only=True)
    inviter_email = serializers.EmailField(source="board.owner.email", read_only=True)
    invitee_email = serializers.EmailField(source="user.email", read_only=True)
    invited_at = serializers.DateTimeField(source="joined_at", read_only=True)

    class Meta:  # type: ignore[meta-definition]
        model = BoardMembership
        fields = (
            "id",
            "board_id",
            "board_title",
            "inviter_email",
            "invitee_email",
            "role",
            "status",
            "invited_at",
        )


class CreateInvitationSerializer(serializers.Serializer):
    """Serializer for sending an invitation (create BoardMembership with PENDING)."""

    email = serializers.EmailField()
    role = serializers.ChoiceField(
        choices=BoardMembership.Role.choices,
        default=BoardMembership.Role.MEMBER,
    )

    def create(self, validated_data):
        try:
            return InvitationService.send_invitation(
                board=self.context["board"],
                email=validated_data["email"],
                role=validated_data["role"],
            )
        except InvitationServiceError as e:
            raise serializers.ValidationError({e.field: e.message})
