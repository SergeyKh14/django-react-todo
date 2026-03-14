import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { registerSchema, type RegisterInput } from '@/schemas/auth'
import { getPasswordCheckResults } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RegisterForm() {
  const [error, setError] = useState('')
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      confirm_password: '',
    },
  })

  const passwordValue = watch('password', '')
  const passwordChecks = getPasswordCheckResults(passwordValue)

  const onSubmit = async (data: RegisterInput) => {
    setError('')
    try {
      await registerUser({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="first_name" className="mb-2 block text-sm font-medium">
          First name
        </label>
        <Input
          id="first_name"
          type="text"
          placeholder="John"
          autoComplete="given-name"
          {...register('first_name')}
          aria-invalid={!!errors.first_name}
        />
        {errors.first_name && (
          <p className="mt-1 text-sm text-destructive">{errors.first_name.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="last_name" className="mb-2 block text-sm font-medium">
          Last name
        </label>
        <Input
          id="last_name"
          type="text"
          placeholder="Doe"
          autoComplete="family-name"
          {...register('last_name')}
          aria-invalid={!!errors.last_name}
        />
        {errors.last_name && (
          <p className="mt-1 text-sm text-destructive">{errors.last_name.message}</p>
        )}
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
          {...register('email')}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          aria-invalid={!!errors.password}
        />
        <ul className="mt-2 space-y-1.5" aria-live="polite">
          {passwordChecks.map(({ id, label, satisfied }) => (
            <li
              key={id}
              className={cn(
                'flex items-center gap-2 text-sm',
                satisfied ? 'text-green-600 dark:text-green-500' : 'text-muted-foreground'
              )}
            >
              {satisfied ? (
                <Check className="h-4 w-4 shrink-0" aria-hidden />
              ) : (
                <Circle className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span>{label}</span>
            </li>
          ))}
        </ul>
        {errors.password && (
          <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>
      <div>
        <label htmlFor="confirm_password" className="mb-2 block text-sm font-medium">
          Confirm password
        </label>
        <Input
          id="confirm_password"
          type="password"
          autoComplete="new-password"
          {...register('confirm_password')}
          aria-invalid={!!errors.confirm_password}
        />
        {errors.confirm_password && (
          <p className="mt-1 text-sm text-destructive">
            {errors.confirm_password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account…' : 'Create account'}
      </Button>
    </form>
  )
}
