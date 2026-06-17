import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Lock, LogIn, Mail } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import { errorMessage } from '../lib/api'

interface LoginLocationState {
  from?: {
    pathname?: string
  }
}

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as LoginLocationState | null)?.from?.pathname ?? '/dashboard'
  const [form, setForm] = useState({ login: '', password: '', remember: true })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await login(form)
      navigate(from, { replace: true })
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      footer={
        <>
          New to NovaMind AI?{' '}
          <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/register">
            Create an account
          </Link>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <FormField
          autoComplete="username"
          icon={<Mail size={18} aria-hidden="true" />}
          label="Email or username"
          name="login"
          onChange={(event) => setForm((current) => ({ ...current, login: event.target.value }))}
          placeholder="you@company.com"
          required
          value={form.login}
        />

        <FormField
          autoComplete="current-password"
          icon={<Lock size={18} aria-hidden="true" />}
          label="Password"
          name="password"
          onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Enter your password"
          required
          type="password"
          value={form.password}
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300">
            <input
              checked={form.remember}
              className="size-4 rounded border-white/20 bg-white/10 accent-cyan-300"
              onChange={(event) =>
                setForm((current) => ({ ...current, remember: event.target.checked }))
              }
              type="checkbox"
            />
            Remember me
          </label>
          <Link className="text-sm font-medium text-cyan-200 hover:text-cyan-100" to="/forgot-password">
            Forgot password?
          </Link>
        </div>

        <Button className="w-full" disabled={isSubmitting} icon={<LogIn size={18} />} type="submit">
          {isSubmitting ? 'Signing in' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  )
}
