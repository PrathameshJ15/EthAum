import React, { useState } from 'react'
import {
  X,
  Check,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  HelpCircle,
  ShieldCheck,
  AlertCircle,
  Bed,
  Stethoscope,
  Activity,
  Layers,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react'
import { Badge, StatusBadge, Button } from '../index'

/**
 * QuoteComparisonModal
 *
 * Implements EthAum Objective Quote Comparison Interface:
 * - Clear, side-by-side comparison across all required fields
 * - Strictly neutral: DOES NOT declare one quote "best" or "recommended"
 * - Empowers patient sovereign decision making
 * - Supports quick actions: "Ask Question", "Select Provider"
 */
export function QuoteComparisonModal({
  isOpen,
  onClose,
  quotes = [],
  onSelectProvider,
  onAskQuestion,
}) {
  const [highlightDifferences, setHighlightDifferences] = useState(false)

  if (!isOpen) return null

  // Filter out any drafts if present
  const comparableQuotes = quotes.filter((q) => q.status !== 'DRAFT')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[6px] shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden text-left">
        {/* Header Bar */}
        <div className="p-5 sm:px-6 bg-[var(--bg-base)] dark:bg-[#151C1A] border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-[4px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                VS
              </span>
              <h2 className="text-lg sm:text-xl font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Compare Institutional Quotes
              </h2>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Side-by-side evaluation of healthcare provider proposals. Presented neutrally to support your independent decision.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setHighlightDifferences(!highlightDifferences)}
              className={`px-3 py-1.5 rounded-[4px] text-xs font-medium border transition-colors flex items-center gap-1.5 cursor-pointer ${
                highlightDifferences
                  ? 'bg-[#173E39] text-white border-[#173E39] dark:bg-[#6F9F91] dark:text-[#101614]'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-default)] hover:bg-[var(--bg-base)]'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{highlightDifferences ? 'Differences Highlighted' : 'Highlight Differences'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-[4px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-base)] transition-colors cursor-pointer"
              title="Close Comparison"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Impartiality / Neutrality Notice */}
        <div className="px-6 py-2.5 bg-neutral-50 dark:bg-[#1A2421] border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
          <span>
            <strong>Neutral Evaluation Guarantee:</strong> EthAum does not mark any quote as "best", "winner", or "recommended". All package elements, costs, and exclusions are presented objectively.
          </span>
        </div>

        {/* Main Content Area - Responsive Grid / Table */}
        <div className="overflow-y-auto overflow-x-auto p-4 sm:p-6 flex-1 space-y-6">
          {comparableQuotes.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
              <p className="text-sm font-medium text-[var(--text-primary)]">No quotes available to compare</p>
              <p className="text-xs text-[var(--text-muted)]">Submitted quotes will appear here for side-by-side comparison.</p>
            </div>
          ) : (
            <div className="min-w-[760px]">
              {/* Top Row: Provider Header Columns */}
              <div
                className="grid gap-4 items-stretch"
                style={{
                  gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                }}
              >
                {/* Column 0: Category Label Header */}
                <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] flex flex-col justify-end">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--text-muted)] font-medium">
                    Dimension / Provider
                  </span>
                </div>

                {/* Column 1..N: Each Provider Quote Header */}
                {comparableQuotes.map((q) => {
                  const isAccepted = q.status === 'ACCEPTED'
                  const isRejected = q.status === 'REJECTED'
                  return (
                    <div
                      key={q.id}
                      className={`p-5 bg-[var(--bg-card)] rounded-[4px] border flex flex-col justify-between space-y-4 transition-all shadow-xs ${
                        isAccepted
                          ? 'border-2 border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20'
                          : isRejected
                          ? 'border-[var(--border-default)] opacity-60'
                          : 'border-[var(--border-default)] dark:border-[var(--border-default)]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-mono text-[var(--text-muted)]">Quote #{q.id}</span>
                          <StatusBadge status={q.status} />
                        </div>

                        <h3 className="text-base font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] leading-tight">
                          {q.providerName}
                        </h3>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <MapPin className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                          <span>
                            {q.providerCity || 'Delhi'}, {q.providerCountry || 'India'} {q.providerFlag || ''}
                          </span>
                        </div>

                        {q.providerAccreditation && (
                          <span className="inline-block text-[10px] font-mono text-[var(--green-rich)] dark:text-[var(--green-rich)] bg-[#EBF5EE] dark:bg-[#202B28] px-2 py-0.5 rounded-[3px]">
                            {q.providerAccreditation}
                          </span>
                        )}
                      </div>

                      {/* Total Price Strip */}
                      <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] text-right">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                          Total Package Cost
                        </span>
                        <div className="text-2xl font-serif font-medium text-[var(--text-primary)] dark:text-[var(--green-rich)]">
                          ${(q.total || q.price)?.toLocaleString()} <span className="text-xs font-sans font-normal text-[var(--text-muted)]">{q.currency || 'USD'}</span>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="space-y-1.5 pt-1">
                        {q.status === 'ACCEPTED' ? (
                          <div className="p-2 text-center text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/70 rounded-[4px] border border-emerald-300 dark:border-emerald-800">
                            ✓ Selected Provider
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            size="sm"
                            fullWidth
                            disabled={isRejected}
                            onClick={() => onSelectProvider(q)}
                          >
                            Select Provider
                          </Button>
                        )}

                        <Button
                          variant="outline"
                          size="sm"
                          fullWidth
                          onClick={() => onAskQuestion(q)}
                          leftIcon={<HelpCircle className="w-3.5 h-3.5" />}
                        >
                          Ask Question
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Comparison Matrix Rows */}
              <div className="divide-y divide-[var(--border-hairline)] dark:divide-[var(--border-default)] border-t border-b border-[var(--border-hairline)] mt-6 text-xs">
                {/* 1. Treatment & Surgical Method */}
                <div
                  className="grid gap-4 py-3.5 items-center"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Treatment</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="text-[var(--text-secondary)] font-medium">
                      {q.treatmentName}
                    </div>
                  ))}
                </div>

                {/* 2. Consultation Component */}
                <div
                  className={`grid gap-4 py-3.5 items-start ${
                    highlightDifferences ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <Activity className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Consultation</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        ${q.consultation?.cost || 0} {q.currency}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {q.consultation?.description || 'Pre-operative surgeon review & telemedicine session'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 3. Diagnostics Component */}
                <div
                  className={`grid gap-4 py-3.5 items-start ${
                    highlightDifferences ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <Layers className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Diagnostics</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="space-y-1">
                      <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        ${q.diagnostics?.cost || 0} {q.currency}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                        {q.diagnostics?.description || 'Pre-admission laboratory panels and imaging'}
                      </p>
                    </div>
                  ))}
                </div>

                {/* 4. Accommodation (if applicable) */}
                <div
                  className={`grid gap-4 py-3.5 items-start ${
                    highlightDifferences ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                  }`}
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <Bed className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Accommodation</span>
                  </div>
                  {comparableQuotes.map((q) => {
                    const acc = q.accommodation
                    if (!acc || !acc.applicable) {
                      return (
                        <div key={q.id} className="text-[var(--text-muted)] italic text-[11px]">
                          Not applicable / Outpatient
                        </div>
                      )
                    }
                    return (
                      <div key={q.id} className="space-y-1">
                        <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                          <span>${acc.cost || 0} {q.currency}</span>
                          <span className="text-[11px] text-[var(--text-muted)] font-normal">
                            ({acc.nights || 4} Nights)
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                          {acc.roomType || 'Private Patient Room'}
                        </p>
                        {acc.notes && (
                          <p className="text-[10px] text-[var(--text-muted)] italic">
                            {acc.notes}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* 5. Other Services */}
                <div
                  className="grid gap-4 py-3.5 items-start"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Other Services</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="space-y-1.5">
                      <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        ${q.otherServices?.cost || 0} {q.currency}
                      </div>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {q.otherServices?.description}
                      </p>
                      {q.otherServices?.items && q.otherServices.items.length > 0 && (
                        <ul className="space-y-1 text-[10px] text-[var(--text-secondary)]">
                          {q.otherServices.items.map((it, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <Check className="w-3 h-3 text-[var(--green-rich)] shrink-0 mt-0.5" />
                              <span>{it}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>

                {/* 6. Validity */}
                <div
                  className="grid gap-4 py-3.5 items-center"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Validity</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="text-xs font-mono text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      Valid until {q.validity || q.validUntil}
                    </div>
                  ))}
                </div>

                {/* 7. Clinical Notes */}
                <div
                  className="grid gap-4 py-3.5 items-start"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <FileText className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                    <span>Clinical Notes</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="text-[11px] text-[var(--text-secondary)] leading-relaxed italic bg-[var(--bg-base)] dark:bg-[#151C1A] p-2.5 rounded-[3px] border border-[var(--border-hairline)]">
                      "{q.notes || 'Standard protocol care package.'}"
                    </div>
                  ))}
                </div>

                {/* 8. Exclusions */}
                <div
                  className="grid gap-4 py-3.5 items-start"
                  style={{
                    gridTemplateColumns: `180px repeat(${comparableQuotes.length}, minmax(260px, 1fr))`,
                  }}
                >
                  <div className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5 pt-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Exclusions</span>
                  </div>
                  {comparableQuotes.map((q) => (
                    <div key={q.id} className="space-y-1">
                      {(q.exclusions || []).map((exc, idx) => (
                        <div key={idx} className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-start gap-1">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{exc}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 bg-[var(--bg-base)] dark:bg-[#151C1A] border-t border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-muted)] shrink-0">
          <span>{comparableQuotes.length} quotes compared</span>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuoteComparisonModal
