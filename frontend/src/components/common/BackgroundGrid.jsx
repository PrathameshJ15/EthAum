import React from 'react'

/**
 * BackgroundGrid Component
 *
 * Renders the 40px square grid with rgba(255,255,255,0.022) lines.
 * Strictly used ONLY behind: Hero, Medical Case section, and Final CTA section.
 */
export function BackgroundGrid({
  className = '',
  style = {},
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none select-none overflow-hidden z-0 ${className}`.trim()}
      aria-hidden="true"
      style={style}
    >
      <div className="w-full h-full bg-grid-ethaum" />
    </div>
  )
}

export default BackgroundGrid
