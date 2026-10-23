import React from 'react'

export function Tabs({
  tabs = [],
  activeTab,
  onChange,
  variant = 'underline',
  className = '',
}) {
  const isPills = variant === 'pills'

  return (
    <div
      role="tablist"
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[var(--border)] scroll-smooth ${className}`.trim()}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id

        if (isPills) {
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              disabled={tab.disabled}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-[var(--radius-md,8px)] text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none
                ${
                  isActive
                    ? 'bg-[var(--action)] text-[var(--on-action)] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] hover:bg-[var(--surface-alt)]'
                }
                disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {tab.icon && <span className="w-3.5 h-3.5 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-medium ${
                    isActive
                      ? 'bg-white/20 text-white dark:bg-black/20 dark:text-[#101614]'
                      : 'bg-[var(--surface-alt)] text-[var(--action-text)] border border-[var(--border)]'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        }

        // Underline variant
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            disabled={tab.disabled}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 min-h-[44px] min-h-[44px] px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer select-none
              ${
                isActive
                  ? 'text-[var(--text-heading)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-[var(--surface-alt)] text-[var(--action-text)] border border-[var(--border)]">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--action)] rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
