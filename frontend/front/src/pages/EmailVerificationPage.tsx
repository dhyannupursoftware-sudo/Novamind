import { useState, useEffect, useRef, type ClipboardEvent, type KeyboardEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react'
import { AuthCenteredLayout } from '../layouts/AuthCenteredLayout'
import { useAuth } from '../context/useAuth'
import { useToast } from '../context/ToastContext'

export function EmailVerificationPage() {
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const email = (location.state as any)?.email || sessionStorage.getItem('novamind.auth.email') || 'your email'

  const [otp, setOtp] = useState<string[]>(Array(6).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const inputRefs = useRef<HTMLInputElement[]>([])

  // Resend Timer Countdown
  useEffect(() => {
    if (resendTimer <= 0) return
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [resendTimer])

  // Handle Input Changes
  function handleChange(value: string, index: number) {
    if (isNaN(Number(value))) return // Allow numbers only

    const newOtp = [...otp]
    newOtp[index] = value.substring(value.length - 1) // Keep last char
    setOtp(newOtp)

    // Shift focus to next input if filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle Backspace and Arrow Keys
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>, index: number) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace if empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle Paste
  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').trim()
    if (!/^\d{6}$/.test(pastedData)) return // Ensure exactly 6 digits

    const newOtp = pastedData.split('')
    setOtp(newOtp)
    inputRefs.current[5]?.focus() // Focus the last input
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const code = otp.join('')
    if (code.length < 6) return

    setIsLoading(true)

    // Simulate OTP Verification
    setTimeout(() => {
      setIsLoading(false)
      showToast('Email verified successfully! Logging you in...', 'success')
      navigate('/dashboard', { replace: true })
    }, 1500)
  }

  function handleResend() {
    if (resendTimer > 0) return
    setResendTimer(60)
    showToast('A new verification code has been sent!', 'success')
  }

  const isComplete = otp.every((val) => val !== '')

  return (
    <AuthCenteredLayout>
      <div className="space-y-6">
        {/* Shield Icon */}
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 select-none animate-fade-in-up">
          <ShieldCheck size={32} />
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Verify your email
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed font-medium">
            We sent a verification code to <span className="text-slate-200 font-semibold">{email}</span>. Enter the code below to secure your account.
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-between gap-2.5 max-w-[320px] mx-auto">
            {otp.map((value, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  if (el) inputRefs.current[idx] = el
                }}
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(e.target.value, idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
                onPaste={idx === 0 ? handlePaste : undefined}
                className="size-11 sm:size-12 rounded-xl border border-white/10 bg-white/[0.02] text-center text-xl font-bold focus:outline-none focus:border-indigo-400 focus:bg-white/[0.04] focus:ring-1 focus:ring-indigo-400/30 transition-all"
                disabled={isLoading}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || !isComplete}
            className="w-full flex items-center justify-center min-h-[52px] rounded-full bg-white hover:bg-slate-100 text-black font-semibold text-base transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_4px_12px_rgba(255,255,255,0.1)]"
          >
            {isLoading ? (
              <span className="inline-block size-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        {/* Resend Actions */}
        <div className="flex flex-col items-center gap-4 pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`
              flex items-center gap-1.5 text-xs font-semibold select-none cursor-pointer transition
              ${resendTimer > 0 ? 'text-slate-500 cursor-not-allowed' : 'text-indigo-400 hover:text-indigo-300'}
            `}
          >
            <RefreshCw size={12} className={resendTimer > 0 ? '' : 'animate-pulse'} />
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend verification code'}
          </button>

          <div className="text-sm text-slate-450 text-slate-400 font-medium">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 hover:text-white transition"
            >
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthCenteredLayout>
  )
}
