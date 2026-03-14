import { useEffect } from 'react'
import type { Resolver } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createBoardSchema, type CreateBoardInput } from '@/schemas/board'

interface CreateBoardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate?: (title: string, description: string) => void | Promise<void>
  isSubmitting?: boolean
}

const defaultValues: CreateBoardInput = {
  title: '',
  description: '',
}

export function CreateBoardModal({
  open,
  onOpenChange,
  onCreate,
  isSubmitting = false,
}: CreateBoardModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateBoardInput>({
    resolver: zodResolver(createBoardSchema) as Resolver<CreateBoardInput>,
    defaultValues,
  })

  useEffect(() => {
    if (!open) reset(defaultValues)
  }, [open, reset])

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues)
    onOpenChange(next)
  }

  const onSubmit = async (data: CreateBoardInput) => {
    await onCreate?.(data.title, data.description ?? '')
    reset(defaultValues)
    onOpenChange(false)
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>Create board</ModalTitle>
            <ModalDescription>
              Add a new board to organize tasks with your team.
            </ModalDescription>
          </ModalHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="board-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="board-title"
                placeholder="e.g. Marketing Q1"
                {...register('title')}
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="board-description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Input
                id="board-description"
                placeholder="Short description of the board"
                {...register('description')}
              />
            </div>
          </div>
          <ModalFooter showCloseButton>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create board'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
