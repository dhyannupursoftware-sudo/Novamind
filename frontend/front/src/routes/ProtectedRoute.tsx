import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { ChatProvider } from '../context/ChatContext'

export function ProtectedRoute() {
  const { isAuthenticated, isBooting } = useAuth()
  const location = useLocation()

  if (isBooting) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#171717] text-white">
        <div className="flex items-center gap-4 bg-[#212121] rounded-2xl border border-white/5 px-6 py-4 shadow-xl select-none">
          <Loader2 className="animate-spin text-indigo-400" size={18} />
          <span className="text-sm text-slate-300 font-medium">Loading NovaMind AI</span>
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
