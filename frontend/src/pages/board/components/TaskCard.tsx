import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, User } from 'lucide-react'
import { Trash2 } from 'lucide-react'
import type { Task } from '@/types/task'
import { Button } from '@/components/ui/button'

interface TaskCardProps {
  task: Task
  onDelete?: () => void
}

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

function formatDueDate(isoDate: string): string {
  const d = new Date(isoDate + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: transform ? CSS.Transform.toString(transform) : undefined,
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        cursor-grab rounded-lg border bg-card px-3 py-2.5 text-sm shadow-sm
        transition-shadow active:cursor-grabbing
        hover:shadow-md
        ${isDragging ? 'z-50 opacity-90 shadow-lg ring-2 ring-primary/20' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-medium text-card-foreground">{task.title}</p>
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
      {task.description ? (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      ) : null}
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
        <span>{STATUS_LABELS[task.status] ?? task.status}</span>
        {task.due_date ? (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3 shrink-0" aria-hidden />
            Due {formatDueDate(task.due_date)}
          </span>
        ) : null}
        <span className="flex items-center gap-1">
          <User className="h-3 w-3 shrink-0" aria-hidden />
          {task.assigned_to_email ?? 'Unassigned'}
        </span>
      </div>
    </div>
  )
}
