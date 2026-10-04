import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { IconButton } from '../common/IconButton'

const SIZES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeOnBackdrop ? onClose : undefined}
        className="fixed inset-0 bg-[#060E09]/80 backdrop-blur-sm transition-opacity duration-200"
      />

      {/* Modal Dialog */}
      <div
        className={`relative w-full ${sizeClass} bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] shadow-2xl overflow-hidden z-10 transition-all duration-200 transform scale-100 text-left ${className}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 sm:p-6 pb-4 border-b border-[var(--border-hairline)]">
          <div className="pr-4">
            {title && (
              <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)] font-sans">{title}</h2>
            )}
            {description && (
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-sans font-light mt-1 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          {onClose && (
            <IconButton
              icon={<X className="w-4 h-4" />}
              label="Close modal"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            />
          )}
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[75vh] overflow-y-auto text-[var(--text-secondary)] font-sans font-light">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 sm:p-6 pt-3 border-t border-[var(--border-hairline)] bg-[var(--bg-base)] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal
