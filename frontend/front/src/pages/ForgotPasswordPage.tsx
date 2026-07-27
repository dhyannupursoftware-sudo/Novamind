import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { AuthCenteredLayout } from '../layouts/AuthCenteredLayout'
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'

export function ForgotPasswordPage() {
  const { forgotPassword, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const initialEmail = (location.state as any)?.email || sessionStorage.getItem('novamind.auth.email') || ''
  
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email) return

    // Simple email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await forgotPassword(email)
      setIsSuccess(true)
      showToast('Reset link generated successfully!', 'success')
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <AuthCenteredLayout>
        <div className="space-y-6">
          {/* Success Icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 select-none animate-fade-in-up">
            <CheckCircle2 size={32} />
          </div>

          {/* Success Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
              Check your email
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              We've sent a password reset token/link to <span className="text-slate-200 font-semibold">{email}</span>. Check your inbox or Laravel backend terminal logs.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Link
              to={`/reset-password?email=${encodeURIComponent(email)}`}
              className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
            >
              <KeyRound size={18} />
              Enter Token Manually
            </Link>

            <Link
              to="/login"
              state={{ email }}
              className="w-full flex items-center justify-center gap-2 min-h-[50px] px-4 rounded-full bg-white/5 hover:bg-white/10 text-sm font-semibold text-slate-300 transition-all duration-200 active:scale-[0.98] cursor-pointer select-none border border-transparent"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        </div>
      </AuthCenteredLayout>
    )
  }

  return (
    <AuthCenteredLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Reset password
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Enter your email and we'll send you a recovery link to restore access.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 animate-fade-in-up">
              {error}
            </div>
          )}

          <FloatingLabelInput
            label="Email address"
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (error) setError('')
            }}
            icon={<Mail size={18} />}
            required
            disabled={isLoading}
            autoComplete="email"
            autoFocus
          />

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex items-center justify-center min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <span className="inline-block size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Send Link'
            )}
          </button>
        </form>

        <div className="text-sm text-slate-450 text-slate-400 font-medium">
          <Link
            to="/login"
            state={{ email }}
            className="inline-flex items-center gap-1.5 hover:text-white transition"
          >
            <ArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </AuthCenteredLayout>
  )
}
