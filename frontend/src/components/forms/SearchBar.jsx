import React, { useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { Button } from '../common/Button'

export function SearchBar({
  value: controlledValue,
  defaultValue = '',
  onChange,
  onSearch,
  onClear,
  onFilterClick,
  placeholder = 'Search treatments, procedures, doctors, or destinations...',
  buttonText = 'Search',
  showFilterButton = false,
  size = 'md',
  className = '',
}) {
  const [internalValue, setInternalValue] = useState(defaultValue)
  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const handleChange = (e) => {
    if (!isControlled) setInternalValue(e.target.value)
    if (onChange) onChange(e)
  }

  const handleClear = () => {
    if (!isControlled) setInternalValue('')
    if (onClear) onClear()
    if (onChange) onChange({ target: { value: '' } })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSearch) onSearch(value)
  }

  const isLarge = size === 'lg'

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-center w-full bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] focus-within:border-[var(--border-strong)] transition-all duration-200
        ${isLarge ? 'p-2 sm:p-2.5' : 'p-1.5 sm:p-2'}
        ${className}`.trim()}
    >
      <div className="flex items-center pl-3 pr-2 text-[var(--text-muted)]">
        <Search className={isLarge ? 'w-5 h-5 text-[var(--text-muted)]' : 'w-4 h-4 text-[var(--text-muted)]'} />
      </div>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] border-none outline-none font-sans font-light min-w-0
          ${isLarge ? 'text-base py-1.5' : 'text-sm py-1'}`}
      />

      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="p-1 mr-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Clear search query"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {showFilterButton && (
        <button
          type="button"
          onClick={onFilterClick}
          className="p-2 mr-2 rounded-[3px] border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Open filter settings"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      )}

      {buttonText && (
        <Button
          type="submit"
          variant="primary"
          size={isLarge ? 'md' : 'sm'}
          className="shrink-0"
        >
          {buttonText}
        </Button>
      )}
    </form>
  )
}

export default SearchBar
