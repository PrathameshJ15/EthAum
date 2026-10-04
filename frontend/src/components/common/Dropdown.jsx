import React, { useState, useRef, useEffect } from 'react'

export function Dropdown({
  trigger,
  children,
  items = [],
  align = 'right',
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const alignmentClass = align === 'left' ? 'left-0' : 'right-0'

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={() => setIsOpen((prev) => !prev)} className="inline-flex">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute ${alignmentClass} mt-2 w-56 rounded-xl bg-white border border-[#E5E7E4] shadow-lg shadow-[#172321]/5 py-1.5 z-40 focus:outline-none transition-all duration-150 ease-out ${className}`}
        >
          {items && items.length > 0
            ? items.map((item, idx) => {
                if (item.divider) {
                  return <hr key={`divider-${idx}`} className="my-1.5 border-[#EEF1EF]" />
                }

                return (
                  <button
                    key={item.id || item.label || idx}
                    type="button"
                    disabled={item.disabled}
                    onClick={(e) => {
                      if (item.onClick) item.onClick(e)
                      setIsOpen(false)
                    }}
                    className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors duration-150 cursor-pointer
                      disabled:opacity-40 disabled:cursor-not-allowed
                      ${
                        item.danger
                          ? 'text-[#A33B39] hover:bg-[#FDF2F2]'
                          : 'text-[#172321] hover:bg-[#EEF1EF] hover:text-[#173E39]'
                      }`}
                  >
                    {item.icon && <span className="w-4 h-4 shrink-0">{item.icon}</span>}
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })
            : children}
        </div>
      )}
    </div>
  )
}

export default Dropdown
