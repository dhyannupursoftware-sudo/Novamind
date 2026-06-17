import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { KeyRound, Lock, Mail } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import { errorMessage } from '../lib/api'

export function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    token: params.get('token') ?? '',
    email: params.get('email') ?? '',
    password: '',
    password_confirmation: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await resetPassword(form)
      navigate('/login', { replace: true })
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Set new password"
      footer={
        <Link className="font-semibold text-cyan-200 hover:text-cyan-100" to="/login">
          Back to sign in
        </Link>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-lg border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        <FormField
          icon={<KeyRound size={18} aria-hidden="true" />}
          label="Reset token"
          name="token"
          onChange={(event) => setForm((current) => ({ ...current, token: event.target.value }))}
          required
          value={form.token}
        />

        <FormField
          autoComplete="email"
          icon={<Mail size={18} aria-hidden="true" />}
          label="Email"
          name="email"
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
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
            required
            type="password"
            value={form.password_confirmation}
          />
        </div>

        <Button className="w-full" disabled={isSubmitting} icon={<Lock size={18} />} type="submit">
          {isSubmitting ? 'Updating password' : 'Update password'}
        </Button>
      </form>
    </AuthLayout>
  )
}
