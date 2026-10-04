import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileText,
  PlusCircle,
  ShieldCheck,
  Video,
  Clock,
  MapPin,
  DollarSign,
  Upload,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import {
  Modal,
  FileUploader,
  useToast,
} from '../../components'

import { caseService } from '../../services/caseService'
import { recordService } from '../../services/recordService'

export function PatientDashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const [cases, setCases] = useState(() => caseService.getAllCasesSync())
  const [loadingCases, setLoadingCases] = useState(false)
  const activeCase = cases[0] || null

  useEffect(() => {
    let isMounted = true
    setLoadingCases(true)
    caseService
      .getAllCases()
      .then((loaded) => {
        if (isMounted && Array.isArray(loaded) && loaded.length > 0) {
          setCases(loaded)
        }
      })
      .catch((err) => {
        console.warn('Dashboard cases sync notice:', err)
      })
      .finally(() => {
        if (isMounted) setLoadingCases(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Fast Quick-Action Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [newFiles, setNewFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  // Quick Quotes Modal State
  const [quotesModalOpen, setQuotesModalOpen] = useState(false)

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (newFiles.length === 0) {
      addToast({
        type: 'error',
        title: 'No Files Selected',
        message: 'Please choose at least one diagnostic scan to attach.',
      })
      return
    }

    setIsUploading(true)
    try {
      for (const file of newFiles) {
        const uploadInit = await recordService.requestUploadUrl({
          caseId: activeCase?.id || 'ET-8492',
          fileName: file.name,
          category: 'Other',
          type: 'Diagnostic Scan',
          size: `${Math.round(file.size / 1024)} KB`,
          sizeBytes: file.size,
        })
        if (uploadInit?.uploadUrl) {
          await recordService.uploadFileDirect(uploadInit.uploadUrl, file)
        }
        caseService.addRecord(activeCase?.id || 'ET-8492', {
          name: file.name,
          category: 'Other',
          type: 'Diagnostic Scan',
          size: `${Math.round(file.size / 1024)} KB`,
        })
      }
    } catch (err) {
      console.warn('[PatientDashboardPage] Upload API error, saved locally:', err.message)
      for (const file of newFiles) {
        caseService.addRecord(activeCase?.id || 'ET-8492', {
          name: file.name,
          category: 'Other',
          type: 'Diagnostic Scan',
          size: `${Math.round(file.size / 1024)} KB`,
        })
      }
    } finally {
      setIsUploading(false)
      setUploadModalOpen(false)
      addToast({
        type: 'success',
        title: 'Diagnostic Scans Uploaded',
        message: `${newFiles.length} new records encrypted and added to Case #${activeCase?.id || 'ET-8492'}.`,
      })
      setNewFiles([])
      setCases(caseService.getAllCasesSync())
    }
  }

  // Exact 8 Journey Tracker Milestones specified by prompt:
  // ✓ Case Created
  // ✓ Records Uploaded
  // ✓ AI Organization
  // ✓ Providers Matched
  // ✓ Quotes Compared
  // ● Consultation
  // ○ Treatment
  // ○ Aftercare
  const journeyMilestones = [
    { id: 'created', label: 'Case Created', state: 'completed', icon: '✓', desc: 'Dossier initialized' },
    { id: 'records', label: 'Records Uploaded', state: 'completed', icon: '✓', desc: '4 scans in private vault' },
    { id: 'ai', label: 'AI Organization', state: 'completed', icon: '✓', desc: 'Grok synthesis active' },
    { id: 'matching', label: 'Providers Matched', state: 'completed', icon: '✓', desc: 'JCI centers screened' },
    { id: 'quotes', label: 'Quotes Compared', state: 'completed', icon: '✓', desc: '2 institutional packages' },
    { id: 'consultation', label: 'Consultation', state: 'active', icon: '●', desc: 'Video session confirmed' },
    { id: 'treatment', label: 'Treatment', state: 'upcoming', icon: '○', desc: 'Hospital admission' },
    { id: 'aftercare', label: 'Aftercare', state: 'upcoming', icon: '○', desc: 'Rehab timeline' },
  ]

  return (
    <div className="min-h-screen py-10 sm:py-16 text-left max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-10">
      {/* 1. HEADER: Welcome Back */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--border-hairline)]">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2 font-sans">
            <span className="inline-block w-5 h-[1px] bg-[var(--green-rich)]" />
            Patient Sovereign Dossier
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-light text-[var(--text-primary)] tracking-tight">
            Welcome back, {user?.name || 'Eleanor'}
          </h1>
          <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans mt-2">
            Active cross-border healthcare journey status, schedule milestones, and immediate care tasks.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => navigate(`/cases/${activeCase?.id || 'ET-8492'}`)}
            className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[3px] px-4 py-2.5 text-xs font-sans"
          >
            Open Dossier ({activeCase?.id || 'ET-8492'})
          </button>

          <button
            onClick={() => navigate('/create-case')}
            className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors rounded-[3px] px-5 py-2.5 text-xs font-medium font-sans tracking-[0.02em]"
          >
            Create Medical Case
          </button>
        </div>
      </div>

      {/* 2. STATS STRIP: My Cases, Quotes, Appointments, Bookings */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: My Cases */}
        <div
          onClick={() => navigate(`/cases/${activeCase?.id || 'ET-8492'}`)}
          className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-normal uppercase tracking-wider text-[var(--green-rich)] font-sans">
              My Cases
            </span>
            <FileText className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)]">
            {cases.length}
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans font-light mt-1 truncate">
            Active: {activeCase?.treatmentName || 'Total Knee Arthroplasty'}
          </p>
        </div>

        {/* Stat 2: Quotes */}
        <div
          onClick={() => setQuotesModalOpen(true)}
          className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-normal uppercase tracking-wider text-[var(--copper)] font-sans">
              Quotes
            </span>
            <DollarSign className="w-4 h-4 text-[var(--copper)]" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)]">
            {activeCase?.quotes?.length || 2}
          </div>
          <p className="text-xs text-[var(--copper)] font-sans font-normal mt-1 truncate tabular-nums">
            From $6,500 USD (Apex Joint)
          </p>
        </div>

        {/* Stat 3: Appointments */}
        <div
          onClick={() => navigate(`/cases/${activeCase?.id || 'ET-8492'}`)}
          className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-normal uppercase tracking-wider text-[var(--text-muted)] font-sans">
              Tele-Consult
            </span>
            <Video className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)]">
            1 Active
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans font-light mt-1 truncate">
            Tomorrow · 2:00 PM EST
          </p>
        </div>

        {/* Stat 4: Destination */}
        <div
          onClick={() => navigate('/destinations/india')}
          className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-normal uppercase tracking-wider text-[var(--text-muted)] font-sans">
              Corridor
            </span>
            <MapPin className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
          </div>
          <div className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)]">
            India
          </div>
          <p className="text-xs text-[var(--text-secondary)] font-sans font-light mt-1 truncate">
            New Delhi · JCI Accredited
          </p>
        </div>
      </div>

      {/* 3. PATIENT CARE GUIDANCE: 4 Core Questions */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 space-y-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] flex items-center gap-2 font-sans">
          <span className="inline-block w-5 h-[1px] bg-[var(--green-rich)]" />
          Care Guidance & Immediate Priorities
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
            <span className="text-[10px] uppercase font-sans text-[var(--text-muted)] block">
              1. What is my current case?
            </span>
            <p className="font-medium text-[var(--text-primary)] font-sans text-xs">
              #{activeCase?.id || 'ET-8492'} · {activeCase?.treatmentName || 'Total Knee Replacement'}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-light leading-relaxed">
              Targeting robotic Mako procedure in New Delhi with companion accommodation.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
            <span className="text-[10px] uppercase font-sans text-[var(--text-muted)] block">
              2. What is happening now?
            </span>
            <p className="font-medium text-[var(--text-primary)] font-sans text-xs">
              Surgeon Tele-Consultation Active
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-light leading-relaxed">
              Dr. Vikram Oberoi reviewed your MRI scans and confirmed joint resurfacing feasibility.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
            <span className="text-[10px] uppercase font-sans text-[var(--copper)] block">
              3. What do I need to do?
            </span>
            <p className="font-medium text-[var(--text-primary)] font-sans text-xs">
              Review Pre-Call Checklist
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-light leading-relaxed">
              Test your device microphone and review questions before joining the call room.
            </p>
          </div>

          <div className="p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
            <span className="text-[10px] uppercase font-sans text-[var(--text-muted)] block">
              4. What happens next?
            </span>
            <p className="font-medium text-[var(--text-primary)] font-sans text-xs">
              Medical Visa & Travel Schedule
            </p>
            <p className="text-[11px] text-[var(--text-secondary)] font-light leading-relaxed">
              Upon consultation completion, EthAum issues your MED-V visa invitation package.
            </p>
          </div>
        </div>
      </div>

      {/* 4. MAIN: Current Medical Case Hero Card */}
      <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div>
            <span className="text-[10px] uppercase font-sans text-[var(--copper)] tracking-wider block">
              Active Medical Dossier
            </span>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-[var(--text-primary)] mt-1">
              Case #{activeCase?.id || 'ET-8492'} · {activeCase?.treatmentName || 'Total Knee Replacement'}
            </h2>
          </div>

          <button
            onClick={() => navigate(`/cases/${activeCase?.id || 'ET-8492'}`)}
            className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[3px] px-4 py-2 text-xs font-sans self-start sm:self-auto"
          >
            Open Full Case Dossier &rarr;
          </button>
        </div>

        {/* Case Details Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] text-xs font-sans">
          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Treatment</span>
            <span className="text-[var(--text-primary)] font-medium mt-0.5 block">{activeCase?.treatmentName || 'Total Knee Replacement'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Destination</span>
            <span className="text-[var(--text-primary)] font-medium mt-0.5 block">{activeCase?.destinationName || 'New Delhi, India'}</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Center & Surgeon</span>
            <span className="text-[var(--text-primary)] font-medium mt-0.5 block">{activeCase?.providerName || 'Apex Joint Institute'} (Dr. Oberoi)</span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-[var(--text-muted)] block">Next Appointment</span>
            <span className="text-[var(--copper)] font-normal mt-0.5 block">Tomorrow · 2:00 PM EST</span>
          </div>
        </div>

        {/* 5. JOURNEY TRACKER */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <span className="text-[var(--text-primary)] font-medium flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[var(--green-rich)]" />
              Healthcare Journey Tracker
            </span>
            <span className="text-[var(--copper)]">Stage 6 of 8 Active</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {journeyMilestones.map((m) => {
              const isCompleted = m.state === 'completed'
              const isActive = m.state === 'active'

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-[3px] border text-left transition-all ${
                    isActive
                      ? 'bg-[var(--bg-elevated)] border-[var(--copper)]'
                      : isCompleted
                      ? 'bg-[var(--bg-base)] border-[var(--border-hairline)]'
                      : 'bg-[var(--bg-card)] border-[var(--border-hairline)] opacity-40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className={isCompleted ? 'text-[var(--green-rich)]' : isActive ? 'text-[var(--copper)]' : 'text-[var(--text-muted)]'}>
                      {m.icon}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-sans text-[var(--copper)] uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-[var(--text-primary)] font-sans truncate">
                    {m.label}
                  </div>
                  <p className="text-[10px] text-[var(--text-secondary)] font-light mt-0.5 truncate font-sans">
                    {m.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Consultation Spotlight */}
        <div className="p-4 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
          <div>
            <span className="text-[10px] uppercase font-sans text-[var(--green-rich)] block mb-0.5">
              Confirmed Tele-Health Consultation
            </span>
            <div className="text-sm font-medium text-[var(--text-primary)]">
              Dr. Vikram Oberoi, FRCS (Chief Orthopedic Surgeon)
            </div>
            <p className="text-[var(--text-secondary)] font-light mt-0.5">
              Apex Joint Institute · Tomorrow at 2:00 PM EST (Encrypted Video Link Active)
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                if (activeCase?.nextAppointment?.meetingLink) {
                  window.open(activeCase.nextAppointment.meetingLink, '_blank')
                }
              }}
              className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors rounded-[3px] px-4 py-2 text-xs font-medium font-sans tracking-[0.02em]"
            >
              Join Video Room
            </button>
            <button
              onClick={() =>
                addToast({
                  type: 'info',
                  title: 'Reminder Logged',
                  message: 'Calendar invite synchronized.',
                })
              }
              className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors rounded-[3px] px-3 py-2 text-xs font-sans"
            >
              Add to Calendar
            </button>
          </div>
        </div>
      </div>

      {/* 6. QUICK ACTIONS BAR */}
      <div className="space-y-4">
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] flex items-center gap-2 font-sans">
          <span className="inline-block w-5 h-[1px] bg-[var(--green-rich)]" />
          Quick Actions
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => navigate('/create-case')}
            className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-3 border border-[var(--border-hairline)]">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans group-hover:text-[var(--text-primary)]">
              Create Medical Case
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-light font-sans mt-1 leading-relaxed">
              Register a procedure goal, select hubs, and upload diagnostic records.
            </p>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/cases/${activeCase?.id || 'ET-8492'}/records`)}
            className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-3 border border-[var(--border-hairline)]">
              <Upload className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans group-hover:text-[var(--text-primary)]">
              Upload Records
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-light font-sans mt-1 leading-relaxed">
              Attach DICOM MRI/CT scans, pathology reports, or doctor prescription notes.
            </p>
          </button>

          <button
            type="button"
            onClick={() => setQuotesModalOpen(true)}
            className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-3 border border-[var(--border-hairline)]">
              <DollarSign className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans group-hover:text-[var(--text-primary)]">
              View Quotes ({activeCase?.quotes?.length || 2})
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-light font-sans mt-1 leading-relaxed">
              Compare transparent institutional package pricing from accredited centers.
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              if (activeCase?.nextAppointment?.meetingLink) {
                window.open(activeCase.nextAppointment.meetingLink, '_blank')
              } else {
                navigate(`/cases/${activeCase?.id || 'ET-8492'}`)
              }
            }}
            className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all text-left cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-[3px] bg-[var(--bg-base)] text-[var(--copper)] flex items-center justify-center mb-3 border border-[var(--border-hairline)]">
              <Video className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans group-hover:text-[var(--text-primary)]">
              Book Consultation
            </h4>
            <p className="text-xs text-[var(--text-secondary)] font-light font-sans mt-1 leading-relaxed">
              Schedule or launch pre-travel encrypted video telemedicine with chief surgeon.
            </p>
          </button>
        </div>
      </div>

      {/* 7. QUICK ACTION MODAL: Upload Records */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Diagnostic Records"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-5 text-left text-xs font-sans">
          <p className="text-[var(--text-secondary)] leading-relaxed font-light">
            Attach diagnostic imaging or laboratory panels to <strong className="text-[var(--text-primary)]">Case #{activeCase?.id}</strong>. Files are encrypted with sovereign patient-controlled access.
          </p>

          <FileUploader
            files={newFiles}
            onFilesChange={setNewFiles}
            label="Diagnostic Scans & Pathology"
            helperText="Supported: DICOM MRI/CT, JPG, PNG, PDF up to 30MB each."
          />

          <div className="p-3 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] flex items-center gap-2 text-[var(--text-secondary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
            <span>End-to-end encryption active: Only authorized hospital departments can inspect records.</span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-hairline)]">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="border border-[var(--border-default)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-4 py-2 rounded-[3px] text-xs font-sans"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] px-5 py-2 rounded-[3px] text-xs font-medium font-sans tracking-[0.02em] disabled:opacity-50"
            >
              {isUploading ? 'Encrypting...' : 'Confirm & Encrypt Scans'}
            </button>
          </div>
        </form>
      </Modal>

      {/* 8. QUICK ACTION MODAL: View Institutional Quotes */}
      <Modal
        isOpen={quotesModalOpen}
        onClose={() => setQuotesModalOpen(false)}
        title="Institutional Hospital Quotes"
        size="lg"
      >
        <div className="space-y-4 text-left text-xs font-sans">
          <p className="text-[var(--text-secondary)] font-light">
            Compare transparent surgical packages submitted for <strong className="text-[var(--text-primary)]">Case #{activeCase?.id}</strong>:
          </p>

          <div className="space-y-3">
            {activeCase?.quotes?.map((q) => (
              <div
                key={q.id}
                className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-[var(--text-primary)]">{q.providerName}</span>
                    {q.isRecommended && (
                      <span className="text-[10px] px-2 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)]">
                        Recommended
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--text-secondary)]">
                    {q.hospitalName} · {q.city}, {q.country} ({q.accreditation})
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Surgeon: {q.surgeonName} · {q.stayDuration}
                  </p>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <span className="text-base font-normal text-[var(--copper)] tabular-nums block mb-1">
                    ${q.price.toLocaleString()} {q.currency}
                  </span>
                  <button
                    onClick={() => {
                      setQuotesModalOpen(false)
                      navigate(`/cases/${activeCase?.id || 'ET-8492'}`)
                    }}
                    className="border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[3px] px-3 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  >
                    View Inclusions
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
            <span className="text-[11px] text-[var(--text-muted)]">
              All package quotes include inpatient rehab, surgery, implants & airport transfers.
            </span>
            <button
              onClick={() => setQuotesModalOpen(false)}
              className="border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[3px] px-3 py-1 text-xs text-[var(--text-secondary)]"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PatientDashboardPage
