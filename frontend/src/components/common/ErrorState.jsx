import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export function ErrorState({
  title = 'Unable to load information',
  description = 'We encountered an unexpected issue while retrieving your healthcare details. Your data is secure, and you can try refreshing the page.',
  code = null,
  onRetry = null,
  action = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[var(--bg-card)] border border-[#EAC4C2] dark:border-red-900/40 rounded-[4px] max-w-lg mx-auto ${className}`.trim()}
    >
      <div className="w-10 h-10 rounded-[3px] bg-[#FDF0EF] dark:bg-red-950/30 border border-[#F5C2C0] dark:border-red-900/50 text-[#A33B39] dark:text-red-400 flex items-center justify-center mb-4">
        <AlertCircle className="w-5 h-5 stroke-[1.75]" />
      </div>

      {code && (
        <span className="text-xs font-mono font-medium text-[#A33B39] dark:text-red-400 uppercase tracking-wider mb-1">
          Error {code}
        </span>
      )}

      <h3 className="text-base font-medium text-[var(--text-primary)] font-sans mb-2">{title}</h3>
      <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed max-w-sm mb-6">{description}</p>

      {action || (
        onRetry && (
          <button
            onClick={onRetry}
            className="border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[3px] px-4 py-2 text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        )
      )}
    </div>
  )
}

export default ErrorState
