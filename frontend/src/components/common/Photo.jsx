import React, { useState } from 'react'

/**
 * Reusable Photo component following DESIGN.md Section 7:
 * - Fixed aspect ratios to avoid layout shifts
 * - Alt text required (decorative images pass decorative={true})
 * - Lazy loading below the fold, high priority for hero
 * - Subtle brightness reduction in dark mode
 * - Graceful fallback to neutral sage placeholder block with subject caption
 */
export function Photo({
  src,
  alt = '',
  aspectRatio = '16/10', // '4/5', '3/2', '16/10', '1/1'
  caption,
  subject,
  priority = false,
  className = '',
  decorative = false,
}) {
  const [error, setError] = useState(!src)

  const aspectClass = {
    '4/5': 'aspect-[4/5]',
    '3/2': 'aspect-[3/2]',
    '16/10': 'aspect-[16/10]',
    '1/1': 'aspect-square',
    '16/9': 'aspect-[16/9]',
  }[aspectRatio] || 'aspect-[16/10]'

  if (error || !src) {
    return (
      <div
        className={`w-full ${aspectClass} rounded-[var(--radius-lg,12px)] border border-[var(--border)] bg-[var(--surface-alt)] flex flex-col items-center justify-center p-6 text-center select-none ${className}`.trim()}
        role={decorative ? 'presentation' : 'img'}
        aria-label={decorative ? undefined : (alt || subject || 'Medical imagery placeholder')}
      >
        <div className="w-10 h-10 rounded-full bg-[var(--action)]/10 text-[var(--action)] flex items-center justify-center mb-2.5">
          <svg className="w-5 h-5 stroke-[1.75]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <p className="text-xs font-medium text-[var(--text-heading)] max-w-xs leading-snug">
          {subject || alt || 'Clinical Photography'}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-1 tracking-wide uppercase">
          EthAum Documentary Archive
        </p>
      </div>
    )
  }

  return (
    <figure className={`overflow-hidden rounded-[var(--radius-lg,12px)] border border-[var(--border)] bg-[var(--surface)] ${className}`.trim()}>
      <div className={`w-full ${aspectClass} overflow-hidden relative bg-[var(--surface-alt)]`}>
        <img
          src={src}
          alt={decorative ? '' : alt}
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
          onError={() => setError(true)}
          className="w-full h-full object-cover transition-opacity duration-300 dark:brightness-90"
        />
      </div>
      {caption && (
        <figcaption className="p-3 text-xs text-[var(--text-muted)] border-t border-[var(--border)] bg-[var(--surface)] text-left">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}
export default Photo
