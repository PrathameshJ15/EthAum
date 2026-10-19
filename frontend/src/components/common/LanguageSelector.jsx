import React, { useState, useRef, useEffect } from 'react'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useLanguage } from '../../i18n'

export function LanguageSelector({ variant = 'capsule', className = '', showLabel = true }) {
  const { currentLanguage, setLanguage, supportedLanguages, currentLanguageMeta } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // Handle keyboard navigation (Escape to close)
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelectLanguage = (code) => {
    setLanguage(code)
    setIsOpen(false)
  }

  // Mobile inline list or drawer variant
  if (variant === 'list') {
    return (
      <div className={`space-y-1.5 ${className}`.trim()}>
        <div className="flex items-center gap-2 px-2 pb-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          <Globe className="w-3.5 h-3.5" />
          <span>Language / اللغة</span>
        </div>
        <div className="grid grid-cols-1 gap-1">
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-[4px] border transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--green-rich)]/12 border-[var(--green-rich)] text-[var(--green-rich)] font-medium dark:bg-[var(--green-rich)]/20 dark:text-[var(--green-cta)]'
                    : 'bg-[var(--bg-card)] border-[var(--border-hairline)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span className="font-sans font-medium">{lang.nativeName}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">({lang.name})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Desktop / Header Capsule Dropdown variant
  return (
    <div className={`relative inline-block text-left ${className}`.trim()} ref={dropdownRef}>
      <button
        type="button"
        id="language-selector-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Select language. Current language: ${currentLanguageMeta.name}`}
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-[3px] bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-all cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[var(--green-rich)]"
      >
        <span className="text-xs leading-none">{currentLanguageMeta.flag}</span>
        {showLabel && (
          <span className="uppercase text-[11px] font-semibold tracking-wider text-[var(--text-secondary)]">
            {currentLanguageMeta.code}
          </span>
        )}
        <ChevronDown
          className={`w-3 h-3 text-[var(--text-muted)] transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          aria-labelledby="language-selector-button"
          className="absolute end-0 mt-1.5 w-48 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-strong)] shadow-xl z-50 py-1.5 focus:outline-none animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-1 border-b border-[var(--border-hairline)] mb-1">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)]">
              Choose Language
            </span>
          </div>
          {supportedLanguages.map((lang) => {
            const isSelected = lang.code === currentLanguage
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isSelected}
                type="button"
                onClick={() => handleSelectLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-start transition-colors cursor-pointer select-none ${
                  isSelected
                    ? 'bg-[var(--green-rich)]/12 text-[var(--green-rich)] font-semibold dark:bg-[var(--green-rich)]/20 dark:text-[var(--green-cta)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <div>
                    <span className="block font-medium leading-tight">{lang.nativeName}</span>
                    <span className="block text-[10px] text-[var(--text-muted)] leading-tight">{lang.name}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--green-rich)] dark:text-[var(--green-cta)]" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSelector
