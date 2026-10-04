import React, { useState } from 'react'
import {
  Search,
  FolderPlus,
  UploadCloud,
  Sparkles,
  Building2,
  Receipt,
  Video,
  HeartHandshake,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react'
import { Breadcrumb } from '../components'
import { HOW_IT_WORKS_STEPS } from '../data/howItWorksData'

const STEP_ICONS = {
  Search: <Search className="w-4 h-4" />,
  FolderPlus: <FolderPlus className="w-4 h-4" />,
  UploadCloud: <UploadCloud className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Receipt: <Receipt className="w-4 h-4" />,
  Video: <Video className="w-4 h-4" />,
  HeartHandshake: <HeartHandshake className="w-4 h-4" />,
}

export function HowItWorksPage({ onCreateCase }) {
  const [activeStepIdx, setActiveStepIdx] = useState(0)
  const currentStep = HOW_IT_WORKS_STEPS[activeStepIdx]

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'How It Works', current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-4 flex items-center gap-2.5 font-sans">
          <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          The Care Journey
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-light text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] max-w-2xl">
          Coordinated Healthcare Across Borders
        </h1>

        <p className="mt-4 text-sm sm:text-base font-light text-[var(--text-secondary)] font-sans max-w-xl leading-relaxed">
          A structured, transparent pathway designed to protect patient health records, eliminate unbudgeted medical expenses, and maintain clinical continuity worldwide.
        </p>
      </div>

      {/* AI Boundary Callout */}
      <div className="p-5 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-default)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3 text-xs font-sans text-[var(--text-secondary)] leading-relaxed">
          <ShieldCheck className="w-5 h-5 shrink-0 text-[var(--green-rich)] mt-0.5" />
          <div>
            <span className="text-sm font-medium block text-[var(--text-primary)] mb-1 font-sans">
              EthAum AI Coordination Philosophy
            </span>
            AI organizes records, normalizes quotes, and highlights missing scans. EthAum AI never diagnoses, prescribes medication, or replaces a board-certified doctor.
          </div>
        </div>
        <span className="text-[11px] font-sans px-3 py-1 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] shrink-0">
          Grok Engine · Coordination Only
        </span>
      </div>

      {/* Interactive Step Navigator */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 sm:p-8 space-y-8">
        {/* Step Numbers Strip */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 border-b border-[var(--border-hairline)] pb-4">
          {HOW_IT_WORKS_STEPS.map((step, idx) => {
            const isActive = activeStepIdx === idx
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStepIdx(idx)}
                className={`p-2.5 rounded-[3px] flex flex-col items-center justify-center gap-1 transition-all cursor-pointer font-sans ${
                  isActive
                    ? 'border-b-2 border-[var(--copper)] bg-[var(--bg-elevated)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                }`}
              >
                <span className="text-xs font-normal text-[var(--copper)] tabular-nums">0{step.stepNumber}</span>
                <span className="text-[11px] truncate max-w-full font-light hidden sm:block">
                  {step.title.split(' ')[0]}
                </span>
              </button>
            )
          })}
        </div>

        {/* Active Step Storytelling Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Detailed Narrative */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] uppercase tracking-[0.06em]">
                {currentStep.badge}
              </span>
              <span className="text-xs text-[var(--text-muted)] font-sans">
                Milestone {currentStep.stepNumber} of 8
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] font-normal leading-tight">
              {currentStep.title}
            </h2>

            <p className="text-sm font-medium text-[var(--copper)] font-sans">
              {currentStep.subtitle}
            </p>

            <p className="text-sm font-light text-[var(--text-secondary)] leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <ul className="space-y-2 text-xs font-sans text-[var(--text-secondary)] pt-2">
              {currentStep.details.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 flex items-center gap-3">
              <button
                onClick={() => onCreateCase?.()}
                className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors duration-150 rounded-[3px] px-6 py-2.5 text-xs font-medium font-sans tracking-[0.02em]"
              >
                Start Your Medical Case
              </button>

              {activeStepIdx < HOW_IT_WORKS_STEPS.length - 1 ? (
                <button
                  onClick={() => setActiveStepIdx((prev) => prev + 1)}
                  className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 rounded-[3px] px-4 py-2.5 text-xs font-sans"
                >
                  Next: {HOW_IT_WORKS_STEPS[activeStepIdx + 1].title.split(' ')[0]} &rarr;
                </button>
              ) : (
                <button
                  onClick={() => setActiveStepIdx(0)}
                  className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors duration-150 rounded-[3px] px-4 py-2.5 text-xs font-sans"
                >
                  Back to Step 1
                </button>
              )}
            </div>
          </div>

          {/* Right: Clean Product Artifact Preview */}
          <div className="p-6 sm:p-8 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-5 text-left">
            <div className="flex items-center justify-between border-b border-[var(--border-hairline)] pb-3">
              <span className="text-[11px] font-sans text-[var(--copper)] uppercase tracking-wider">
                {currentStep.demoPreview.tag}
              </span>
              <span className="text-[var(--text-muted)]">
                {STEP_ICONS[currentStep.iconName] || <Sparkles className="w-4 h-4" />}
              </span>
            </div>

            <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-1.5">
              <h4 className="text-base font-medium text-[var(--text-primary)] font-sans">{currentStep.demoPreview.title}</h4>
              <p className="text-xs text-[var(--text-muted)] font-sans font-light">{currentStep.demoPreview.meta}</p>
              <div className="pt-2">
                <span className="inline-block text-xs font-normal text-[var(--copper)] tabular-nums">
                  {currentStep.demoPreview.value}
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-hairline)] text-xs text-[var(--text-secondary)] font-sans space-y-1">
              <p className="font-medium text-[var(--text-primary)]">Patient Protection Check</p>
              <p className="text-[var(--text-muted)] leading-relaxed text-[11px] font-light">
                Hospital coordinators cannot download or redistribute your scans without your explicit cryptographic consent.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Step Complete Timeline View */}
      <section className="space-y-6 pt-6">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Comprehensive Architecture
          </p>
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            All 8 Milestones at a Glance
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {HOW_IT_WORKS_STEPS.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => setActiveStepIdx(idx)}
              className={`p-5 rounded-[4px] bg-[var(--bg-card)] border transition-all cursor-pointer space-y-2.5 ${
                activeStepIdx === idx
                  ? 'border-[var(--copper)] bg-[var(--bg-elevated)]'
                  : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-normal text-[var(--copper)] font-sans tabular-nums">
                  0{step.stepNumber}
                </span>
                <span className="text-[10px] font-sans text-[var(--text-muted)]">{step.badge.split('·')[1]}</span>
              </div>
              <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans">{step.title}</h4>
              <p className="text-xs font-light text-[var(--text-secondary)] font-sans line-clamp-3 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default HowItWorksPage
