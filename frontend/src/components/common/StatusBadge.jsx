import React from 'react'

/**
 * StatusBadge component per DESIGN.md Section 5:
 * - Radius 6px (--radius-sm)
 * - Padding 4x10px, 13px 600 weight
 * - Text label required (status is never colour alone)
 * - Variants: info, warn, success, error, neutral
 */
const STATUS_CONFIG = {
  // Medical Case States
  DRAFT: {
    label: 'Draft',
    variant: 'neutral',
  },
  RECORDS_PENDING: {
    label: 'Records Needed',
    variant: 'warn',
  },
  QUALIFICATION: {
    label: 'Intake Review',
    variant: 'info',
  },
  MATCHING: {
    label: 'Provider Matching',
    variant: 'info',
  },
  QUOTES_RECEIVED: {
    label: 'Quotes Ready',
    variant: 'success',
  },
  PROVIDER_SELECTED: {
    label: 'Provider Selected',
    variant: 'success',
  },
  CONSULTATION: {
    label: 'Consultation',
    variant: 'info',
  },
  BOOKED: {
    label: 'Treatment Booked',
    variant: 'success',
  },
  TREATMENT: {
    label: 'In Treatment',
    variant: 'success',
  },
  AFTERCARE: {
    label: 'Aftercare',
    variant: 'info',
  },
  COMPLETED: {
    label: 'Completed',
    variant: 'neutral',
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'error',
  },

  // General States
  VERIFIED: {
    label: 'Verified',
    variant: 'success',
  },
  PENDING: {
    label: 'Pending',
    variant: 'warn',
  },
  ACTIVE: {
    label: 'Active',
    variant: 'info',
  },
  INFO: {
    label: 'Information',
    variant: 'info',
  },
}

const VARIANT_STYLES = {
  info: 'bg-[var(--info-bg)] text-[var(--info-text)] border-[var(--info-text)]/20',
  warn: 'bg-[var(--warn-bg)] text-[var(--warn-text)] border-[var(--warn-text)]/20',
  success: 'bg-[var(--success-bg)] text-[var(--success-text)] border-[var(--success-text)]/20',
  error: 'bg-[var(--error-bg)] text-[var(--error-text)] border-[var(--error-text)]/20',
  neutral: 'bg-[var(--surface-alt)] text-[var(--text-muted)] border-[var(--border)]',
}

const DOT_STYLES = {
  info: 'bg-[var(--info-text)]',
  warn: 'bg-[var(--warn-text)]',
  success: 'bg-[var(--success-text)]',
  error: 'bg-[var(--error-text)]',
  neutral: 'bg-[var(--text-muted)]',
}

export function StatusBadge({
  status,
  customLabel = null,
  variant: forcedVariant = null,
  size = 'md',
  pulse = false,
  className = '',
}) {
  const normalizedKey = String(status || '').toUpperCase().replace(/[\s-]/g, '_')
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status || 'Status',
    variant: 'neutral',
  }

  const activeVariant = forcedVariant || config.variant || 'neutral'
  const variantClass = VARIANT_STYLES[activeVariant] || VARIANT_STYLES.neutral
  const dotClass = DOT_STYLES[activeVariant] || DOT_STYLES.neutral

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[13px] px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-[var(--radius-sm,6px)] border select-none ${variantClass} ${sizeClass} ${className}`.trim()}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotClass}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${dotClass}`} />
      </span>
      <span>{customLabel || config.label}</span>
    </span>
  )
}

export default StatusBadge
