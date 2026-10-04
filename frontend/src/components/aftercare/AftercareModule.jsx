import React, { useState, useEffect } from 'react'
import {
  HeartHandshake,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileText,
  Download,
  Send,
  User,
  Phone,
  Video,
  Award,
  AlertTriangle,
  Stethoscope,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Activity,
  Check,
} from 'lucide-react'
import { Badge, StatusBadge, Button, useToast } from '../index'
import { aftercareService } from '../../services/aftercareService'

/**
 * AftercareModule
 *
 * Implements EthAum Coordination-Focused Aftercare Support:
 * - Follow-up reminders (interactive post-op timeline)
 * - Appointment information (post-op follow-up video consults)
 * - Recovery information provided by provider (strictly doctor-verified directives, NEVER AI-generated)
 * - Documents repository (discharge summary, operative notes, implant passport, fit-to-fly)
 * - Communication channel (logistics & coordination with international hospital care team)
 * - Strict Rule: "Do not generate medical recovery instructions using AI unless explicitly provided by authorized medical professionals."
 * - Strict STOP: "Keep aftercare coordination-focused."
 */
export function AftercareModule({ caseId = 'ET-8492', medicalCase }) {
  const { addToast } = useToast()

  const [aftercarePlan, setAftercarePlan] = useState(null)
  const [reminders, setReminders] = useState([])
  const [directives, setDirectives] = useState([])
  const [documents, setDocuments] = useState([])
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSendingMessage, setIsSendingMessage] = useState(false)
  const [activeDirectiveTab, setActiveDirectiveTab] = useState('all')

  // Load aftercare data
  useEffect(() => {
    let isMounted = true
    aftercareService.getAftercarePlan(caseId).then((plan) => {
      if (isMounted && plan) {
        setAftercarePlan(plan)
        setReminders(plan.reminders || [])
        setDirectives(plan.directives || [])
        setDocuments(plan.documents || [])
        setMessages(plan.messages || [])
      }
    })
    return () => {
      isMounted = false
    }
  }, [caseId])

  // Acknowledge Reminder
  const handleAcknowledgeReminder = async (reminderId) => {
    try {
      const updated = await aftercareService.acknowledgeReminder(caseId, reminderId)
      if (updated) {
        setReminders((prev) =>
          prev.map((r) => (r.id === reminderId ? { ...r, status: 'COMPLETED', acknowledgedAt: new Date().toISOString() } : r))
        )
        addToast({
          type: 'success',
          title: 'Milestone Acknowledged',
          message: 'Post-op aftercare reminder marked as completed.',
        })
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      })
    }
  }

  // Send Coordination Message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setIsSendingMessage(true)
    try {
      const msg = await aftercareService.sendMessage(caseId, {
        senderRole: 'patient',
        senderName: medicalCase?.patientName || 'Eleanor Vance',
        content: newMessage.trim(),
      })
      if (msg) {
        setMessages((prev) => [...prev, msg])
        setNewMessage('')
        addToast({
          type: 'success',
          title: 'Message Sent',
          message: 'Your coordination inquiry was sent to the international desk.',
        })
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error Sending',
        message: err.message,
      })
    } finally {
      setIsSendingMessage(false)
    }
  }

  const coordinator = aftercarePlan?.careCoordinator || {
    name: 'Ananya Roy',
    role: 'International Patient Care Coordinator',
    phone: '+91 11 2692 5858 ext 402',
    email: 'ananya.roy@apollohealth.org',
  }

  return (
    <div className="space-y-6 text-left">
      {/* ========================================================================= */}
      {/* SAFETY & PROVENANCE DIRECTIVE BANNER                                      */}
      {/* ========================================================================= */}
      <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-[4px] flex items-start gap-3 text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-emerald-950 dark:text-emerald-200">
            Authorized Provider Recovery Protocol · Coordination-Focused Aftercare
          </p>
          <p className="text-emerald-900/80 dark:text-emerald-300/80 text-[11px] leading-relaxed">
            All clinical recovery guidelines below are explicitly authorized and signed by your operating surgeon,{' '}
            <strong>Dr. Vikram Oberoi</strong>, and Lead Joint Physiotherapist <strong>Meera Rao, MPT</strong>. In strict
            compliance with EthAum clinical safety guidelines, no medical recovery instructions are generated by AI. EthAum
            acts strictly as a care coordination and logistics bridge.
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. FOLLOW-UP REMINDERS TIMELINE                                           */}
      {/* ========================================================================= */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[3px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                <Clock className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Follow-Up Reminders & Recovery Milestones
              </h3>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Structured post-surgical timeline tracking acute wound checks, mobility exercises, and surgeon sign-offs.
            </p>
          </div>
          <Badge variant="sage">
            {reminders.filter((r) => r.status === 'COMPLETED').length} of {reminders.length} Milestones Done
          </Badge>
        </div>

        <div className="space-y-3 pt-1">
          {reminders.map((reminder) => {
            const isCompleted = reminder.status === 'COMPLETED'

            return (
              <div
                key={reminder.id}
                className={`p-4 rounded-[4px] border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isCompleted
                    ? 'bg-[var(--bg-base)] dark:bg-[#151C1A] border-[var(--border-hairline)] dark:border-[var(--border-default)] opacity-85'
                    : 'bg-[var(--bg-card)] border-[var(--border-default)] dark:border-[var(--border-default)] ring-1 ring-emerald-500/10'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-7 h-7 rounded-full text-xs font-medium flex items-center justify-center shrink-0 mt-0.5 ${
                      isCompleted
                        ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614]'
                        : 'bg-[var(--bg-elevated)] dark:bg-[#202B28] text-[var(--text-primary)] border border-[var(--border-hairline)]'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : reminder.daysPostOp}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        {reminder.title}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border-hairline)]">
                        Due: {reminder.dueDate}
                      </span>
                      {isCompleted && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-primary)]/75 dark:text-[#B6C0BC]">
                      {reminder.instructions}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isCompleted ? (
                    <span className="text-[11px] text-[var(--text-muted)] font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                      Acknowledged
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAcknowledgeReminder(reminder.id)}
                      className="cursor-pointer text-xs"
                    >
                      Mark Complete
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. APPOINTMENT INFORMATION                                                */}
      {/* ========================================================================= */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[3px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                <Video className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Post-Op Follow-Up Appointments
              </h3>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Direct video consultations with your international operating surgeon and lead rehabilitation team.
            </p>
          </div>
          <Badge variant="sage">Confirmed Tele-Consults</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Appointment 1 */}
          <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-medium">
                  Confirmed
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Day 14 Post-Op</span>
              </div>
              <h4 className="text-xs font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Post-Op Day 14 Wound & Mobility Tele-Consult
              </h4>
              <div className="text-[11px] text-[var(--text-primary)]/70 dark:text-[#B6C0BC] space-y-1">
                <p className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                  <span>Dr. Vikram Oberoi & Meera Rao, MPT</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Nov 30, 2026 at 10:00 UTC (15:30 IST)</span>
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Objective: Surgical incision inspection, active flexion verification, and issuance of clearance for international return.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <a
                href="https://meet.ethaum.health/room/ET-8492-POSTOP14"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] text-xs font-medium hover:opacity-95 transition-opacity"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Launch Video Room</span>
              </a>
              <span className="text-[10px] text-[var(--text-muted)]">Encrypted Video Desk</span>
            </div>
          </div>

          {/* Appointment 2 */}
          <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex flex-col justify-between space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-300 font-medium">
                  Scheduled
                </span>
                <span className="text-[10px] font-mono text-[var(--text-muted)]">Day 30 Post-Op</span>
              </div>
              <h4 className="text-xs font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Day 30 Functional Range of Motion Assessment
              </h4>
              <div className="text-[11px] text-[var(--text-primary)]/70 dark:text-[#B6C0BC] space-y-1">
                <p className="flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                  <span>Meera Rao, MPT (Lead Joint Arthroplasty Physio)</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Dec 16, 2026 at 11:30 UTC (17:00 IST)</span>
                </p>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Objective: Evaluate quadriceps hypertrophy, independent ambulation without cane, and stationary bike progression.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <a
                href="https://meet.ethaum.health/room/ET-8492-POSTOP30"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-[var(--border-default)] text-[var(--text-primary)] text-xs font-medium hover:bg-[var(--bg-card)] transition-colors"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Room Link</span>
              </a>
              <span className="text-[10px] text-[var(--text-muted)]">Rehab Session</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. RECOVERY INFORMATION PROVIDED BY PROVIDER                              */}
      {/* ========================================================================= */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[3px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Recovery Information Provided by Provider
              </h3>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Authorized clinical recovery directives issued directly by Dr. Vikram Oberoi & Apollo Health City.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium text-emerald-800 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-[3px] border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Doctor Verified
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setActiveDirectiveTab('all')}
            className={`px-2.5 py-1 rounded-[3px] font-medium text-xs transition-colors cursor-pointer ${
              activeDirectiveTab === 'all'
                ? 'bg-[#173E39] text-white dark:bg-[#6F9F91] dark:text-[#101614]'
                : 'bg-[var(--bg-base)] text-[var(--text-primary)]/70 hover:bg-[var(--bg-card)]'
            }`}
          >
            All Protocols ({directives.length})
          </button>
          {directives.map((d, idx) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDirectiveTab(d.id)}
              className={`px-2.5 py-1 rounded-[3px] font-medium text-xs whitespace-nowrap transition-colors cursor-pointer ${
                activeDirectiveTab === d.id
                  ? 'bg-[#173E39] text-white dark:bg-[#6F9F91] dark:text-[#101614]'
                  : 'bg-[var(--bg-base)] text-[var(--text-primary)]/70 hover:bg-[var(--bg-card)]'
              }`}
            >
              {d.category.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Directives Cards */}
        <div className="space-y-4 pt-1">
          {directives
            .filter((d) => activeDirectiveTab === 'all' || activeDirectiveTab === d.id)
            .map((directive) => (
              <div
                key={directive.id}
                className="p-5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-[var(--border-hairline)]">
                  <div>
                    <h4 className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {directive.category}
                    </h4>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Authorizing Physician: <strong>{directive.authorizingDoctor}</strong> · {directive.institution}
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">
                    Verified {directive.verifiedAt?.split('T')[0]}
                  </span>
                </div>

                {/* Clinical Directives */}
                <div className="space-y-1.5">
                  <span className="text-[11px] uppercase tracking-wider font-mono text-[var(--text-muted)] font-medium">
                    Clinical Action Directives:
                  </span>
                  <ul className="space-y-1 text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    {directive.directives.map((dir, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{dir}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Precautions */}
                {directive.precautions && directive.precautions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-amber-900 dark:text-amber-400 font-medium">
                      Precautions & Restrictions:
                    </span>
                    <ul className="space-y-1 text-xs text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                      {directive.precautions.map((prec, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-800 dark:text-amber-400 shrink-0 mt-0.5" />
                          <span>{prec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Warning Signs (Red Flags) */}
                {directive.warningSignsWhenToContactEmergency && (
                  <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-[3px] border border-red-200 dark:border-red-900/40 space-y-1 text-xs">
                    <span className="text-[11px] uppercase tracking-wider font-mono text-red-900 dark:text-red-300 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-800 dark:text-red-400" />
                      When to Contact Hospital Emergency Desk Immediately:
                    </span>
                    <ul className="space-y-0.5 text-[11px] text-red-900 dark:text-red-200">
                      {directive.warningSignsWhenToContactEmergency.map((warn, idx) => (
                        <li key={idx}>• {warn}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explicit Disclaimer */}
                <div className="pt-1 text-[10px] text-[var(--text-muted)] italic">
                  {directive.disclaimer}
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. DOCUMENTS REPOSITORY                                                   */}
      {/* ========================================================================= */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[3px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Discharge & Recovery Documentation Vault
              </h3>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Official hospital discharge papers, surgical operative log, ceramic implant passport, and fit-to-fly certificates.
            </p>
          </div>
          <Badge variant="outline">{documents.length} Verified Files</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex flex-col justify-between space-y-3 text-xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-hairline)]">
                    {doc.type}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">{doc.fileSize}</span>
                </div>
                <h5 className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] line-clamp-2 leading-snug">
                  {doc.title}
                </h5>
                <p className="text-[11px] text-[var(--text-muted)]">
                  Issued by: {doc.issuedBy}
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-[10px] font-mono text-[var(--text-muted)]">
                  Ref: {doc.verificationCode}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    addToast({
                      type: 'success',
                      title: 'Download Initiated',
                      message: `Downloading "${doc.title}".`,
                    })
                  }
                  className="gap-1 text-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. COORDINATION COMMUNICATION CHANNEL                                      */}
      {/* ========================================================================= */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-[3px] bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614] flex items-center justify-center font-medium text-xs">
                <MessageSquare className="w-3.5 h-3.5" />
              </span>
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Care Team Coordination Channel
              </h3>
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
              Direct logistical communication with international care coordinator and clinical desk.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>International Desk Online</span>
          </div>
        </div>

        {/* Messaging Layout: Messages on left, Emergency Concierge on right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-1">
          {/* Messages Thread (2 columns) */}
          <div className="lg:col-span-2 flex flex-col justify-between space-y-3 bg-[var(--bg-base)] dark:bg-[#151C1A] p-4 rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] min-h-[340px]">
            {/* Thread Container */}
            <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
              {messages.map((msg) => {
                const isPatient = msg.senderRole === 'patient'

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-[4px] text-xs space-y-1 ${
                        isPatient
                          ? 'bg-[#173E39] text-[#F8F8F5] dark:bg-[#6F9F91] dark:text-[#101614]'
                          : 'bg-[var(--bg-card)] text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-hairline)] dark:border-[var(--border-default)]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-[10px] opacity-80 pb-0.5">
                        <span className="font-medium">{msg.senderName}</span>
                        <span className="font-mono">
                          {msg.timestamp ? msg.timestamp.split('T')[1]?.slice(0, 5) : 'Now'}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="pt-2 border-t border-[var(--border-hairline)] flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask coordinator about travel, appointment time, or documents..."
                className="flex-1 px-3 py-2 text-xs bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[3px] focus:outline-none focus:ring-1 focus:ring-[#315B55]"
              />
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSendingMessage || !newMessage.trim()}
                className="gap-1 cursor-pointer shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </Button>
            </form>
          </div>

          {/* Emergency & Coordinator Info (1 column) */}
          <div className="space-y-4">
            {/* Coordinator Card */}
            <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-3 text-xs">
              <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] font-medium">
                Assigned Coordinator
              </span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#173E39] text-[#F8F8F5] flex items-center justify-center font-medium text-sm shrink-0">
                  AR
                </div>
                <div>
                  <h5 className="font-medium text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    {coordinator.name}
                  </h5>
                  <p className="text-[11px] text-[var(--text-muted)]">{coordinator.role}</p>
                </div>
              </div>
              <div className="text-[11px] text-[var(--text-muted)] space-y-1 pt-1 border-t border-[var(--border-hairline)]">
                <p>Phone: <span className="font-mono text-[var(--text-primary)] dark:text-[#F2F4F1]">{coordinator.phone}</span></p>
                <p>Email: <span className="font-mono text-[var(--text-primary)] dark:text-[#F2F4F1]">{coordinator.email}</span></p>
              </div>
            </div>

            {/* 24/7 Emergency Contacts Card */}
            <div className="p-4 bg-red-50/60 dark:bg-red-950/20 rounded-[4px] border border-red-200 dark:border-red-900/40 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 text-red-900 dark:text-red-300 font-medium">
                <Phone className="w-3.5 h-3.5" />
                <span>24/7 International Hospital Emergency</span>
              </div>
              <p className="text-[11px] text-red-800 dark:text-red-200">
                For urgent post-operative concerns outside scheduled tele-consultations:
              </p>
              <div className="space-y-1 font-mono text-xs text-red-950 dark:text-red-100 font-medium pt-1">
                <p>Hospital: +91 11 2692 5858</p>
                <p>Emergency: +91 98 1000 8492</p>
                <p>National Ambulance: 112 / 102</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
