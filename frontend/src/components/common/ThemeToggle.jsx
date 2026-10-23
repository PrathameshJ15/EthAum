import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function ThemeToggle({ className = '' }) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <div className="inline-flex items-center justify-center min-h-[44px] min-w-[44px]">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle light and dark theme"
        title={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        onClick={toggleTheme}
        className={`relative inline-flex items-center w-13 h-7 rounded-full transition-colors duration-200 cursor-pointer p-0.5 select-none shrink-0 bg-[var(--surface-alt)] border border-[var(--border-strong)] focus:outline-none focus:ring-2 focus:ring-[var(--action)] ${className}`.trim()}
      >
        <span
          className={`inline-flex items-center justify-center w-5.5 h-5.5 rounded-full transform transition-transform duration-200 shadow-sm bg-[var(--action)] text-[var(--on-action)] ${
            isDark ? 'translate-x-6' : 'translate-x-0.5'
          }`}
        >
          {isDark ? <Moon className="w-3 h-3 stroke-[2.2]" /> : <Sun className="w-3 h-3 stroke-[2.2]" />}
        </span>
      </button>
    </div>
  )
}

export default ThemeToggle
