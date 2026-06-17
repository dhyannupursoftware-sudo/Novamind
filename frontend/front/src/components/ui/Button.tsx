import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: ReactNode
  variant?: ButtonVariant
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'border-cyan-300/60 bg-cyan-300 text-slate-950 hover:bg-cyan-200 disabled:bg-cyan-300/50',
  secondary:
    'border-white/12 bg-white/10 text-slate-100 hover:bg-white/15 disabled:text-slate-500',
  ghost:
    'border-transparent bg-transparent text-slate-300 hover:bg-white/10 hover:text-white disabled:text-slate-600',
  danger:
    'border-rose-300/30 bg-rose-400/12 text-rose-100 hover:bg-rose-400/18 disabled:text-rose-300/50',
}

export function Button({
  children,
  className = '',
  icon,
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}
