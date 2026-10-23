import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  ghost: 'bg-transparent text-[var(--text-heading)] hover:bg-[var(--surface-alt)] active:bg-[var(--border)] border border-transparent',
  primary: 'bg-[var(--action)] text-[var(--on-action)] hover:opacity-92 border border-transparent shadow-xs',
  secondary: 'bg-[var(--surface-alt)] text-[var(--text-heading)] hover:bg-[var(--border)] border border-transparent shadow-xs',
  outline: 'bg-transparent text-[var(--text-heading)] border border-[var(--border-strong)] hover:bg-[var(--surface-alt)]',
  danger: 'bg-[var(--error-bg)] text-[var(--error-text)] border border-[var(--error-text)]/20 hover:bg-[var(--error-bg)]/80',
}

const SIZES = {
  sm: 'min-w-[44px] min-h-[44px] w-9 h-9 p-2 text-xs',
  md: 'min-w-[44px] min-h-[44px] w-10 h-10 p-2.5 text-sm',
  lg: 'min-w-[48px] min-h-[48px] w-12 h-12 p-3 text-base',
}

const SHAPES = {
  square: 'rounded-[var(--radius-md,8px)]',
  rounded: 'rounded-[var(--radius-md,8px)]',
  full: 'rounded-full',
}

export function IconButton({
  icon,
  children,
  label,
  variant = 'ghost',
  size = 'md',
  shape = 'rounded',
  isLoading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const content = icon || children
  const variantClass = VARIANTS[variant] || VARIANTS.ghost
  const sizeClass = SIZES[size] || SIZES.md
  const shapeClass = SHAPES[shape] || SHAPES.rounded

  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center shrink-0 transition-all duration-200 cursor-pointer select-none
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClass} ${sizeClass} ${shapeClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : content}
    </button>
  )
}

export default IconButton
