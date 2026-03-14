import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Board } from '@/types/board'

interface BoardListProps {
  boards: Board[]
}

export function BoardList({ boards }: BoardListProps) {
  if (boards.length === 0) {
    return (
      <p className="py-12 text-center text-muted-foreground">
        You have no boards yet. Create one to get started.
      </p>
    )
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <li key={board.id}>
          <Link to={`/board/${board.id}`} className="block h-full">
            <Card className="h-full transition-colors hover:bg-muted/50">
              <CardHeader>
                <CardTitle className="line-clamp-1">{board.title}</CardTitle>
                {board.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{board.description}</p>
                ) : null}
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  Updated {new Date(board.updated_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}
