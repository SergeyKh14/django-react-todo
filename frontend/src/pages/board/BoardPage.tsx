import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { BoardList } from './components/BoardList'
import { CreateBoardModal } from './components/CreateBoardModal'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { boardService } from '@/services/boardService'
import { queryKeys } from '@/lib/query/keys'

export function BoardPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    data: boardsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: queryKeys.boards.list(),
    queryFn: () => boardService.getList(),
    select: (data) => data.results,
  })

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description: string }) =>
      boardService.create({ title: payload.title, description: payload.description || undefined }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.boards.lists() })
      setCreateModalOpen(false)
    },
  })

  const handleCreateBoard = (title: string, description: string) => {
    createMutation.mutate({ title, description })
  }

  const boards = boardsData ?? []
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : 'Failed to load boards'
    : createMutation.error
      ? createMutation.error instanceof Error
        ? createMutation.error.message
        : 'Failed to create board'
      : null

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Boards</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create board
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <BoardList boards={boards} />
      <CreateBoardModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateBoard}
        isSubmitting={createMutation.isPending}
      />
    </div>
  )
}
