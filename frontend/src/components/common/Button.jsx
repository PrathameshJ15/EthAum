import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-[var(--action)] text-[var(--on-action)] hover:opacity-92 border border-transparent font-semibold shadow-none',
  secondary:
    'bg-transparent border border-[var(--border-strong)] text-[var(--text-heading)] hover:bg-[var(--surface-alt)] font-semibold',
  outline:
    'bg-transparent border border-[var(--border-strong)] text-[var(--text-heading)] hover:bg-[var(--surface-alt)] font-semibold',
  ghost:
    'bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-alt)] border-0 font-medium',
  tertiary:
    'bg-transparent text-[var(--action-text)] hover:underline border-0 p-0 min-h-0 font-semibold',
  copper:
    'bg-[var(--surface-alt)] border border-[var(--border)] text-[var(--text-heading)] hover:bg-[var(--border)] font-medium',
  danger:
    'bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-text)]/20 hover:bg-[var(--error-bg)]/80 font-medium',
}

const SIZES = {
  sm: 'text-xs min-h-[44px] px-3.5 py-2 rounded-[var(--radius-md,8px)] gap-1.5',
  md: 'text-sm min-h-[48px] px-5 py-2.5 rounded-[var(--radius-md,8px)] gap-2',
  lg: 'text-base min-h-[52px] px-6 py-3 rounded-[var(--radius-md,8px)] gap-2.5',
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-sans transition-all duration-150 ease-out cursor-pointer select-none ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variantClass = VARIANTS[variant] || VARIANTS.primary
  const sizeClass = SIZES[size] || SIZES.md
  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0 items-center">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && (
        <span className="inline-flex shrink-0 items-center">{rightIcon}</span>
      )}
    </button>
  )
}

export default Button
