import { useState, type FormEvent, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { User, Mail, Lock, CheckCircle2, XCircle } from 'lucide-react'
import { AuthCenteredLayout } from '../layouts/AuthCenteredLayout'
import { FloatingLabelInput } from '../components/ui/FloatingLabelInput'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'
import { errorMessage } from '../lib/api'

export function RegisterPage() {
  const { register, isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Pre-fill email from welcome screen state if available
  const initialEmail = (location.state as any)?.email || sessionStorage.getItem('novamind.auth.email') || ''

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const [name, setName] = useState('')
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Password Validation States
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)
  const passwordsMatch = password && password === confirmPassword

  const isPasswordValid = hasMinLength && hasNumber && hasUppercase && hasSpecial

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    
    if (!isPasswordValid) {
      setError('Please satisfy all password requirements.')
      return
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.')
      return
    }

    if (!agreeTerms) {
      setError('You must accept the Terms and Conditions to proceed.')
      return
    }

    setIsLoading(true)
    setError('')

    // Generate a unique username for backend compatibility
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)
    const randomSuffix = Math.random().toString(36).substring(2, 6)
    const generatedUsername = `${emailPrefix}_${randomSuffix}`

    try {
      await register({
        name,
        username: generatedUsername,
        email,
        password,
        password_confirmation: confirmPassword,
        remember: true,
      })
      showToast('Account created successfully!', 'success')
      navigate('/dashboard', { replace: true })
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthCenteredLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Create an account
          </h1>
          <p className="text-sm text-slate-400 font-medium">
            Get started with NovaMind AI.
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
            label="Full Name"
            name="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            icon={<User size={18} />}
            required
            disabled={isLoading}
            autoComplete="name"
            autoFocus={!email}
          />

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
            autoFocus={!!email}
          />

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
            autoComplete="new-password"
          />

          {/* Password strength indicators */}
          {password && (
            <div className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-2xl space-y-2 text-xs text-slate-400 select-none animate-fade-in-up">
              <p className="font-bold text-slate-300">Password requirements:</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-1.5">
                  {hasMinLength ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <XCircle size={13} className="text-slate-500" />
                  )}
                  <span className={hasMinLength ? 'text-emerald-400 font-medium' : ''}>8+ Characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasNumber ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <XCircle size={13} className="text-slate-500" />
                  )}
                  <span className={hasNumber ? 'text-emerald-400 font-medium' : ''}>1+ Number</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasUppercase ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <XCircle size={13} className="text-slate-500" />
                  )}
                  <span className={hasUppercase ? 'text-emerald-400 font-medium' : ''}>1+ Uppercase</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {hasSpecial ? (
                    <CheckCircle2 size={13} className="text-emerald-400" />
                  ) : (
                    <XCircle size={13} className="text-slate-500" />
                  )}
                  <span className={hasSpecial ? 'text-emerald-400 font-medium' : ''}>1+ Special Character</span>
                </div>
              </div>
            </div>
          )}

          <FloatingLabelInput
            label="Confirm Password"
            name="password_confirmation"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              if (error) setError('')
            }}
            icon={<Lock size={18} />}
            required
            disabled={isLoading}
            autoComplete="new-password"
            error={password && confirmPassword && !passwordsMatch ? 'Passwords do not match' : undefined}
          />

          {/* Accept terms */}
          <label className="flex items-start gap-2.5 px-1 py-1 text-xs text-slate-400 select-none cursor-pointer">
            <input
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked)
                if (error) setError('')
              }}
              className="mt-0.5 size-3.5 rounded border-white/20 bg-white/10 accent-indigo-500 cursor-pointer"
              type="checkbox"
              required
            />
            <span className="leading-normal font-medium">
              I agree to the <span className="text-indigo-400 hover:underline">Terms of Service</span> and{' '}
              <span className="text-indigo-400 hover:underline">Privacy Policy</span>.
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading || !name || !email || !agreeTerms || !isPasswordValid || !passwordsMatch}
            className="w-full flex items-center justify-center min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <span className="inline-block size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="text-sm text-slate-450 text-slate-400 font-medium">
          Already have an account?{' '}
          <Link
            to="/"
            className="text-indigo-400 hover:text-indigo-300 font-semibold transition duration-150"
          >
            Sign in
          </Link>
        </div>
      </div>
    </AuthCenteredLayout>
  )
}
