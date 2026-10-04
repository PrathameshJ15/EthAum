import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb({ items = [], showHome = true, onHomeClick, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center text-xs font-sans text-[var(--text-muted)] ${className}`.trim()}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        {showHome && (
          <li className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onHomeClick}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5 rounded cursor-pointer"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5" />
            </button>
            {items.length > 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]/50 shrink-0" />}
          </li>
        )}

        {items.map((item, idx) => {
          const isLast = idx === items.length - 1
          const isCurrent = item.current || isLast

          return (
            <li key={item.label || idx} className="flex items-center gap-1.5">
              {isCurrent ? (
                <span
                  aria-current="page"
                  className="font-medium text-[var(--text-primary)] truncate max-w-xs"
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  className="hover:text-[var(--text-primary)] transition-colors truncate max-w-xs"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={item.onClick}
                  className="hover:text-[var(--text-primary)] transition-colors truncate max-w-xs cursor-pointer"
                >
                  {item.label}
                </button>
              )}

              {!isLast && (
                <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)]/50 shrink-0" />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default Breadcrumb
