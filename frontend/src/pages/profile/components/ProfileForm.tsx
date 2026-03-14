import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { profileSchema, type ProfileInput } from '@/schemas/profile'

export function ProfileForm() {
  const { user, updateMe, isUpdatingProfile, updateProfileError } = useAuth()
  const [saved, setSaved] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
    },
  })

  const onSubmit = (data: ProfileInput) => {
    if (!user) return
    updateMe(
      {
        first_name: data.first_name || undefined,
        last_name: data.last_name || undefined,
      },
      {
        onSuccess: () => {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        },
      },
    )
  }

  useEffect(() => {
    if (user) {
      reset({
        first_name: user.first_name ?? '',
        last_name: user.last_name ?? '',
        email: user.email,
      })
    }
  }, [user, reset])

  if (!user) return null

  const errorMessage =
    updateProfileError instanceof Error
      ? updateProfileError.message
      : updateProfileError
        ? 'Failed to save profile. Please try again.'
        : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
      <div>
        <label htmlFor="first_name" className="mb-2 block text-sm font-medium">
          First name
        </label>
        <Input
          id="first_name"
          placeholder="John"
          autoComplete="given-name"
          {...register('first_name')}
        />
      </div>
      <div>
        <label htmlFor="last_name" className="mb-2 block text-sm font-medium">
          Last name
        </label>
        <Input
          id="last_name"
          placeholder="Doe"
          autoComplete="family-name"
          {...register('last_name')}
        />
      </div>
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isUpdatingProfile || isSubmitting}>
        {saved ? 'Saved' : 'Save changes'}
      </Button>
    </form>
  )
}
