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
      className={`flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-[#EEF1EF] dark:border-[#2B3834] ${className}`.trim()}
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer select-none
                ${
                  isActive
                    ? 'bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] shadow-xs'
                    : 'text-[#172321]/70 hover:text-[#172321] hover:bg-[#EEF1EF] dark:text-[#B6C0BC] dark:hover:text-[#F2F4F1] dark:hover:bg-[#1A2421]'
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
                      : 'bg-[#E6EFEB] text-[#173E39] dark:bg-[#1E2D28] dark:text-[#83B2A3]'
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
            className={`relative flex items-center gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors duration-150 cursor-pointer select-none
              ${
                isActive
                  ? 'text-[#173E39] dark:text-[#6F9F91]'
                  : 'text-[#172321]/60 hover:text-[#172321] dark:text-[#89938F] dark:hover:text-[#F2F4F1]'
              }
              disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {tab.icon && <span className="w-4 h-4 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span className="text-xs px-1.5 py-0.5 rounded-full font-medium bg-[#E6EFEB] text-[#173E39] dark:bg-[#1E2D28] dark:text-[#83B2A3]">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#173E39] dark:bg-[#6F9F91] rounded-full" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs
