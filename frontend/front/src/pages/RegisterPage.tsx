import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AtSign, Lock, Sparkles, UserRound } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import { errorMessage } from '../lib/api'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    remember: true,
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await register(form)
      navigate('/dashboard', { replace: true })
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Create your workspace"
      footer={
        <>
          Already have an account?{' '}
          <Link className="font-semibold text-indigo-400 hover:text-indigo-300" to="/login">
            Sign in
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
          autoComplete="name"
          icon={<UserRound size={18} aria-hidden="true" />}
          label="Full name"
          name="name"
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Dhyan Patel"
          required
          value={form.name}
        />

        <FormField
          autoComplete="username"
          icon={<AtSign size={18} aria-hidden="true" />}
          label="Username"
          name="username"
          onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
          placeholder="dhyan"
          required
          value={form.username}
        />

        <FormField
          autoComplete="email"
          icon={<AtSign size={18} aria-hidden="true" />}
          label="Email"
          name="email"
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder="you@company.com"
          required
          type="email"
          value={form.email}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            autoComplete="new-password"
            icon={<Lock size={18} aria-hidden="true" />}
            label="Password"
            name="password"
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
            placeholder="Create password"
            required
            type="password"
            value={form.password}
          />

          <FormField
            autoComplete="new-password"
            icon={<Lock size={18} aria-hidden="true" />}
            label="Confirm"
            name="password_confirmation"
            onChange={(event) =>
              setForm((current) => ({ ...current, password_confirmation: event.target.value }))
            }
            placeholder="Repeat password"
            required
            type="password"
            value={form.password_confirmation}
          />
        </div>

        <label className="inline-flex items-center gap-2 text-sm text-slate-300">
          <input
            checked={form.remember}
            className="size-4 rounded border-white/20 bg-white/10 accent-indigo-500"
            onChange={(event) =>
              setForm((current) => ({ ...current, remember: event.target.checked }))
            }
            type="checkbox"
          />
          Remember me
        </label>

        <Button className="w-full" disabled={isSubmitting} icon={<Sparkles size={18} />} type="submit">
          {isSubmitting ? 'Creating account' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
