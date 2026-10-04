import React from 'react'
import { Check, CircleDot } from 'lucide-react'

export function Timeline({
  steps = [],
  orientation = 'vertical',
  interactive = false,
  onStepClick,
  className = '',
}) {
  const isHorizontal = orientation === 'horizontal'

  if (isHorizontal) {
    return (
      <div className={`w-full overflow-x-auto no-scrollbar py-4 ${className}`.trim()}>
        <div className="flex items-center min-w-max gap-3 sm:gap-4 px-2">
          {steps.map((step, idx) => {
            const isCompleted = step.status === 'completed'
            const isCurrent = step.status === 'current'
            const isLast = idx === steps.length - 1

            return (
              <React.Fragment key={step.id || step.title || idx}>
                <div
                  onClick={() => interactive && onStepClick?.(step, idx)}
                  className={`flex items-center gap-3 ${
                    interactive ? 'cursor-pointer group' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200
                      ${
                        isCompleted
                          ? 'bg-[#173E39] text-[#F8F8F5]'
                          : isCurrent
                          ? 'bg-[#E6EFEB] text-[#173E39] ring-2 ring-[#315B55] ring-offset-2'
                          : 'bg-[#EEF1EF] text-[#172321]/40 border border-[#E5E7E4]'
                      }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 stroke-[2.5]" />
                    ) : isCurrent ? (
                      <CircleDot className="w-4 h-4 animate-pulse text-[#173E39]" />
                    ) : (
                      <span className="text-xs font-semibold">{idx + 1}</span>
                    )}
                  </div>

                  <div className="text-left">
                    <p
                      className={`text-xs font-semibold truncate ${
                        isCurrent
                          ? 'text-[#173E39]'
                          : isCompleted
                          ? 'text-[#172321]'
                          : 'text-[#172321]/50'
                      }`}
                    >
                      {step.title}
                    </p>
                    {step.date && (
                      <p className="text-[10px] text-[#172321]/50">{step.date}</p>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div
                    className={`h-0.5 w-8 sm:w-12 rounded-full shrink-0 ${
                      isCompleted ? 'bg-[#173E39]' : 'bg-[#E5E7E4]'
                    }`}
                  />
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>
    )
  }

  // Vertical Timeline
  return (
    <div className={`relative space-y-6 text-left ${className}`.trim()}>
      {steps.map((step, idx) => {
        const isCompleted = step.status === 'completed'
        const isCurrent = step.status === 'current'
        const isLast = idx === steps.length - 1

        return (
          <div
            key={step.id || step.title || idx}
            onClick={() => interactive && onStepClick?.(step, idx)}
            className={`relative flex items-start gap-4 ${
              interactive ? 'cursor-pointer group' : ''
            }`}
          >
            {/* Connecting Line */}
            {!isLast && (
              <span
                className={`absolute left-4.5 top-9 -bottom-6 w-0.5 ${
                  isCompleted ? 'bg-[#173E39]' : 'bg-[#E5E7E4]'
                }`}
                aria-hidden="true"
              />
            )}

            {/* Step Icon Badge */}
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 z-10 transition-all duration-200
                ${
                  isCompleted
                    ? 'bg-[#173E39] text-[#F8F8F5]'
                    : isCurrent
                    ? 'bg-[#E6EFEB] text-[#173E39] ring-2 ring-[#315B55] ring-offset-2'
                    : 'bg-[#EEF1EF] text-[#172321]/40 border border-[#E5E7E4]'
                }`}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[2.5]" />
              ) : isCurrent ? (
                <CircleDot className="w-4 h-4 animate-pulse text-[#173E39]" />
              ) : (
                <span className="text-xs font-semibold">{idx + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pt-1 pb-2">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <h4
                  className={`text-sm font-semibold ${
                    isCurrent
                      ? 'text-[#173E39]'
                      : isCompleted
                      ? 'text-[#172321]'
                      : 'text-[#172321]/60'
                  }`}
                >
                  {step.title}
                </h4>
                {step.date && (
                  <span className="text-xs text-[#172321]/50 font-normal">{step.date}</span>
                )}
              </div>

              {step.description && (
                <p className="text-xs text-[#172321]/70 mt-1 leading-relaxed">
                  {step.description}
                </p>
              )}

              {step.meta && <div className="mt-2">{step.meta}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
