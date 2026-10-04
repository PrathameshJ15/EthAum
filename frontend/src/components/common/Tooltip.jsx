import React, { useState, useRef } from 'react'

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 150,
  className = '',
}) {
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef(null)

  const showTooltip = () => {
    timerRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsVisible(false)
  }

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom':
        return 'top-full left-1/2 -translate-x-1/2 mt-2'
      case 'left':
        return 'right-full top-1/2 -translate-y-1/2 mr-2'
      case 'right':
        return 'left-full top-1/2 -translate-y-1/2 ml-2'
      case 'top':
      default:
        return 'bottom-full left-1/2 -translate-x-1/2 mb-2'
    }
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          role="tooltip"
          className={`absolute z-50 px-2.5 py-1.5 text-xs font-medium text-[#F8F8F5] bg-[#172321] rounded-lg shadow-lg pointer-events-none whitespace-nowrap transition-opacity duration-150 ${getPositionClasses()} ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  )
}

export default Tooltip
