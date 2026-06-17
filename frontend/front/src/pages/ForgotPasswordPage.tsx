import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Send } from 'lucide-react'
import { AuthLayout } from '../layouts/AuthLayout'
import { Button } from '../components/ui/Button'
import { FormField } from '../components/ui/FormField'
import { useAuth } from '../context/useAuth'
import { errorMessage } from '../lib/api'

export function ForgotPasswordPage() {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      await forgotPassword(email)
      setMessage('Reset link sent. Check your mail log or inbox.')
    } catch (caughtError) {
      setError(errorMessage(caughtError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      title="Reset access"
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
        {message && (
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <FormField
          autoComplete="email"
          icon={<Mail size={18} aria-hidden="true" />}
          label="Email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@company.com"
          required
          type="email"
          value={email}
        />

        <Button className="w-full" disabled={isSubmitting} icon={<Send size={18} />} type="submit">
          {isSubmitting ? 'Sending link' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  )
}
