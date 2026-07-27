import { useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface FloatingLabelInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> {
  label: string
  error?: string
  icon?: ReactNode
}

export function FloatingLabelInput({
  label,
  error,
  icon,
  id,
  type = 'text',
  value,
  onFocus,
  onBlur,
  className = '',
  ...props
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const inputId = id ?? props.name ?? Math.random().toString(36).substring(2, 9)
  const hasValue = value !== undefined && value !== null && value.toString().length > 0
  const isFloating = isFocused || hasValue

  const isPassword = type === 'password'
  const actualType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="space-y-1.5 w-full text-left">
      <div className="relative flex items-center">
        {icon && (
          <span className="pointer-events-none absolute left-4 text-slate-450 transition-colors duration-200">
            {icon}
          </span>
        )}
        
        <input
          id={inputId}
          type={actualType}
          value={value}
          onFocus={(e) => {
            setIsFocused(true)
            onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            onBlur?.(e)
          }}
          className={`
            w-full min-h-[58px] rounded-2xl border bg-white/[0.02] px-4 pt-5 pb-1.5 text-base text-slate-100 placeholder-transparent transition-all duration-200 focus:outline-none focus:bg-white/[0.04]
            ${error ? 'border-rose-500/50 focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30' : 'border-white/10 focus:border-indigo-400/80 focus:ring-1 focus:ring-indigo-400/30'}
            ${icon ? 'pl-11' : 'pl-4'}
            ${isPassword ? 'pr-12' : 'pr-4'}
            ${className}
          `}
          placeholder={label}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={inputId}
          className={`
            pointer-events-none absolute transition-all duration-200 origin-left font-medium select-none
            ${icon ? 'left-11' : 'left-4'}
            ${isFloating 
              ? 'translate-y-[-11px] scale-[0.78] text-indigo-400 font-semibold' 
              : 'translate-y-[0px] scale-100 text-slate-400'
            }
          `}
        >
          {label}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 active:scale-95 transition cursor-pointer select-none"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      
      {error && (
        <span className="block text-xs font-semibold text-rose-400 pl-2 animate-fade-in-up">
          {error}
        </span>
      )}
    </div>
  )
}
