import React from 'react'

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  className = '',
  onClick,
  ...props
}) {
  const isClickable = Boolean(onClick) || hoverable

  const hoverClasses = isClickable
    ? 'cursor-pointer hover:border-[var(--border-strong)] transition-colors duration-150 ease-out'
    : ''

  const variantClasses = {
    default: 'bg-[var(--surface)] border-[var(--border)]',
    alt: 'bg-[var(--surface-alt)] border-[var(--border)]',
    outlined: 'bg-transparent border-[var(--border-strong)]',
  }[variant] || 'bg-[var(--surface)] border-[var(--border)]'

  return (
    <div
      onClick={onClick}
      className={`rounded-[var(--radius-lg,12px)] border text-left p-6 ${variantClasses} ${hoverClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`pb-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', as: Component = 'h3', ...props }) {
  return (
    <Component
      className={`text-lg sm:text-xl font-heading font-bold text-[var(--text-heading)] tracking-[-0.01em] ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-sm font-normal text-[var(--text-muted)] mt-1.5 leading-relaxed ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`pt-2 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between gap-3 text-sm text-[var(--text-muted)] ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
