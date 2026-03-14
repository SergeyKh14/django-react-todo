import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { RootState } from '@/store'
import { authService } from '@/services/authService'
import { queryKeys } from '@/lib/query/keys'

interface AuthLoaderProps {
  children: ReactNode
}

/**
 * When we have a token, run the "me" query so user data is in the React Query cache.
 * useAuth() reads from that cache; no Redux sync.
 */
export function AuthLoader({ children }: AuthLoaderProps) {
  const token = useSelector((state: RootState) => state.auth.token)

  useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.getMe(),
    enabled: !!token,
  })

  return <>{children}</>
}
