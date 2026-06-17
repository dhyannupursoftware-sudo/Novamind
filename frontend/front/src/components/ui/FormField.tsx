import type { InputHTMLAttributes, ReactNode } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  icon?: ReactNode
  label: string
}

export function FormField({
  className = '',
  error,
  icon,
  id,
  label,
  ...props
}: FormFieldProps) {
  const inputId = id ?? props.name

  return (
    <label className="block space-y-2" htmlFor={inputId}>
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <span className="relative block">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3 flex -translate-y-1/2 text-slate-500">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={`input-glass min-h-12 w-full rounded-lg px-3 text-sm transition placeholder:text-slate-500 ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </span>
      {error && <span className="block text-sm text-rose-200">{error}</span>}
    </label>
  )
}
