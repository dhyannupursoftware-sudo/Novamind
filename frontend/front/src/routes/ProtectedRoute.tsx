import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { BrandMark } from '../components/BrandMark'
import { useAuth } from '../context/useAuth'
import { ChatProvider } from '../context/ChatContext'

export function ProtectedRoute() {
  const { isAuthenticated, isBooting } = useAuth()
  const location = useLocation()

  if (isBooting) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
        <div className="glass flex items-center gap-4 rounded-lg px-5 py-4">
          <BrandMark compact />
          <span className="text-sm text-slate-300">Loading NovaMind AI</span>
        </div>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return (
    <ChatProvider>
      <Outlet />
    </ChatProvider>
  )
}
