import React, { forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    required = false,
    disabled = false,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[15px] font-semibold text-[var(--text-heading)] mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-[var(--error-text)] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-[var(--text-muted)] pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`w-full h-12 bg-[var(--surface)] text-base text-[var(--text)] placeholder-[var(--text-muted)]/60 border rounded-[var(--radius-md,8px)] transition-all duration-150 outline-none
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            ${
              error
                ? 'border-[var(--error-text)] focus:ring-2 focus:ring-[var(--error-text)]/30'
                : 'border-[var(--border-strong)] hover:border-[var(--text-heading)] focus:ring-2 focus:ring-[var(--action)] focus:ring-offset-2'
            }
            disabled:bg-[var(--surface-alt)] disabled:cursor-not-allowed disabled:text-[var(--text-muted)]
            ${className}`.trim()}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3.5 text-[var(--text-muted)] flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-sm text-[var(--error-text)] font-medium flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="mt-1.5 text-sm text-[var(--text-muted)]">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
