import React from 'react'

export function SectionHeading({
  eyebrow = null,
  title,
  description = null,
  action = null,
  align = 'left',
  className = '',
}) {
  const isCentered = align === 'center'

  return (
    <div
      className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16
        ${isCentered ? 'text-center items-center md:items-center' : 'text-left'}
        ${className}`.trim()}
    >
      <div className={`max-w-2xl ${isCentered ? 'mx-auto' : ''}`}>
        {eyebrow && (
          <p className={`font-sans text-[11px] font-normal tracking-[0.12em] uppercase text-[var(--green-rich)] mb-4 flex items-center gap-2.5 ${isCentered ? 'justify-center' : ''}`}>
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)] shrink-0" />
            <span>{eyebrow}</span>
          </p>
        )}
        <h2 className="font-serif font-normal text-[32px] sm:text-[40px] lg:text-[50px] text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1]">
          {title}
        </h2>
        {description && (
          <p className="font-sans font-light text-[15px] sm:text-[16px] text-[var(--text-secondary)] mt-4 leading-[1.75]">
            {description}
          </p>
        )}
      </div>

      {action && <div className="shrink-0 pt-2 md:pt-0">{action}</div>}
    </div>
  )
}

export default SectionHeading
