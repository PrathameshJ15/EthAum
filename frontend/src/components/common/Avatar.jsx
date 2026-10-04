import React, { useState } from 'react'
import { Check } from 'lucide-react'

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg font-semibold',
}

const BADGE_SIZES = {
  xs: 'w-2 h-2',
  sm: 'w-2.5 h-2.5',
  md: 'w-3 h-3',
  lg: 'w-3.5 h-3.5',
  xl: 'w-4 h-4',
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function Avatar({
  src,
  name,
  size = 'md',
  shape = 'circle',
  verified = false,
  status = null,
  className = '',
}) {
  const [imageError, setImageError] = useState(false)
  const sizeClass = SIZES[size] || SIZES.md
  const badgeSizeClass = BADGE_SIZES[size] || BADGE_SIZES.md
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl'

  const showFallback = !src || imageError
  const initials = getInitials(name)

  return (
    <div className={`relative inline-flex shrink-0 ${sizeClass} ${className}`.trim()}>
      <div
        className={`w-full h-full overflow-hidden flex items-center justify-center select-none font-medium
          ${shapeClass} ${
          showFallback
            ? 'bg-[#E6EFEB] text-[#173E39] border border-[#CFE2D8]'
            : 'bg-[#EEF1EF] border border-[#E5E7E4]'
        }`}
      >
        {!showFallback ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {verified && (
        <span
          title="Verified Healthcare Provider"
          className={`absolute -bottom-0.5 -right-0.5 rounded-full bg-[#173E39] text-[#F8F8F5] flex items-center justify-center ring-2 ring-[#F8F8F5] ${badgeSizeClass}`}
        >
          <Check className="w-2/3 h-2/3 stroke-[3]" />
        </span>
      )}

      {status && !verified && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full ring-2 ring-[#F8F8F5] ${badgeSizeClass} ${
            status === 'online'
              ? 'bg-[#2D6A4F]'
              : status === 'busy'
              ? 'bg-[#B07D1E]'
              : 'bg-[#9CA3AF]'
          }`}
        />
      )}
    </div>
  )
}

export default Avatar
