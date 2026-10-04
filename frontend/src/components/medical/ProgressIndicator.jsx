import React from 'react'
import { Check } from 'lucide-react'

export function ProgressIndicator({
  currentStep = 1,
  totalSteps = 4,
  steps = [],
  type = 'steps',
  label = null,
  showPercentage = false,
  className = '',
}) {
  const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100)

  if (type === 'bar') {
    return (
      <div className={`w-full text-left ${className}`.trim()}>
        <div className="flex items-center justify-between text-xs font-semibold text-[#173E39] mb-1.5">
          <span>{label || 'Case Progress'}</span>
          {showPercentage && <span className="text-[#315B55]">{percentage}%</span>}
        </div>
        <div className="w-full h-2 bg-[#EEF1EF] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#173E39] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  // Stepper representation
  const stepItems = steps.length > 0 ? steps : Array.from({ length: totalSteps }, (_, i) => `Step ${i + 1}`)

  return (
    <div className={`w-full ${className}`.trim()}>
      <div className="flex items-center justify-between">
        {stepItems.map((stepName, idx) => {
          const stepNumber = idx + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          const isLast = idx === stepItems.length - 1

          return (
            <React.Fragment key={stepName}>
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200
                    ${
                      isCompleted
                        ? 'bg-[#173E39] text-[#F8F8F5]'
                        : isCurrent
                        ? 'bg-[#E6EFEB] text-[#173E39] ring-2 ring-[#315B55] ring-offset-2'
                        : 'bg-[#EEF1EF] text-[#172321]/40 border border-[#E5E7E4]'
                    }`}
                >
                  {isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : stepNumber}
                </div>

                <span
                  className={`text-[11px] font-medium mt-2 max-w-[80px] sm:max-w-none truncate sm:whitespace-normal
                    ${
                      isCurrent
                        ? 'text-[#173E39] font-semibold'
                        : isCompleted
                        ? 'text-[#172321]'
                        : 'text-[#172321]/40'
                    }`}
                >
                  {stepName}
                </span>
              </div>

              {!isLast && (
                <div
                  className={`flex-1 h-0.5 mx-2 sm:mx-4 -mt-5 rounded-full transition-colors duration-200
                    ${stepNumber < currentStep ? 'bg-[#173E39]' : 'bg-[#E5E7E4]'}`}
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

export default ProgressIndicator
