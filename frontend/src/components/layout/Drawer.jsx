import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../common/IconButton'

const SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  side = 'right',
  size = 'md',
  className = '',
}) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose?.()
      }
    }

    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClass = SIZES[size] || SIZES.md
  const isRight = side === 'right'

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden flex justify-end"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#172321]/45 dark:bg-black/65 backdrop-blur-[2px] transition-opacity duration-200"
      />

      {/* Drawer Surface */}
      <div
        className={`relative w-full ${sizeClass} bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xl z-10 flex flex-col h-full text-left transition-transform duration-300 ease-out border-l border-[var(--border-default)]
          ${isRight ? 'ml-auto' : 'mr-auto border-r border-l-0'} ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-[var(--border-hairline)] shrink-0">
          <div>
            {title && <h2 className="text-base font-medium text-[var(--text-primary)]">{title}</h2>}
            {description && (
              <p className="text-xs text-[var(--text-secondary)] font-light mt-0.5 leading-relaxed">{description}</p>
            )}
          </div>
          <IconButton
            icon={<X className="w-4 h-4" />}
            label="Close drawer"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          />
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-[var(--border-hairline)] bg-[var(--bg-base)] shrink-0 flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Drawer
