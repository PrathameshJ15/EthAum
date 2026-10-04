import React from 'react'

const STATUS_CONFIG = {
  // Medical Case States
  DRAFT: {
    label: 'Draft',
    bg: 'bg-[#F1EEE8] dark:bg-[#202724]',
    text: 'text-[#5C564B] dark:text-[#C5BEB3]',
    border: 'border-[#E2DDD3] dark:border-[#2B3834]',
    dot: 'bg-[#8F8778] dark:bg-[#A89F8F]',
  },
  RECORDS_PENDING: {
    label: 'Records Needed',
    bg: 'bg-[#FEF7EA] dark:bg-[#2A2113]',
    text: 'text-[#9A6708] dark:text-[#E8BA60]',
    border: 'border-[#F8E2B5] dark:border-[#42341C]',
    dot: 'bg-[#B07D1E] dark:bg-[#FBBF24]',
  },
  QUALIFICATION: {
    label: 'Intake Review',
    bg: 'bg-[#EDF5F9] dark:bg-[#16242E]',
    text: 'text-[#20516E] dark:text-[#78AEC9]',
    border: 'border-[#CFE2EE] dark:border-[#1E3747]',
    dot: 'bg-[#2B5975] dark:bg-[#38BDF8]',
  },
  MATCHING: {
    label: 'Provider Matching',
    bg: 'bg-[#E6EFEB] dark:bg-[#1E2D28]',
    text: 'text-[#173E39] dark:text-[#83B2A3]',
    border: 'border-[#CFE2D8] dark:border-[#2B3E36]',
    dot: 'bg-[#315B55] dark:bg-[#6F9F91]',
  },
  QUOTES_RECEIVED: {
    label: 'Quotes Ready',
    bg: 'bg-[#EBF5EE] dark:bg-[#172B20]',
    text: 'text-[#1B5E3C] dark:text-[#7BC8A4]',
    border: 'border-[#CFEADB] dark:border-[#244232]',
    dot: 'bg-[#2D6A4F] dark:bg-[#4ADE80]',
  },
  PROVIDER_SELECTED: {
    label: 'Provider Selected',
    bg: 'bg-[#E6EFEB] dark:bg-[#1E2D28]',
    text: 'text-[#173E39] dark:text-[#83B2A3]',
    border: 'border-[#CFE2D8] dark:border-[#2B3E36]',
    dot: 'bg-[#173E39] dark:bg-[#83B2A3]',
  },
  CONSULTATION: {
    label: 'Consultation',
    bg: 'bg-[#EDF5F9] dark:bg-[#16242E]',
    text: 'text-[#1B4B68] dark:text-[#78AEC9]',
    border: 'border-[#CEE1ED] dark:border-[#1E3747]',
    dot: 'bg-[#265A7A] dark:bg-[#38BDF8]',
  },
  BOOKED: {
    label: 'Treatment Booked',
    bg: 'bg-[#EBF5EE] dark:bg-[#172B20]',
    text: 'text-[#1B5E3C] dark:text-[#7BC8A4]',
    border: 'border-[#CFEADB] dark:border-[#244232]',
    dot: 'bg-[#2D6A4F] dark:bg-[#4ADE80]',
  },
  TREATMENT: {
    label: 'In Treatment',
    bg: 'bg-[#EBF5EE] dark:bg-[#172B20]',
    text: 'text-[#1B5E3C] dark:text-[#7BC8A4]',
    border: 'border-[#CFEADB] dark:border-[#244232]',
    dot: 'bg-[#2D6A4F] dark:bg-[#4ADE80]',
  },
  AFTERCARE: {
    label: 'Aftercare',
    bg: 'bg-[#F1EEE8] dark:bg-[#202724]',
    text: 'text-[#4F554E] dark:text-[#C5BEB3]',
    border: 'border-[#DFDACF] dark:border-[#2B3834]',
    dot: 'bg-[#315B55] dark:bg-[#6F9F91]',
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-[#EEF1EF] dark:bg-[#1A2421]',
    text: 'text-[#2D3E3A] dark:text-[#B6C0BC]',
    border: 'border-[#D9E0DD] dark:border-[#2B3834]',
    dot: 'bg-[#556965] dark:bg-[#89938F]',
  },
  CANCELLED: {
    label: 'Cancelled',
    bg: 'bg-[#FDF2F2] dark:bg-[#2B1B1B]',
    text: 'text-[#963836] dark:text-[#F39A98]',
    border: 'border-[#F6D0D0] dark:border-[#4E2323]',
    dot: 'bg-[#A33B39] dark:bg-[#F87171]',
  },

  // General States
  VERIFIED: {
    label: 'Verified',
    bg: 'bg-[#EBF5EE] dark:bg-[#172B20]',
    text: 'text-[#1B5E3C] dark:text-[#7BC8A4]',
    border: 'border-[#CFEADB] dark:border-[#244232]',
    dot: 'bg-[#2D6A4F] dark:bg-[#4ADE80]',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-[#FEF7EA] dark:bg-[#2A2113]',
    text: 'text-[#9A6708] dark:text-[#E8BA60]',
    border: 'border-[#F8E2B5] dark:border-[#42341C]',
    dot: 'bg-[#B07D1E] dark:bg-[#FBBF24]',
  },
  ACTIVE: {
    label: 'Active',
    bg: 'bg-[#E6EFEB] dark:bg-[#1E2D28]',
    text: 'text-[#173E39] dark:text-[#83B2A3]',
    border: 'border-[#CFE2D8] dark:border-[#2B3E36]',
    dot: 'bg-[#315B55] dark:bg-[#6F9F91]',
  },
}

export function StatusBadge({
  status,
  customLabel = null,
  size = 'md',
  pulse = false,
  className = '',
}) {
  const normalizedKey = String(status || '').toUpperCase().replace(/[\s-]/g, '_')
  const config = STATUS_CONFIG[normalizedKey] || {
    label: status || 'Unknown',
    bg: 'bg-[#EEF1EF] dark:bg-[#1A2421]',
    text: 'text-[#172321] dark:text-[#B6C0BC]',
    border: 'border-[#DEE2DF] dark:border-[#2B3834]',
    dot: 'bg-[#6B7280] dark:bg-[#89938F]',
  }

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border select-none ${config.bg} ${config.text} ${config.border} ${sizeClass} ${className}`.trim()}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`} />
      </span>
      <span>{customLabel || config.label}</span>
    </span>
  )
}

export default StatusBadge
