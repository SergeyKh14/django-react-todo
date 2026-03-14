import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { GuestRoute } from '@/components/common/GuestRoute'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { BoardPage } from '@/pages/board/BoardPage'
import { BoardDetailPage } from '@/pages/board/BoardDetailPage'
import { InvitationsPage } from '@/pages/invitations/InvitationsPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <PageWrapper>
        <Navigate to="/login" replace />
      </PageWrapper>
    ),
  },
  {
    path: '/login',
    element: (
      <PageWrapper>
        <GuestRoute>
          <LoginPage />
        </GuestRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/register',
    element: (
      <PageWrapper>
        <GuestRoute>
          <RegisterPage />
        </GuestRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <PageWrapper withSidebar>
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/board',
    element: (
      <PageWrapper withSidebar>
        <ProtectedRoute>
          <BoardPage />
        </ProtectedRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/board/:boardId',
    element: (
      <PageWrapper withSidebar>
        <ProtectedRoute>
          <BoardDetailPage />
        </ProtectedRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/invitations',
    element: (
      <PageWrapper withSidebar>
        <ProtectedRoute>
          <InvitationsPage />
        </ProtectedRoute>
      </PageWrapper>
    ),
  },
  {
    path: '/profile',
    element: (
      <PageWrapper withSidebar>
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      </PageWrapper>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])

export function AppRoutes() {
  return <RouterProvider router={router} />
}
