import React, { forwardRef } from 'react'

export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    required = false,
    disabled = false,
    className = '',
    id,
    type = 'text',
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#173E39] dark:text-[#F2F4F1] mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-[#A33B39] dark:text-[#F5B4B3] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3.5 text-[#172321]/45 dark:text-[#89938F] pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          className={`w-full bg-white dark:bg-[#1A2421] text-sm text-[#172321] dark:text-[#F2F4F1] placeholder-[#172321]/40 dark:placeholder-[#89938F] border rounded-xl transition-all duration-150 py-2.5 outline-none
            ${leftIcon ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            ${
              error
                ? 'border-[#A33B39] dark:border-[#E06A68] focus:ring-2 focus:ring-[#A33B39]/20 focus:border-[#A33B39]'
                : 'border-[#E5E7E4] dark:border-[#2B3834] hover:border-[#CBDED6] dark:hover:border-[#3E4F4A] focus:ring-2 focus:ring-[#315B55]/15 dark:focus:ring-[#6F9F91]/20 focus:border-[#315B55] dark:focus:border-[#6F9F91]'
            }
            disabled:bg-[#EEF1EF] dark:disabled:bg-[#151C1A] disabled:cursor-not-allowed disabled:text-[#172321]/50 dark:disabled:text-[#89938F]
            ${className}`.trim()}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3.5 text-[#172321]/45 dark:text-[#89938F] flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-[#A33B39] dark:text-[#F5B4B3] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#172321]/60 dark:text-[#89938F]">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Input
