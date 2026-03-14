"""
API for user task statistics (completed / pending counts).
"""

from rest_framework.response import Response
from rest_framework.views import APIView

from todos.services import TaskService


class TaskSummaryView(APIView):
    """
    GET: Return the current user's total completed and pending task counts.

    Counts only tasks assigned to the user on boards they have access to.
    - completed: tasks with status DONE
    - pending: tasks with status TODO or IN_PROGRESS
    """

    def get(self, request):
        counts = TaskService.get_user_task_counts(request.user.id)
        return Response(counts)
