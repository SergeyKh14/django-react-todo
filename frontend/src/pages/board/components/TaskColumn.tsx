import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { BoardMember } from '@/types/board'
import type { Task, TaskCreatePayload, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { TaskCreateForm } from './TaskCreateForm'
import { Button } from '@/components/ui/button'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'

const COLUMN_TITLES: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
}

interface TaskColumnProps {
  status: TaskStatus
  tasks: Task[]
  members?: BoardMember[]
  onCreateTask?: (data: TaskCreatePayload) => void
  onDeleteTask?: (id: string) => void
}

export function TaskColumn({ status, tasks, members = [], onCreateTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { type: 'column', status },
  })

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const taskIds = tasks.map((t) => t.id)

  return (
    <div
      ref={setNodeRef}
      className={`
        flex min-h-[280px] w-72 shrink-0 flex-col rounded-xl border bg-muted/30
        p-3 transition-colors
        ${isOver ? 'ring-2 ring-primary/30 bg-muted/50' : ''}
      `}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {COLUMN_TITLES[status]}
        </h3>
        {onCreateTask && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsCreateOpen(true)}
          >
            Create
          </Button>
        )}
      </div>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask ? () => onDeleteTask(task.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
      {onCreateTask && (
        <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>Create task</ModalTitle>
            </ModalHeader>
            <TaskCreateForm
              defaultStatus={status}
              members={members}
              onCreate={(data) => {
                onCreateTask(data)
                setIsCreateOpen(false)
              }}
            />
            <ModalFooter />
          </ModalContent>
        </Modal>
      )}
    </div>
  )
}
