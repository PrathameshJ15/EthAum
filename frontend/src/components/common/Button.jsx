import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary:
    'bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] border-0 shadow-none font-medium',
  secondary:
    'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] font-normal',
  outline:
    'bg-transparent border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] font-normal',
  ghost:
    'bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] border-0 font-normal',
  copper:
    'bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] hover:bg-[rgba(166,124,82,0.2)] font-normal',
  danger:
    'bg-[#FDF2F2] dark:bg-[#2B1B1B] text-[#A33B39] dark:text-[#F5B4B3] border border-[#F6D0D0] dark:border-[#4A2423] hover:bg-[#FBEAEA] dark:hover:bg-[#382020] font-normal',
}

const SIZES = {
  sm: 'text-[12px] px-3.5 py-1.5 rounded-[3px] gap-1.5',
  md: 'text-[13px] px-6 py-2.5 rounded-[3px] gap-2 tracking-[0.02em]',
  lg: 'text-[13px] px-7 py-[13px] rounded-[3px] gap-2 tracking-[0.02em]',
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
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--green-rich)] ' +
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
