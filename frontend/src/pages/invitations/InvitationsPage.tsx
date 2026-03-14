import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMyInvitations } from '@/hooks/useInvitation'

export function InvitationsPage() {
  const { invitations, count, isLoading, isError, error, respond } = useMyInvitations()

  const handleAccept = (boardId: string, invitationId: string) => {
    respond.mutate({ boardId, invitationId, action: 'accept' })
  }

  const handleDecline = (boardId: string, invitationId: string) => {
    respond.mutate({ boardId, invitationId, action: 'decline' })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">Loading invitations…</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-destructive">
          {error instanceof Error ? error.message : 'Failed to load invitations.'}
        </p>
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">You have no pending board invitations.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Invitations</h1>
      <p className="text-muted-foreground">
        You have {count} pending invitation{count !== 1 ? 's' : ''}.
      </p>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {invitations.map((inv) => (
          <li key={inv.id}>
            <Card>
              <CardHeader>
                <CardTitle>{inv.board_title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Invited by {inv.inviter_email}
                </p>
                <p className="text-xs text-muted-foreground">
                  Role: {inv.role} · Invited {new Date(inv.invited_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardFooter className="flex gap-2">
                <Button
                  variant="default"
                  onClick={() => handleAccept(inv.board_id, inv.id)}
                  disabled={respond.isPending}
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDecline(inv.board_id, inv.id)}
                  disabled={respond.isPending}
                >
                  Decline
                </Button>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
