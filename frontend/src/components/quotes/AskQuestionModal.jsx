import React, { useState } from 'react'
import { X, Send, HelpCircle, MessageSquare, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '../index'

export function AskQuestionModal({
  isOpen,
  onClose,
  quote,
  onSubmitQuestion,
  isSubmitting = false,
}) {
  const [questionText, setQuestionText] = useState('')

  if (!isOpen || !quote) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!questionText.trim()) return
    onSubmitQuestion(quote.id, questionText.trim())
    setQuestionText('')
  }

  const existingQuestions = quote.questions || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[6px] shadow-xl w-full max-w-lg p-6 space-y-5 text-left">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Ask Provider a Question
              </h3>
              <p className="text-xs text-[var(--text-muted)]">
                Regarding Quote #{quote.id} · {quote.providerName}
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

        {/* Existing Q&A Thread if any */}
        {existingQuestions.length > 0 && (
          <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] block">
              Previous Inquiries & Responses
            </span>
            {existingQuestions.map((q) => (
              <div
                key={q.id}
                className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] space-y-2 text-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                      {q.question}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      Asked {new Date(q.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {q.status === 'ANSWERED' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded shrink-0">
                      <CheckCircle2 className="w-3 h-3" /> Answered
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded shrink-0">
                      <Clock className="w-3 h-3" /> Awaiting Answer
                    </span>
                  )}
                </div>

                {q.answer && (
                  <div className="pt-1.5 border-t border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] bg-[var(--bg-card)] p-2 rounded-[3px]">
                    <strong className="text-[var(--green-rich)] dark:text-[var(--green-rich)] block text-[10px] uppercase font-mono">
                      {q.answeredBy || 'Provider Response'}:
                    </strong>
                    <p className="mt-0.5">{q.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Question Submission Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] mb-1">
              Your Question for {quote.providerName} <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Can companion stay in the room post-op? Does package include airport transfers both ways? Can I request a specific implant brand?"
              className="w-full p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-default)] rounded-[4px] outline-none focus:border-[#315B55] dark:focus:border-[#6F9F91]"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              Your question will be delivered directly to the hospital's clinical desk.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || !questionText.trim()}
              leftIcon={<Send className="w-3.5 h-3.5" />}
            >
              {isSubmitting ? 'Sending...' : 'Submit Question'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AskQuestionModal
