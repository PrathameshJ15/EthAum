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
    ? 'cursor-pointer hover:border-[var(--border-strong)] hover:-translate-y-0.5 transition-all duration-200 ease-out'
    : ''

  return (
    <div
      onClick={onClick}
      className={`rounded-[4px] border border-[var(--border-default)] bg-[var(--bg-card)] overflow-hidden text-left ${hoverClasses} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-6 sm:p-8 pb-3 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', as: Component = 'h4', ...props }) {
  return (
    <Component
      className={`text-[17px] sm:text-[19px] font-sans font-medium text-[var(--text-primary)] tracking-normal ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-[14px] font-sans font-light text-[var(--text-secondary)] mt-1.5 leading-relaxed ${className}`.trim()} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 sm:p-8 pt-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`p-6 sm:p-8 pt-4 border-t border-[var(--border-hairline)] flex items-center justify-between gap-3 text-xs ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
