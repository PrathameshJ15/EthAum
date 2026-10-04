import React from 'react'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle({ className = '' }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle light and dark theme"
      title={isDark ? 'Switch to White mode' : 'Switch to Black mode'}
      onClick={toggleTheme}
      className={`relative inline-flex items-center w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer p-0.5 select-none shrink-0 bg-[#D8CEBC] dark:bg-[#1E2D24] border border-[#C5B9A4] dark:border-[#2D4536] ${className}`.trim()}
    >
      <span
        className={`inline-block w-5 h-5 rounded-full transform transition-transform duration-200 shadow-xs bg-[#7C5C38] dark:bg-[#12D058] ${
          isDark ? 'translate-x-0.5' : 'translate-x-6'
        }`}
      />
    </button>
  )
}

export default ThemeToggle
