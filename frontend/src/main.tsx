import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { queryClient } from '@/lib/query/client'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AuthLoader } from '@/components/common/AuthLoader'
import './index.css'
import App from './App.tsx'

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found')

createRoot(rootEl).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <AuthLoader>
            <App />
          </AuthLoader>
        </Provider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
)
