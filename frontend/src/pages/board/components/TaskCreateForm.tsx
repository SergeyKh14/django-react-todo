import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { taskCreateSchema, type TaskCreateInput } from '@/schemas/task'
import type { TaskCreatePayload } from '@/types/task'
import {
  TaskPriority,
  TaskStatus,
  type TaskPriority as TaskPriorityType,
  type TaskStatus as TaskStatusType,
} from '@/types/task'
import type { BoardMember } from '@/types/board'

interface TaskCreateFormProps {
  onCreate: (data: TaskCreatePayload) => void
  defaultStatus?: TaskStatusType
  disabled?: boolean
  members?: BoardMember[]
}

const PRIORITY_LABELS: Record<TaskPriorityType, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export function TaskCreateForm({
  onCreate,
  defaultStatus,
  disabled = false,
  members = [],
}: TaskCreateFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TaskCreateInput>({
    resolver: zodResolver(taskCreateSchema) as Resolver<TaskCreateInput>,
    defaultValues: {
      title: '',
      description: '',
      status: defaultStatus ?? TaskStatus.Todo,
      priority: TaskPriority.Medium,
      due_date: '',
      assigned_to: '',
    },
  })

  const onSubmit = (data: TaskCreateInput) => {
    const payload: TaskCreatePayload = {
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      due_date: data.due_date || undefined,
      assigned_to: data.assigned_to || null,
    }
    onCreate(payload)
    reset({
      title: '',
      description: '',
      status: defaultStatus ?? TaskStatus.Todo,
      priority: TaskPriority.Medium,
      due_date: '',
      assigned_to: '',
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-2">
        <label
          htmlFor="task-title"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Title
        </label>
        <Input
          id="task-title"
          placeholder="Add a task..."
          disabled={disabled}
          {...register('title')}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <label
          htmlFor="task-description"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Description
        </label>
        <Textarea
          id="task-description"
          placeholder="Optional description"
          className="min-h-[60px]"
          disabled={disabled}
          {...register('description')}
        />
      </div>
      <div className="space-y-2">
        <label
          htmlFor="task-status"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Status
        </label>
        <select
          id="task-status"
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('status')}
        >
          <option value={TaskStatus.Todo}>To Do</option>
          <option value={TaskStatus.InProgress}>In Progress</option>
          <option value={TaskStatus.Done}>Done</option>
        </select>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="task-priority"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Priority
        </label>
        <select
          id="task-priority"
          disabled={disabled}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          {...register('priority')}
        >
          <option value={TaskPriority.Low}>{PRIORITY_LABELS.low}</option>
          <option value={TaskPriority.Medium}>{PRIORITY_LABELS.medium}</option>
          <option value={TaskPriority.High}>{PRIORITY_LABELS.high}</option>
        </select>
      </div>
      <div className="space-y-2">
        <label
          htmlFor="task-due-date"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Due date
        </label>
        <Input
          id="task-due-date"
          type="date"
          disabled={disabled}
          {...register('due_date')}
        />
      </div>
      {members.length > 0 && (
        <div className="space-y-2">
          <label
            htmlFor="task-assigned-to"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Assigned to
          </label>
          <select
            id="task-assigned-to"
            disabled={disabled}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register('assigned_to')}
          >
            <option value="">Unassigned</option>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {m.first_name || m.last_name
                  ? [m.first_name, m.last_name].filter(Boolean).join(' ')
                  : m.email}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={disabled || isSubmitting}>
          Add task
        </Button>
      </div>
    </form>
  )
}
