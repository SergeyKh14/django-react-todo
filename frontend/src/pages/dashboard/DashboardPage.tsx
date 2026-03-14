import { CheckCircle2, ListTodo, Circle } from 'lucide-react'
import { useTask } from '@/hooks/useTask'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { StatsCard } from './components/StatsCard'

export function DashboardPage() {
  const { summary, isLoading, isError, error } = useTask()

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : 'Failed to load task summary'}
        </p>
      </div>
    )
  }

  const completed = summary?.completed ?? 0
  const pending = summary?.pending ?? 0
  const total = completed + pending

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total tasks" value={total} icon={ListTodo} />
        <StatsCard title="Completed" value={completed} icon={CheckCircle2} />
        <StatsCard title="Pending" value={pending} icon={Circle} />
      </div>
    </div>
  )
}
