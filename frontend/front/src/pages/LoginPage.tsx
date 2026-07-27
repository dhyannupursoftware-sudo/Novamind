import { useState, type FormEvent, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Lock, ArrowLeft, Send } from 'lucide-react'
import { AuthCenteredLayout } from '../layouts/AuthCenteredLayout'
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Retain email from routing state or sessionStorage
  const email = (location.state as any)?.email || sessionStorage.getItem('novamind.auth.email') || ''
  const from = (location.state as any)?.from?.pathname ?? '/dashboard'

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Redirect back to welcome screen if no email is found
  useEffect(() => {
    if (!email) {
      navigate('/', { replace: true })
    }
  }, [email, navigate])

  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!password) return

    setIsLoading(true)
    setError('')

    try {
      await login({
        login: email,
        password,
        remember,
      })
      showToast('Welcome back!', 'success')
      navigate(from, { replace: true })
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  function handleOneTimeCode() {
    showToast('Sending one-time code...', 'info')
    setTimeout(() => {
      showToast('One-time code logins are currently not enabled for this workspace.', 'info')
    }, 800)
  }

  return (
    <AuthCenteredLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Enter your password
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Provide your secure password to access NovaMind AI.
          </p>
        </div>

        {/* Email display and Edit */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.01] text-left select-none">
          <div className="flex flex-col min-w-0 pr-2">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Email address</span>
            <span className="text-sm font-semibold text-slate-300 truncate">{email}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/', { state: { from } })}
            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition cursor-pointer shrink-0 ml-2 border-none bg-transparent p-0"
          >
            Edit
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-left animate-fade-in-up">
              {error}
            </div>
          )}

          <FloatingLabelInput
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError('')
            }}
            icon={<Lock size={18} />}
            required
            disabled={isLoading}
            autoComplete="current-password"
            autoFocus
          />

          <div className="flex items-center justify-between px-1">
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
            >
              Forgot password?
            </Link>

            <label className="inline-flex items-center gap-2 text-xs text-slate-300 select-none cursor-pointer">
              <input
                checked={remember}
                className="size-3.5 rounded border-white/20 bg-white/10 accent-indigo-500 cursor-pointer"
                onChange={(e) => setRemember(e.target.checked)}
                type="checkbox"
              />
              Remember me
            </label>
          </div>

          <button
            type="submit"
            disabled={isLoading || !password}
            className="w-full flex items-center justify-center min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <span className="inline-block size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Continue'
            )}
          </button>
        </form>

        <div className="text-sm text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition duration-150"
            state={{ email, from }}
          >
            Sign up
          </Link>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-white/[0.06]"></div>
          <span className="flex-shrink mx-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            OR
          </span>
          <div className="flex-grow border-t border-white/[0.06]"></div>
        </div>

        {/* Social / One-time-code buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleOneTimeCode}
            className="w-full flex items-center justify-center gap-3 min-h-[50px] px-4 rounded-full border border-white/10 bg-white/[0.01] hover:bg-white/[0.05] text-sm font-semibold text-slate-200 transition-all duration-200 active:scale-[0.98] cursor-pointer select-none"
          >
            <Send size={16} className="text-slate-400 shrink-0" />
            Log in with a one-time code
          </button>

          <button
            type="button"
            onClick={() => navigate('/', { state: { from } })}
            className="w-full flex items-center justify-center gap-2 min-h-[50px] px-4 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all duration-200 active:scale-[0.98] cursor-pointer select-none border border-transparent"
          >
            <ArrowLeft size={16} className="shrink-0" />
            Back to email
          </button>
        </div>
      </div>
    </AuthCenteredLayout>
  )
}
