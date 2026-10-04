import React from 'react'
import { Loader2 } from 'lucide-react'

const VARIANTS = {
  ghost: 'bg-transparent text-[#172321] hover:bg-[#EEF1EF] active:bg-[#E2E6E3] border border-transparent',
  primary: 'bg-[#173E39] text-[#F8F8F5] hover:bg-[#122F2B] active:bg-[#0E2623] border border-transparent shadow-xs',
  secondary: 'bg-[#E6EFEB] text-[#173E39] hover:bg-[#D7E5DF] active:bg-[#C8DBD3] border border-transparent shadow-xs',
  outline: 'bg-transparent text-[#173E39] border border-[#173E39]/30 hover:border-[#173E39] hover:bg-[#E6EFEB]/40 active:bg-[#E6EFEB]/70',
  danger: 'bg-[#FDF2F2] text-[#A33B39] border border-[#F3D2D1] hover:bg-[#FBE4E4]',
}

const SIZES = {
  sm: 'w-8 h-8 p-1.5 text-xs',
  md: 'w-10 h-10 p-2 text-sm',
  lg: 'w-12 h-12 p-2.5 text-base',
}

const SHAPES = {
  square: 'rounded-lg',
  rounded: 'rounded-xl',
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
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#315B55] focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClass} ${sizeClass} ${shapeClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-current" /> : content}
    </button>
  )
}

export default IconButton
