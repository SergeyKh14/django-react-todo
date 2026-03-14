import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, UserPlus } from 'lucide-react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { boardService } from '@/services/boardService'
import { queryKeys } from '@/lib/query/keys'
import type { BoardMemberRole } from '@/types/board'
import type { Task } from '@/types/task'
import { useBoardInvitations } from '@/hooks/useInvitation'
import { useBoardTasksSocket } from '@/hooks/useBoardTasksSocket'
import { InviteUserModal } from './components/InviteUserModal'
import { TaskBoard } from './components/TaskBoard'

export function BoardDetailPage() {
  const { boardId } = useParams<{ boardId: string }>() as { boardId: string }
  const queryClient = useQueryClient()
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  // Initialize WebSocket connection for this board (live task updates).
  const { sendTaskUpdate, createTask, deleteTask } = useBoardTasksSocket({ boardId })

  const { data: board, isLoading, error } = useQuery({
    queryKey: queryKeys.boards.detail(boardId ?? ''),
    queryFn: () => boardService.getOne(boardId!),
    enabled: !!boardId,
  })

  const {
    invitations,
    isLoading: invitationsLoading,
    createInvitation,
  } = useBoardInvitations({
    boardId,
    enabled: !!boardId && !!board?.can_manage_invitations,
  })

  const {
    data: serverTasks = [],
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: boardId ? queryKeys.tasks.byBoard(boardId) : ['tasks', 'board', 'unknown'],
    queryFn: () => boardService.getTasks(boardId!),
    enabled: !!boardId,
  })

  const handleTasksChange = (next: Task[]) => {
    if (!boardId) return
    queryClient.setQueryData<Task[] | undefined>(
      queryKeys.tasks.byBoard(boardId),
      next,
    )
  }

  const handleInvite = async (email: string, role: BoardMemberRole) => {
    await createInvitation.mutateAsync({ email, role })
  }

  const err = createInvitation.error as { response?: { data?: { email?: string; detail?: string } } } | null
  const inviteError = err?.response?.data?.email
    ?? err?.response?.data?.detail
    ?? (err instanceof Error ? err.message : null)

  if (isLoading || tasksLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !board) {
    return (
      <div className="space-y-6">
        <Link
          to="/board"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to boards</span>
        </Link>
        <p className="text-sm text-destructive" role="alert">
          {error instanceof Error ? error.message : 'Board not found.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          to="/board"
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to boards</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{board.title}</h1>
          {board.description ? (
            <p className="mt-1 text-muted-foreground">{board.description}</p>
          ) : null}
        </div>
      </div>

      {board.members && board.members.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {board.members.map((member) => (
                <li
                  key={member.user_id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {[member.first_name, member.last_name].filter(Boolean).join(' ') || member.email}
                    </span>
                    {member.role === 'owner' && (
                      <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                        Owner
                      </span>
                    )}
                  </div>
                  {member.role !== 'owner' && (
                    <span className="capitalize text-muted-foreground">{member.role}</span>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {board.can_manage_invitations && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Invitations</CardTitle>
            <Button onClick={() => setInviteModalOpen(true)} size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite user
            </Button>
          </CardHeader>
          <CardContent>
            {invitationsLoading ? (
              <p className="text-sm text-muted-foreground">Loading invitations…</p>
            ) : invitations.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No pending invitations. Invite someone by email to give them access to this board.
              </p>
            ) : (
              <ul className="space-y-2">
                {invitations.map((inv) => (
                  <li
                    key={inv.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span className="text-muted-foreground">{inv.invitee_email}</span>
                    <span className="capitalize text-muted-foreground">{inv.role}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Tasks</h2>
        <TaskBoard
          tasks={serverTasks}
          members={board?.members ?? []}
          onTasksChange={handleTasksChange}
          onTaskUpdate={({ id, patch }) => sendTaskUpdate({ id, patch })}
          onTaskCreate={(data) => createTask(data)}
          onTaskDelete={(id) => deleteTask(id)}
        />
      </section>

      <InviteUserModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        onInvite={handleInvite}
        isSubmitting={createInvitation.isPending}
        error={inviteError}
      />
    </div>
  )
}
