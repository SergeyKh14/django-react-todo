from django.contrib import admin

from .models import Board, BoardMembership, Task


@admin.register(Board)
class BoardAdmin(admin.ModelAdmin):
    list_display = ("title", "owner", "updated_at")
    list_filter = ("updated_at",)
    search_fields = ("title", "description")
    readonly_fields = ("id", "created_at", "updated_at")


@admin.register(BoardMembership)
class BoardMembershipAdmin(admin.ModelAdmin):
    list_display = ("board", "user", "role", "status", "joined_at")
    list_filter = ("role", "status")
    search_fields = ("board__title", "user__email")
    readonly_fields = ("id", "joined_at")


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "board", "status", "priority", "assigned_to", "updated_at")
    list_filter = ("status", "priority", "board")
    search_fields = ("title", "description")
    readonly_fields = ("id", "created_at", "updated_at")
