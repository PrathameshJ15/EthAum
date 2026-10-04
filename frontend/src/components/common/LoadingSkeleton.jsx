import React from 'react'

export function LoadingSkeleton({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'avatar':
        return 'w-10 h-10 rounded-full'
      case 'title':
        return 'h-7 w-3/4 rounded-[3px]'
      case 'card':
        return 'h-48 w-full rounded-[4px]'
      case 'circular':
        return 'rounded-full'
      case 'rectangular':
        return 'rounded-[4px]'
      case 'text':
      default:
        return 'h-4 w-full rounded-[3px]'
    }
  }

  const items = Array.from({ length: count }, (_, i) => i)

  return (
    <div className="space-y-2.5 w-full">
      {items.map((key) => (
        <div
          key={key}
          style={{ width, height }}
          className={`animate-pulse bg-[var(--bg-elevated)] border border-[var(--border-hairline)] ${getVariantStyles()} ${className}`.trim()}
        />
      ))}
    </div>
  )
}

export default LoadingSkeleton
