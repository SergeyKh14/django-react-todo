import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'

export function ProfileCard() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Profile</h2>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>
          <span className="text-muted-foreground">Email:</span> {user.email}
        </p>
        {(user.first_name || user.last_name) && (
          <p>
            <span className="text-muted-foreground">Name:</span>{' '}
            {[user.first_name, user.last_name].filter(Boolean).join(' ')}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
