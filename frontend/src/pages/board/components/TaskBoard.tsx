import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useState } from 'react'
import type { BoardMember } from '@/types/board'
import type { Task, TaskCreatePayload, TaskStatus } from '@/types/task'
import { TASK_COLUMNS } from '@/types/task'
import { TaskColumn } from './TaskColumn'

interface TaskBoardProps {
  tasks: Task[]
  members?: BoardMember[]
  onTasksChange?: (tasks: Task[]) => void
  onTaskUpdate?: (args: { id: string; patch: { status?: TaskStatus; order?: number } }) => void
  onTaskCreate?: (data: TaskCreatePayload) => void
  onTaskDelete?: (id: string) => void
}

function groupByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups = {
    todo: [] as Task[],
    in_progress: [] as Task[],
    done: [] as Task[],
  }
  const ordered = [...tasks].sort((a, b) => a.order - b.order)
  for (const task of ordered) {
    const status = task.status as TaskStatus
    if (status in groups) {
      groups[status].push(task)
    }
  }
  return groups
}

/** Rebuild flat tasks from column groups, with order = index in column. */
function flattenWithOrder(byStatus: Record<TaskStatus, Task[]>): Task[] {
  const result: Task[] = []
  for (const status of TASK_COLUMNS) {
    const list = byStatus[status] ?? []
    list.forEach((task, index) => {
      result.push({ ...task, status, order: index })
    })
  }
  return result
}

export function TaskBoard({
  tasks,
  members = [],
  onTasksChange,
  onTaskUpdate,
  onTaskCreate,
  onTaskDelete,
}: TaskBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const byStatus = groupByStatus(tasks)
  const originalById = new Map<string, { status: TaskStatus; order: number }>()
  tasks.forEach((task) => {
    originalById.set(task.id, {
      status: task.status as TaskStatus,
      order: task.order,
    })
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) return

    const activeIdStr = String(active.id)
    const overIdStr = String(over.id)

    const findColumnAndIndex = (taskId: string): { status: TaskStatus; index: number } | null => {
      for (const status of TASK_COLUMNS) {
        const list = byStatus[status] ?? []
        const index = list.findIndex((t) => t.id === taskId)
        if (index !== -1) return { status, index }
      }
      return null
    }

    const activePos = findColumnAndIndex(activeIdStr)
    if (!activePos) return

    const isOverColumn = TASK_COLUMNS.includes(overIdStr as TaskStatus)

    const applyAndNotify = (nextByStatus: Record<TaskStatus, Task[]>) => {
      const next = flattenWithOrder(nextByStatus)
      onTasksChange?.(next)

      if (onTaskUpdate) {
        next.forEach((task) => {
          const original = originalById.get(task.id)
          if (!original) return
          const patch: { status?: TaskStatus; order?: number } = {}
          if (original.status !== task.status) {
            patch.status = task.status
          }
          if (original.order !== task.order) {
            patch.order = task.order
          }
          if (patch.status !== undefined || patch.order !== undefined) {
            onTaskUpdate({ id: task.id, patch })
          }
        })
      }
    }

    if (isOverColumn) {
      const newStatus = overIdStr as TaskStatus
      const fromList = [...(byStatus[activePos.status] ?? [])]
      const [moved] = fromList.splice(activePos.index, 1)
      const toList = [...(byStatus[newStatus] ?? [])]
      toList.push({ ...moved, status: newStatus, order: toList.length })
      const nextByStatus = { ...byStatus, [activePos.status]: fromList, [newStatus]: toList }
      applyAndNotify(nextByStatus)
      return
    }

    const overPos = findColumnAndIndex(overIdStr)
    if (!overPos) return

    if (activePos.status === overPos.status) {
      const list = [...(byStatus[activePos.status] ?? [])]
      const reordered = arrayMove(list, activePos.index, overPos.index)
      const nextByStatus = { ...byStatus, [activePos.status]: reordered }
      applyAndNotify(nextByStatus)
    } else {
      const fromList = [...(byStatus[activePos.status] ?? [])]
      const toList = [...(byStatus[overPos.status] ?? [])]
      const [moved] = fromList.splice(activePos.index, 1)
      const updated = { ...moved, status: overPos.status, order: overPos.index }
      toList.splice(overPos.index, 0, updated)
      const nextByStatus = {
        ...byStatus,
        [activePos.status]: fromList,
        [overPos.status]: toList,
      }
      applyAndNotify(nextByStatus)
    }
  }

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {TASK_COLUMNS.map((status) => (
          <TaskColumn
            key={status}
            status={status}
            tasks={byStatus[status] ?? []}
            members={members}
            onCreateTask={onTaskCreate}
            onDeleteTask={onTaskDelete}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-72 rounded-lg border bg-card px-3 py-2.5 text-sm shadow-lg ring-2 ring-primary/20">
            <p className="font-medium text-card-foreground">{activeTask.title}</p>
            {activeTask.description ? (
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {activeTask.description}
              </p>
            ) : null}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
