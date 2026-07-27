import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Lock, Mail, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react'
import { AuthCenteredLayout } from '../layouts/AuthCenteredLayout'
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'

export function ResetPasswordPage() {
  const { resetPassword, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [form, setForm] = useState({
    token: params.get('token') ?? '',
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Real-time password validations
  const hasMinLength = form.password.length >= 8
  const hasNumber = /\d/.test(form.password)
  const hasUppercase = /[A-Z]/.test(form.password)
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password)
  const passwordsMatch = form.password && form.password === form.password_confirmation
  const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasSpecial

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (!form.token) {
      setError('Please provide the reset token.')
      return
    }

    if (!form.email) {
      setError('Please provide your email address.')
      return
    }

    if (!isPasswordValid) {
      setError('Please satisfy all password requirements.')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await resetPassword(form)
      setIsSuccess(true)
      showToast('Password reset successfully!', 'success')
      
      // Cache email for convenience on login page
      sessionStorage.setItem('novamind.auth.email', form.email)
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  // Automatic redirect timer on success
  useEffect(() => {
    if (!isSuccess) return
    const timer = setTimeout(() => {
      navigate('/login', { state: { email: form.email }, replace: true })
    }, 4000)
    return () => clearTimeout(timer)
  }, [isSuccess, navigate, form.email])

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
              Password updated
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Your password has been reset successfully. You will be redirected to the login screen shortly.
            </p>
          </div>

          {/* Action */}
          <div className="pt-2">
            <button
              onClick={() => navigate('/login', { state: { email: form.email }, replace: true })}
              className="w-full flex items-center justify-center gap-2 min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
            >
              Go to Login
              <ArrowRight size={18} />
            </button>
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
            Create new password
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Enter the reset token sent to your email and set a new password.
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
            label="Reset token"
            name="token"
            type="text"
            value={form.token}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, token: e.target.value }))
              if (error) setError('')
            }}
            icon={<KeyRound size={18} />}
            required
            disabled={isLoading}
          />

          <FloatingLabelInput
            label="Email address"
            name="email"
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, email: e.target.value }))
              if (error) setError('')
            }}
            icon={<Mail size={18} />}
            required
            disabled={isLoading}
            autoComplete="email"
          />

          <FloatingLabelInput
            label="New Password"
            name="password"
            type="password"
            value={form.password}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password: e.target.value }))
              if (error) setError('')
            }}
            icon={<Lock size={18} />}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />

          {form.password && (
            <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-1.5 text-xs text-slate-400 select-none animate-fade-in-up">
              <p className="font-bold text-slate-300">Password requirements:</p>
              <div className="grid grid-cols-2 gap-2">
                <span className={hasMinLength ? 'text-emerald-400 font-medium' : ''}>• 8+ Characters</span>
                <span className={hasNumber ? 'text-emerald-400 font-medium' : ''}>• 1+ Number</span>
                <span className={hasUppercase ? 'text-emerald-400 font-medium' : ''}>• 1+ Uppercase</span>
                <span className={hasSpecial ? 'text-emerald-400 font-medium' : ''}>• 1+ Special Char</span>
              </div>
            </div>
          )}

          <FloatingLabelInput
            label="Confirm New Password"
            name="password_confirmation"
            type="password"
            value={form.password_confirmation}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, password_confirmation: e.target.value }))
              if (error) setError('')
            }}
            icon={<Lock size={18} />}
            required
            disabled={isLoading}
            autoComplete="new-password"
            error={form.password && form.password_confirmation && !passwordsMatch ? 'Passwords do not match' : undefined}
          />

          <button
            type="submit"
            disabled={isLoading || !form.token || !form.email || !isPasswordValid || !passwordsMatch}
            className="w-full flex items-center justify-center min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <span className="inline-block size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <div className="text-sm text-slate-450 text-slate-400 font-medium">
          <Link
            to="/login"
            className="hover:text-white transition"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </AuthCenteredLayout>
  )
}
