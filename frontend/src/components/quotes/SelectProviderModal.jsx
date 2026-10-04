import React from 'react'
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Calendar,
  DollarSign,
  AlertTriangle,
  X,
  CreditCard,
} from 'lucide-react'
import { Button } from '../index'

export function SelectProviderModal({
  isOpen,
  onClose,
  quote,
  onConfirmSelection,
  isProcessing = false,
}) {
  if (!isOpen || !quote) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[6px] shadow-2xl w-full max-w-lg p-6 space-y-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Confirm Provider Selection
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Selecting {quote.providerName} for your medical journey
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Quote Summary */}
        <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] space-y-3 text-xs">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                {quote.providerName}
              </h4>
              <p className="text-xs text-[var(--text-muted)]">
                {quote.providerCity}, {quote.providerCountry} · {quote.providerAccreditation}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                Agreed Total
              </span>
              <strong className="text-lg font-serif font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                ${(quote.total || quote.price)?.toLocaleString()} {quote.currency}
              </strong>
            </div>
          </div>

          <div className="pt-2 border-t border-[var(--border-hairline)] space-y-1 text-[11px] text-[var(--text-secondary)]">
            <p>
              <strong>Procedure:</strong> {quote.treatmentName}
            </p>
            <p>
              <strong>Hospital Stay:</strong> {quote.estimatedStayDays || 10} days inpatient & recovery
            </p>
            <p>
              <strong>Validity:</strong> Quote locked until {quote.validity || quote.validUntil}
            </p>
          </div>
        </div>

        {/* STOP NOTICE: NO PAYMENT PROCESSING */}
        <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-[4px] space-y-1.5 text-xs text-blue-900 dark:text-blue-200">
          <div className="flex items-center gap-2 font-medium">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>No Payment Processed Today</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
            EthAum does not take direct payment at this step. Confirming this quote selects this hospital as your official provider and allows the clinical desk to finalize your appointment schedule, surgical slot, and travel assistance.
          </p>
        </div>

        {/* Next Steps Explanation */}
        <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
          <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] block text-[11px] uppercase tracking-wider">
            What happens next:
          </span>
          <ul className="space-y-1 list-disc list-inside text-[11px] text-[var(--text-secondary)]">
            <li>Quote status transitions to <strong>ACCEPTED</strong>.</li>
            <li>Your case stage updates to <strong>Provider Selected</strong>.</li>
            <li>You will be scheduled for your pre-surgical video consultation with the lead surgeon.</li>
            <li>The international desk will issue your Medical Visa (MED-V) invitation letter.</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Review Other Quotes
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            loading={isProcessing}
            onClick={() => onConfirmSelection(quote.id)}
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Confirm & Select Provider
          </Button>
        </div>
      </div>
    </div>
  )
}

export default SelectProviderModal
