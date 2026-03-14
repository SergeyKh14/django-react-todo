import type { ReactNode } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { useAuth } from '@/hooks/useAuth'

interface PageWrapperProps {
  children: ReactNode
  withSidebar?: boolean
}

export function PageWrapper({ children, withSidebar = false }: PageWrapperProps) {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className={withSidebar && user ? 'flex' : ''}>
        {withSidebar && user && <Sidebar />}
        <main className={withSidebar && user ? 'flex-1 p-6' : 'p-6'}>
          {children}
        </main>
      </div>
    </div>
  )
}
