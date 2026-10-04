import React from 'react'

const VARIANTS = {
  copper: 'bg-[var(--copper-pale)] text-[var(--copper)] border border-[var(--copper-border)]',
  sage: 'bg-[var(--copper-pale)] text-[var(--copper)] border border-[var(--copper-border)]',
  green: 'bg-[var(--green-deep)] text-[var(--text-primary)] border border-transparent',
  neutral: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]',
  warm: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]',
  primary: 'bg-[var(--green-deep)] text-[var(--text-primary)] border border-transparent',
  outline: 'bg-transparent text-[var(--text-secondary)] border border-[var(--border-default)]',
  success: 'bg-[rgba(22,163,88,0.12)] text-[var(--green-rich)] border border-[rgba(22,163,88,0.25)]',
  warning: 'bg-[var(--copper-pale)] text-[var(--copper)] border border-[var(--copper-border)]',
  danger: 'bg-[rgba(163,59,57,0.15)] text-[#F5B4B3] border border-[rgba(163,59,57,0.3)]',
  info: 'bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)]',
}

const SIZES = {
  sm: 'text-[11px] px-2 py-0.5 rounded-[3px] gap-1 font-normal font-sans',
  md: 'text-[11px] px-2.5 py-1 rounded-[3px] gap-1.5 font-normal font-sans tracking-wide',
}

const DOT_COLORS = {
  copper: 'bg-[var(--copper)]',
  sage: 'bg-[var(--copper)]',
  green: 'bg-[var(--green-rich)]',
  neutral: 'bg-[var(--text-muted)]',
  warm: 'bg-[var(--copper)]',
  primary: 'bg-[var(--green-rich)]',
  outline: 'bg-[var(--text-muted)]',
  success: 'bg-[var(--green-rich)]',
  warning: 'bg-[var(--copper)]',
  danger: 'bg-[#F87171]',
  info: 'bg-[var(--copper)]',
}

export function Badge({
  children,
  variant = 'copper',
  size = 'md',
  dot = false,
  icon = null,
  className = '',
  ...props
}) {
  const variantClass = VARIANTS[variant] || VARIANTS.copper
  const sizeClass = SIZES[size] || SIZES.md
  const dotClass = DOT_COLORS[variant] || DOT_COLORS.copper

  return (
    <span
      className={`inline-flex items-center shrink-0 select-none ${variantClass} ${sizeClass} ${className}`.trim()}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotClass}`} />}
      {icon && <span className="inline-flex shrink-0 items-center">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
