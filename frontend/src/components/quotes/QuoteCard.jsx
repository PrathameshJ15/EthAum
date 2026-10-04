import React, { useState } from 'react'
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  HelpCircle,
  ShieldCheck,
  Bed,
  Stethoscope,
  Activity,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Check,
  AlertCircle,
  MessageSquare,
  Star,
} from 'lucide-react'
import { Badge, StatusBadge, Button } from '../index'

export function QuoteCard({
  quote,
  onCompare,
  onAskQuestion,
  onSelectProvider,
  onRejectQuote,
}) {
  const [showDetails, setShowDetails] = useState(false)
  const [showQuestions, setShowQuestions] = useState(false)

  const isAccepted = quote.status === 'ACCEPTED'
  const isRejected = quote.status === 'REJECTED'
  const isExpired = quote.status === 'EXPIRED'
  const isSubmitted = quote.status === 'SUBMITTED' || quote.status === 'PENDING'

  const questionsCount = quote.questions?.length || 0

  return (
    <div
      className={`p-6 bg-[var(--bg-card)] rounded-[4px] border transition-all duration-200 shadow-xs flex flex-col justify-between space-y-5 text-left ${
        isAccepted
          ? 'border-2 border-emerald-600 bg-emerald-50/10 dark:bg-emerald-950/10'
          : isRejected
          ? 'border-[var(--border-default)] opacity-60'
          : 'border-[var(--border-default)] dark:border-[var(--border-default)] hover:border-[var(--green-rich)]/40'
      }`}
    >
      <div className="space-y-4">
        {/* Top Bar: Quote ID & Status */}
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-[var(--text-muted)]">Quote #{quote.id}</span>
            <StatusBadge status={quote.status} />
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
              Package Price
            </span>
            <span className="text-2xl font-serif font-medium text-[var(--text-primary)] dark:text-[var(--green-rich)]">
              ${(quote.total || quote.price)?.toLocaleString()}{' '}
              <span className="text-xs font-sans font-normal text-[var(--text-muted)]">{quote.currency || 'USD'}</span>
            </span>
          </div>
        </div>

        {/* Provider Profile Info */}
        <div className="space-y-1.5">
          <h4 className="text-lg font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] leading-snug">
            {quote.providerName}
          </h4>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1 font-medium text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
              <MapPin className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
              {quote.providerCity || 'Delhi'}, {quote.providerCountry || 'India'} {quote.providerFlag || ''}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star className="w-3 h-3 fill-amber-500" />
              {quote.providerRating || 4.9}
            </span>
            {quote.providerAccreditation && (
              <>
                <span>•</span>
                <span className="font-mono text-[10px] text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                  {quote.providerAccreditation}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Procedure & Target Treatment */}
        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] space-y-1 text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-hairline)]">
          <p className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
            <span className="text-[var(--text-muted)] font-normal">Procedure: </span>
            {quote.treatmentName}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--text-muted)] pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[var(--green-rich)]" />
              Stay: {quote.estimatedStayDays || 10} Days
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--green-rich)]" />
              Valid until: {quote.validity || quote.validUntil}
            </span>
          </div>
        </div>

        {/* Itemized 4-Part Cost Grid Preview */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Consultation */}
          <div className="p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Consultation
            </span>
            <span className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
              ${quote.consultation?.cost || 0} {quote.currency}
            </span>
          </div>

          {/* Diagnostics */}
          <div className="p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Diagnostics
            </span>
            <span className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
              ${quote.diagnostics?.cost || 0} {quote.currency}
            </span>
          </div>

          {/* Accommodation */}
          <div className="p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Accommodation
            </span>
            <span className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
              {quote.accommodation?.applicable ? (
                `$${quote.accommodation.cost || 0} (${quote.accommodation.nights || 4}N)`
              ) : (
                <span className="text-[var(--text-muted)]">N/A</span>
              )}
            </span>
          </div>

          {/* Other Services */}
          <div className="p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] space-y-0.5">
            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block">
              Other Services
            </span>
            <span className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
              ${quote.otherServices?.cost || 0} {quote.currency}
            </span>
          </div>
        </div>

        {/* Expand Details Toggle */}
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium hover:underline flex items-center gap-1 cursor-pointer pt-1"
        >
          <span>{showDetails ? 'Hide Comprehensive Breakdown' : 'View Full Itemization & Exclusions'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Comprehensive Details Drawer */}
        {showDetails && (
          <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] space-y-3.5 text-xs animate-in fade-in duration-150">
            {/* Clinical Notes */}
            {quote.notes && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                  Clinical & Protocol Notes:
                </span>
                <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed">
                  "{quote.notes}"
                </p>
              </div>
            )}

            {/* Inclusions Detail */}
            {quote.inclusions && quote.inclusions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                  Package Inclusions:
                </span>
                <div className="space-y-1">
                  {quote.inclusions.map((inc, i) => (
                    <div key={i} className="text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                      <span>{inc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions Detail */}
            {quote.exclusions && quote.exclusions.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[var(--border-hairline)]">
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-700 dark:text-amber-400 block flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Exclusions (What is NOT covered):
                </span>
                <div className="space-y-1">
                  {quote.exclusions.map((exc, i) => (
                    <div key={i} className="text-[11px] text-neutral-600 dark:text-neutral-400 flex items-start gap-1.5">
                      <span className="text-amber-600 font-bold shrink-0">•</span>
                      <span>{exc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Question Counter & Q&A Preview */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <button
            type="button"
            onClick={() => onAskQuestion(quote)}
            className="inline-flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[var(--green-rich)]" />
            <span>
              {questionsCount > 0 ? `${questionsCount} Question${questionsCount > 1 ? 's' : ''} asked` : 'Ask a Question'}
            </span>
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)] flex flex-wrap items-center justify-between gap-2.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCompare(quote)}
        >
          Compare
        </Button>

        <div className="flex items-center gap-2">
          {isSubmitted && (
            <>
              {onRejectQuote && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRejectQuote(quote)}
                  className="text-neutral-500 hover:text-red-600"
                >
                  Decline
                </Button>
              )}
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectProvider(quote)}
              >
                Select Provider
              </Button>
            </>
          )}

          {isAccepted && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-[4px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium text-xs">
              <Check className="w-3.5 h-3.5" />
              <span>Selected Provider</span>
            </div>
          )}

          {isRejected && (
            <span className="text-xs text-[var(--text-muted)] font-medium">
              Declined
            </span>
          )}

          {isExpired && (
            <span className="text-xs text-neutral-500 font-medium">
              Quote Expired
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuoteCard
