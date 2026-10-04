import React, { forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'

export const Select = forwardRef(function Select(
  {
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option...',
    error,
    helperText,
    required = false,
    disabled = false,
    className = '',
    id,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className="w-full text-left">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#173E39] dark:text-[#F2F4F1] mb-1.5 select-none"
        >
          {label}
          {required && <span className="text-[#A33B39] dark:text-[#F5B4B3] ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`w-full bg-white dark:bg-[#1A2421] text-sm text-[#172321] dark:text-[#F2F4F1] border rounded-xl transition-all duration-150 py-2.5 pl-3.5 pr-10 outline-none appearance-none cursor-pointer
            ${
              error
                ? 'border-[#A33B39] dark:border-[#E06A68] focus:ring-2 focus:ring-[#A33B39]/20 focus:border-[#A33B39]'
                : 'border-[#E5E7E4] dark:border-[#2B3834] hover:border-[#CBDED6] dark:hover:border-[#3E4F4A] focus:ring-2 focus:ring-[#315B55]/15 dark:focus:ring-[#6F9F91]/20 focus:border-[#315B55] dark:focus:border-[#6F9F91]'
            }
            disabled:bg-[#EEF1EF] dark:disabled:bg-[#151C1A] disabled:cursor-not-allowed disabled:text-[#172321]/50 dark:disabled:text-[#89938F]
            ${className}`.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#172321]/40 dark:text-[#89938F] dark:bg-[#1A2421]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const isObject = typeof opt === 'object' && opt !== null
            const val = isObject ? opt.value : opt
            const text = isObject ? opt.label : opt
            const isDisabled = isObject ? opt.disabled : false

            return (
              <option key={val} value={val} disabled={isDisabled} className="dark:bg-[#1A2421] dark:text-[#F2F4F1]">
                {text}
              </option>
            )
          })}
        </select>

        <span className="absolute right-3.5 text-[#172321]/45 dark:text-[#89938F] pointer-events-none flex items-center">
          <ChevronDown className="w-4 h-4" />
        </span>
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-[#A33B39] dark:text-[#F5B4B3] font-medium">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs text-[#172321]/60 dark:text-[#89938F]">{helperText}</p>
      ) : null}
    </div>
  )
})

export default Select
