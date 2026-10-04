import React from 'react'
import { FolderOpen } from 'lucide-react'

export function EmptyState({
  icon = null,
  title = 'No records found',
  description = 'There is currently no information available in this section.',
  action = null,
  secondaryAction = null,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-[var(--bg-card)] border border-dashed border-[var(--border-default)] rounded-[4px] max-w-lg mx-auto ${className}`.trim()}
    >
      <div className="w-10 h-10 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-4 border border-[var(--border-hairline)]">
        {icon || <FolderOpen className="w-5 h-5 stroke-[1.75]" />}
      </div>
      <h3 className="text-base font-medium text-[var(--text-primary)] font-sans mb-1.5">{title}</h3>
      <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed max-w-sm mb-6">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  )
}

export default EmptyState
