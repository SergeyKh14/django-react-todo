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
import { inviteUserSchema, type InviteUserInput } from '@/schemas/invitation'
import { BoardMemberRole } from '@/types/board'

interface InviteUserModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite?: (email: string, role: BoardMemberRole) => void | Promise<void>
  isSubmitting?: boolean
  error?: string | null
}

const defaultValues: InviteUserInput = {
  email: '',
  role: BoardMemberRole.Member,
}

export function InviteUserModal({
  open,
  onOpenChange,
  onInvite,
  isSubmitting = false,
  error = null,
}: InviteUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteUserInput>({
    resolver: zodResolver(inviteUserSchema) as Resolver<InviteUserInput>,
    defaultValues,
  })

  useEffect(() => {
    if (!open) reset(defaultValues)
  }, [open, reset])

  const handleOpenChange = (next: boolean) => {
    if (!next) reset(defaultValues)
    onOpenChange(next)
  }

  const onSubmit = async (data: InviteUserInput) => {
    try {
      await onInvite?.(data.email, data.role)
      reset(defaultValues)
      onOpenChange(false)
    } catch {
      // Keep modal open so the parent can show error (e.g. inviteError)
    }
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalHeader>
            <ModalTitle>Invite to board</ModalTitle>
            <ModalDescription>
              Send an invitation by email. They can accept or decline from their
              invitations page.
            </ModalDescription>
          </ModalHeader>
          <div className="grid gap-4 py-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="grid gap-2">
              <label htmlFor="invite-email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                {...register('email')}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <label htmlFor="invite-role" className="text-sm font-medium">
                Role
              </label>
              <select
                id="invite-role"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...register('role')}
              >
                <option value={BoardMemberRole.Member}>Member</option>
                <option value={BoardMemberRole.Admin}>Admin</option>
              </select>
            </div>
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send invitation'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
