import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  ShieldCheck,
  Sparkles,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  DollarSign,
  Building2,
  Video,
  MapPin,
  Stethoscope,
  Layers,
  Activity,
  Check,
  Play,
  RefreshCw,
  AlertCircle,
  Edit3,
  X,
  AlertTriangle,
  Info,
  Flag,
  Award,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import {
  Breadcrumb,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  StatusBadge,
  Button,
  Tabs,
  Avatar,
  useToast,
  BackgroundGrid,
  QuoteComparisonModal,
  AskQuestionModal,
  SelectProviderModal,
  QuoteCard,
  ConsultationBookingModal,
  TreatmentBookingModal,
  JourneyTracker,
  AftercareModule,
} from '../../components'

import { caseService, JOURNEY_STAGES } from '../../services/caseService'
import { providerService } from '../../services/providerService'
import { quoteService } from '../../services/quoteService'
import { appointmentService } from '../../services/appointmentService'
import { bookingService } from '../../services/bookingService'


export function CaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()

  const caseId = id || 'ET-8492'
  const [medicalCase, setMedicalCase] = useState(() => caseService.getCaseByIdSync(caseId))
  const [activeTab, setActiveTab] = useState('overview')

  // Keep state synchronized with caseService
  useEffect(() => {
    let isMounted = true
    caseService.getCaseById(caseId).then((loaded) => {
      if (isMounted && loaded) {
        setMedicalCase(loaded)
      }
    })
    return () => {
      isMounted = false
    }
  }, [caseId])

  // Permissions state
  const [permissions, setPermissions] = useState(() => medicalCase?.recordPermissions || {})

  useEffect(() => {
    if (medicalCase?.recordPermissions) {
      setPermissions(medicalCase.recordPermissions)
    }
  }, [medicalCase])

  // AI Coordination Summary & Patient Fact Correction state
  const [coordinationSummary, setCoordinationSummary] = useState(
    () => medicalCase?.coordinationSummary || null
  )
  const [summaryCorrections, setSummaryCorrections] = useState(
    () => medicalCase?.summaryCorrections || []
  )
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false)
  const [correctionTarget, setCorrectionTarget] = useState({
    sectionKey: 'documentedMedicalHistory',
    title: 'Documented Medical History',
    originalValue: '',
  })
  const [correctionNewValue, setCorrectionNewValue] = useState('')
  const [correctionReason, setCorrectionReason] = useState('')
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false)

  // Phase 12: Provider Matching State
  const [matchesData, setMatchesData] = useState(null)
  const [isLoadingMatches, setIsLoadingMatches] = useState(false)
  const [matchesDestinationFilter, setMatchesDestinationFilter] = useState('all')
  const [expandedBreakdownId, setExpandedBreakdownId] = useState(null)

  const loadMatches = async (destFilter = matchesDestinationFilter) => {
    setIsLoadingMatches(true)
    try {
      const data = await providerService.matchProvidersForCase(caseId, {
        destination: destFilter !== 'all' ? destFilter : undefined,
      })
      if (data && data.matches) {
        setMatchesData(data)
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Error loading provider matches:', err.message)
    } finally {
      setIsLoadingMatches(false)
    }
  }

  useEffect(() => {
    loadMatches(matchesDestinationFilter)
  }, [caseId, matchesDestinationFilter])

  // Quote Management State
  const [quotes, setQuotes] = useState([])
  const [isLoadingQuotes, setIsLoadingQuotes] = useState(false)
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [activeQuoteForQuestion, setActiveQuoteForQuestion] = useState(null)
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false)
  const [activeQuoteForSelect, setActiveQuoteForSelect] = useState(null)
  const [isProcessingSelect, setIsProcessingSelect] = useState(false)

  const loadQuotes = async () => {
    setIsLoadingQuotes(true)
    try {
      const list = await quoteService.listQuotes(caseId)
      if (Array.isArray(list)) {
        setQuotes(list)
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Error loading quotes:', err)
    } finally {
      setIsLoadingQuotes(false)
    }
  }

  useEffect(() => {
    loadQuotes()
  }, [caseId])

  // =========================================================================
  // Appointments & Consultations State (REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW)
  // =========================================================================
  const [appointments, setAppointments] = useState([])
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false)
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false)
  const [consultationModalType, setConsultationModalType] = useState('consultation') // 'consultation' | 'follow-up'

  // =========================================================================
  // Treatment Booking State (After Consultation -> Inpatient Admission Booking)
  // =========================================================================
  const [bookings, setBookings] = useState([])
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)

  const loadAppointments = async () => {
    setIsLoadingAppointments(true)
    try {
      const res = await appointmentService.listAppointments({ caseId })
      const list = res?.data || res || []
      if (Array.isArray(list)) {
        setAppointments(list)
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Error loading appointments:', err)
    } finally {
      setIsLoadingAppointments(false)
    }
  }

  const loadBookings = async () => {
    setIsLoadingBookings(true)
    try {
      const res = await bookingService.listBookings({ caseId })
      const list = res?.data || res || []
      if (Array.isArray(list)) {
        setBookings(list)
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Error loading bookings:', err)
    } finally {
      setIsLoadingBookings(false)
    }
  }

  useEffect(() => {
    loadAppointments()
    loadBookings()
  }, [caseId])

  const handleOpenConsultationModal = (type = 'consultation') => {
    setConsultationModalType(type)
    setIsConsultationModalOpen(true)
  }

  const handleConsultationSuccess = async (newApt) => {
    setIsConsultationModalOpen(false)
    await loadAppointments()
    const refreshed = await caseService.getCaseById(caseId)
    if (refreshed) setMedicalCase(refreshed)
  }

  const handleCancelAppointment = async (aptId) => {
    try {
      await appointmentService.cancelAppointment(aptId)
      addToast({
        type: 'info',
        title: 'Consultation Cancelled',
        message: 'The scheduled consultation slot has been released.',
      })
      await loadAppointments()
      const refreshed = await caseService.getCaseById(caseId)
      if (refreshed) setMedicalCase(refreshed)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Unable to cancel appointment.',
      })
    }
  }

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true)
  }

  const handleBookingSuccess = async (bookingRes) => {
    setIsBookingModalOpen(false)
    await loadBookings()
    await loadAppointments()
    const refreshed = await caseService.getCaseById(caseId)
    if (refreshed) setMedicalCase(refreshed)
    setActiveTab('booking')
  }

  const handleOpenCompare = () => {
    setIsComparisonModalOpen(true)
  }

  const handleOpenAskQuestion = (q) => {
    setActiveQuoteForQuestion(q)
    setIsQuestionModalOpen(true)
  }

  const handleSubmitQuestion = async (quoteId, questionText) => {
    setIsSubmittingQuestion(true)
    try {
      const newQ = await quoteService.askQuestion(quoteId, questionText)
      addToast({
        type: 'success',
        title: 'Question Delivered',
        message: 'Your inquiry has been sent to the hospital clinical desk.',
      })
      // Refresh quote in state
      setQuotes((prev) =>
        prev.map((item) => {
          if (item.id === quoteId) {
            const qs = item.questions || []
            return { ...item, questions: [...qs, newQ] }
          }
          return item
        })
      )
      setIsQuestionModalOpen(false)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error Submitting Question',
        message: err.message || 'Unable to submit question.',
      })
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  const handleOpenSelectProvider = (q) => {
    setActiveQuoteForSelect(q)
    setIsSelectModalOpen(true)
  }

  const handleConfirmSelectProvider = async (quoteId) => {
    setIsProcessingSelect(true)
    try {
      await quoteService.acceptQuote(quoteId)
      const selected = quotes.find((q) => q.id === quoteId)

      // Update case stage & status
      await caseService.updateCaseStage(medicalCase.id, 'Provider Selected')
      const refreshedCase = await caseService.getCaseById(medicalCase.id)
      if (refreshedCase) {
        setMedicalCase({
          ...refreshedCase,
          selectedProviderId: selected?.providerId,
          selectedProviderName: selected?.providerName,
        })
      }

      // Update quotes state
      setQuotes((prev) =>
        prev.map((q) => {
          if (q.id === quoteId) return { ...q, status: 'ACCEPTED' }
          if (q.status !== 'DRAFT') return { ...q, status: 'REJECTED' }
          return q
        })
      )

      addToast({
        type: 'success',
        title: 'Provider Confirmed!',
        message: `${selected?.providerName || 'Healthcare Provider'} has been confirmed. No payment processed. Next: Video Consultation coordination.`,
      })

      setIsSelectModalOpen(false)
      setIsComparisonModalOpen(false)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Provider Selection Failed',
        message: err.message || 'Unable to accept quote.',
      })
    } finally {
      setIsProcessingSelect(false)
    }
  }

  const handleRejectQuote = async (q) => {
    try {
      await quoteService.rejectQuote(q.id)
      setQuotes((prev) =>
        prev.map((item) => (item.id === q.id ? { ...item, status: 'REJECTED' } : item))
      )
      addToast({
        type: 'info',
        title: 'Quote Declined',
        message: `Quote from ${q.providerName} has been declined.`,
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      })
    }
  }


  // Synchronize AI Summary from backend
  useEffect(() => {
    let isMounted = true
    caseService.getCaseSummary(caseId).then((res) => {
      if (isMounted && res) {
        if (res.summary) setCoordinationSummary(res.summary)
        if (res.corrections) setSummaryCorrections(res.corrections)
      }
    })
    return () => {
      isMounted = false
    }
  }, [caseId])

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true)
    addToast({
      type: 'info',
      title: 'Synthesizing Case Briefing...',
      message: 'Groq AI is converting case dossier and authorized records into a structured summary.',
    })
    try {
      const res = await caseService.generateCaseSummary(medicalCase.id)
      if (res?.summary) {
        setCoordinationSummary(res.summary)
        if (res.corrections) setSummaryCorrections(res.corrections)
        addToast({
          type: 'success',
          title: 'Case Coordination Summary Ready',
          message: 'Structured briefing generated with source attributions.',
        })
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Generate summary error:', err.message)
      addToast({
        type: 'error',
        title: 'Summarization Failed',
        message: err.message || 'Unable to generate summary at this time.',
      })
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleOpenCorrection = (sectionKey, title, originalValue) => {
    setCorrectionTarget({ sectionKey, title, originalValue })
    setCorrectionNewValue(originalValue === 'Not provided' ? '' : originalValue)
    setCorrectionReason('')
    setIsCorrectionModalOpen(true)
  }

  const handleSubmitCorrection = async (e) => {
    e.preventDefault()
    if (!correctionNewValue.trim()) return

    setIsSubmittingCorrection(true)
    try {
      const res = await caseService.submitCorrection(medicalCase.id, {
        sectionKey: correctionTarget.sectionKey,
        originalValue: correctionTarget.originalValue,
        correctedValue: correctionNewValue.trim(),
        reason: correctionReason.trim(),
      })
      if (res?.correction) {
        setSummaryCorrections((prev) => [...prev, res.correction])
        if (res.summary) setCoordinationSummary(res.summary)
        addToast({
          type: 'success',
          title: 'Fact Correction Saved',
          message: `Section [${correctionTarget.title}] updated with your verified information.`,
        })
        setIsCorrectionModalOpen(false)
      }
    } catch (err) {
      console.warn('[CaseDetailPage] Submit correction error:', err.message)
      addToast({
        type: 'error',
        title: 'Correction Error',
        message: err.message || 'Failed to submit correction.',
      })
    } finally {
      setIsSubmittingCorrection(false)
    }
  }

  const renderAttributionBadge = (source) => {
    switch (source) {
      case 'Patient provided':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
            Patient provided
          </span>
        )
      case 'Document extracted':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-900">
            Document extracted
          </span>
        )
      case 'AI summarized':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
            AI summarized
          </span>
        )
      case 'Not available':
      default:
        return (
          <span className="px-2 py-0.5 rounded-[2px] text-[10px] font-mono font-medium bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-default)]">
            Not available
          </span>
        )
    }
  }

  // Toggle record permission
  const handleTogglePermission = (hospitalKey, recordKey) => {
    const updated = caseService.toggleRecordPermission(medicalCase.id, hospitalKey, recordKey)
    if (updated) {
      setMedicalCase({ ...updated })
      setPermissions({ ...updated.recordPermissions })
      const hospitalName =
        hospitalKey === 'apex-joint-delhi'
          ? 'Apex Joint Institute'
          : hospitalKey === 'horizon-bangkok'
          ? 'Horizon Medical City'
          : hospitalKey
      addToast({
        type: 'info',
        title: 'Consent Permission Updated',
        message: `Updated diagnostic visibility for ${hospitalName}.`,
      })
    }
  }

  // Interactive state switcher for testing all 11 journey stages
  const handleStageSelect = async (stageId) => {
    const updated = await caseService.updateCaseStage(medicalCase.id, stageId)
    if (updated) {
      setMedicalCase({ ...updated })
      const upper = stageId.toUpperCase()
      if (upper === 'MATCHING') setActiveTab('matching')
      else if (upper === 'QUOTES') setActiveTab('quotes')
      else if (upper === 'CONSULTATION') setActiveTab('consultation')
      else if (upper === 'BOOKED') setActiveTab('booking')
      else if (upper === 'TREATMENT') setActiveTab('overview')
      else if (upper === 'RECORDS') setActiveTab('records')
      else if (upper === 'AFTERCARE' || upper === 'COMPLETED') setActiveTab('aftercare')
      else if (upper === 'DRAFT' || upper === 'QUALIFICATION' || upper === 'PROVIDER') setActiveTab('overview')
      addToast({
        type: 'success',
        title: `Switched to Stage: ${stageId}`,
        message: `Case #${medicalCase.id} is now in "${stageId}" status. Dashboard view updated.`,
      })
    }
  }

  // Accept Quote handler
  const handleAcceptQuote = async (quoteId) => {
    const updated = await caseService.acceptQuote(medicalCase.id, quoteId)
    if (updated) {
      setMedicalCase({ ...updated })
      addToast({
        type: 'success',
        title: 'Institutional Quote Accepted',
        message: 'Provider confirmed. Proceeding to pre-surgical consultation setup.',
      })
    }
  }

  if (!medicalCase) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-medium text-[var(--text-primary)]">Case Not Found</h2>
        <p className="text-sm text-[var(--text-primary)]/60">Case #{caseId} could not be located in your sovereign vault.</p>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    )
  }

  // Determine current stage index in 9-step journey
  const currentStageIndex = JOURNEY_STAGES.findIndex((s) => s.id === medicalCase.journeyStage)
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : 4 // fallback to Quotes

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      <BackgroundGrid mask="radial" opacityClass="opacity-[0.06] dark:opacity-[0.08]" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Patient Dashboard', href: '/dashboard' },
          { label: 'Cases', href: '/dashboard' },
          { label: `Case #${medicalCase.id}`, current: true },
        ]}
      />

      {/* Case Header Strip */}
      <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] flex items-center justify-center font-medium text-lg shadow-2xs">
            #ET
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                Case #{medicalCase.id} · {medicalCase.treatmentName}
              </h1>
              <StatusBadge status={medicalCase.status} pulse />
            </div>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1 flex flex-wrap items-center gap-2">
              <span>Patient: <strong>{medicalCase.patientName}</strong></span>
              <span>•</span>
              <span>Destination: <strong>{medicalCase.destinationName}</strong></span>
              <span>•</span>
              <span>Registered: {new Date(medicalCase.createdAt).toLocaleDateString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              addToast({
                type: 'success',
                title: 'Dossier Exported',
                message: 'Encrypted case PDF compiled and ready for download.',
              })
            }
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Dossier
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setActiveTab('consultation')}
            leftIcon={<Video className="w-4 h-4" />}
          >
            Video Consultation
          </Button>
        </div>
      </div>

      {/* Required Metrics Bar: Treatment, Destination, Budget, Case Status, Provider Status, Next Appointment */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-4 sm:p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs text-xs">
        {/* Metric 1: Treatment */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <Stethoscope className="w-3 h-3" /> Treatment
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs sm:text-sm line-clamp-1" title={medicalCase.treatmentName}>
            {medicalCase.treatmentName}
          </p>
          <span className="text-[10px] text-[var(--text-primary)]/60 dark:text-[#89938F] block">Surgical Target</span>
        </div>

        {/* Metric 2: Destination */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <MapPin className="w-3 h-3" /> Destination
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs sm:text-sm line-clamp-1" title={medicalCase.destinationName}>
            {medicalCase.destinationName}
          </p>
          <span className="text-[10px] text-[var(--text-primary)]/60 dark:text-[#89938F] block">JCI Hub</span>
        </div>

        {/* Metric 3: Budget */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <DollarSign className="w-3 h-3" /> Budget Range
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs sm:text-sm">
            ${Number(medicalCase.budgetMin).toLocaleString()} – ${Number(medicalCase.budgetMax).toLocaleString()}
          </p>
          <span className="text-[10px] text-[var(--text-primary)]/60 dark:text-[#89938F] block">Transparent USD</span>
        </div>

        {/* Metric 4: Case Status */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <Activity className="w-3 h-3" /> Case Status
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs sm:text-sm">
            {medicalCase.journeyStage}
          </p>
          <span className="text-[10px] text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium block">{medicalCase.status}</span>
        </div>

        {/* Metric 5: Provider Status */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <Building2 className="w-3 h-3" /> Provider Status
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs line-clamp-2" title={medicalCase.providerStatus}>
            {medicalCase.providerStatus}
          </p>
        </div>

        {/* Metric 6: Next Appointment */}
        <div className="space-y-1 p-2 rounded-[3px] bg-[var(--bg-elevated)] dark:bg-[#202B28] border border-[var(--border-default)] dark:border-[var(--border-default)]">
          <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--text-primary)] dark:text-[var(--green-rich)] flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Next Appointment
          </span>
          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] text-xs line-clamp-1" title={medicalCase.nextAppointment?.title}>
            {medicalCase.nextAppointment?.title}
          </p>
          <span className="text-[10px] text-[var(--green-rich)] dark:text-[var(--green-rich)] block font-medium truncate">
            {medicalCase.nextAppointment?.displayDate}
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11-STAGE MEDICAL CASE JOURNEY TRACKER                                     */}
      {/* ========================================================================= */}
      <JourneyTracker
        medicalCase={medicalCase}
        onSelectStage={handleStageSelect}
        onActionClick={(tab) => setActiveTab(tab)}
        appointments={appointments}
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'overview', label: 'Case Dossier & Journey' },
          {
            id: 'matching',
            label: 'Matched Centers',
            badge: matchesData?.matches?.length ? `${matchesData.matches.length} AI Ranked` : 'Screening',
          },
          { id: 'records', label: 'Diagnostic Records & Vault', badge: `${medicalCase.records?.length || 0} Scans` },
          { id: 'quotes', label: 'Hospital Quotes', badge: `${quotes.length || medicalCase.quotes?.length || 0} Received` },
          {
            id: 'consultation',
            label: 'Surgeon Tele-Consultation',
            badge: appointments.length > 0 ? `${appointments.length} Sessions` : undefined,
          },
          {
            id: 'booking',
            label: 'Treatment Booking',
            badge: medicalCase.status === 'BOOKED' || medicalCase.bookingDetails || bookings.length > 0 ? 'Confirmed' : undefined,
          },
          { id: 'aftercare', label: 'Aftercare & Recovery' },
          { id: 'audit', label: 'Access Audit Ledger' },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ========================================================================= */}
      {/* TAB 1: Case Dossier & Clinical Summary                                    */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical Overview Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <FileText className="w-5 h-5 text-[var(--green-rich)]" />
                  <CardTitle>Clinical Case Dossier & Patient History</CardTitle>
                </div>
                <CardDescription>
                  Detailed medical history, symptoms profile, and target procedure preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs sm:text-sm text-[var(--text-primary)]/80 leading-relaxed">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] mb-1">Chief Complaints & Clinical Presentation:</h4>
                  <p className="bg-[var(--bg-base)] dark:bg-[#151C1A] p-3.5 rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    {medicalCase.medicalHistory}
                  </p>
                </div>

                {medicalCase.patientNotes && (
                  <div>
                    <h4 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] mb-1">Patient Special Accommodations & Preferences:</h4>
                    <p className="bg-[var(--bg-base)] dark:bg-[#151C1A] p-3.5 rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {medicalCase.patientNotes}
                    </p>
                  </div>
                )}

                {/* AI Coordination Briefing Box */}
                <div className="p-5 bg-[var(--bg-elevated)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-2">
                          AI Medical Case Coordination Summary
                          <Badge variant="primary" size="sm">Groq AI Verified</Badge>
                        </h4>
                        <p className="text-[11px] text-[var(--text-primary)]/65 dark:text-[#B6C0BC]">
                          Structured multi-stakeholder brief for Patient, Provider, and Coordinator.
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateSummary}
                      disabled={isGeneratingSummary}
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />}
                    >
                      {isGeneratingSummary ? 'Synthesizing...' : coordinationSummary ? 'Refresh Summary' : 'Generate Summary'}
                    </Button>
                  </div>

                  {coordinationSummary ? (
                    <div className="space-y-4">
                      {/* Executive Brief */}
                      <div className="p-3.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-default)] space-y-1">
                        <span className="text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5" />
                          Executive Coordination Brief
                        </span>
                        <p className="text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] leading-relaxed">
                          {coordinationSummary.executiveBrief}
                        </p>
                      </div>

                      {/* Structured Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {/* 1. Case Objective */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Case Objective</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.caseObjective?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('caseObjective', 'Case Objective', coordinationSummary.caseObjective?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.caseObjective?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.caseObjective?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.caseObjective.notes}
                            </span>
                          )}
                        </div>

                        {/* 2. Patient Provided Information */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Patient Provided Information</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.patientProvidedInformation?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('patientProvidedInformation', 'Patient Provided Information', coordinationSummary.patientProvidedInformation?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.patientProvidedInformation?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.patientProvidedInformation?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.patientProvidedInformation.notes}
                            </span>
                          )}
                        </div>

                        {/* 3. Uploaded Document Types */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Uploaded Document Types</span>
                            {renderAttributionBadge(coordinationSummary.uploadedDocumentTypes?.source)}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-0.5">
                            {coordinationSummary.uploadedDocumentTypes?.types?.length > 0 ? (
                              coordinationSummary.uploadedDocumentTypes.types.map((type, idx) => (
                                <Badge key={idx} variant="primary" size="sm">{type}</Badge>
                              ))
                            ) : (
                              <span className="text-[11px] text-[var(--text-muted)] italic">Not provided</span>
                            )}
                          </div>
                        </div>

                        {/* 4. Documented Medical History */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Documented Medical History</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.documentedMedicalHistory?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('documentedMedicalHistory', 'Documented Medical History', coordinationSummary.documentedMedicalHistory?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.documentedMedicalHistory?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.documentedMedicalHistory?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.documentedMedicalHistory.notes}
                            </span>
                          )}
                        </div>

                        {/* 5. Documented Procedures */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Documented Procedures / Treatments</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.documentedProcedures?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('documentedProcedures', 'Documented Procedures', coordinationSummary.documentedProcedures?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.documentedProcedures?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.documentedProcedures?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.documentedProcedures.notes}
                            </span>
                          )}
                        </div>

                        {/* 6. Known Medications */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Known Medications</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.knownMedications?.source)}
                              <button
                                type="button"
                                onClick={() => {
                                  const orig = Array.isArray(coordinationSummary.knownMedications?.items)
                                    ? coordinationSummary.knownMedications.items.map(m => `${m.name} ${m.dosage || ''} ${m.frequency || ''}`).join(', ')
                                    : (coordinationSummary.knownMedications?.items || '')
                                  handleOpenCorrection('knownMedications', 'Known Medications', orig)
                                }}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {Array.isArray(coordinationSummary.knownMedications?.items) && coordinationSummary.knownMedications.items.length > 0 ? (
                              <ul className="list-disc list-inside space-y-0.5">
                                {coordinationSummary.knownMedications.items.map((med, idx) => (
                                  <li key={idx}>
                                    <strong>{med.name}</strong> {med.dosage && `(${med.dosage})`} {med.frequency && `– ${med.frequency}`}
                                  </li>
                                ))}
                              </ul>
                            ) : typeof coordinationSummary.knownMedications?.items === 'string' && coordinationSummary.knownMedications.items !== 'Not provided' ? (
                              <p>{coordinationSummary.knownMedications.items}</p>
                            ) : (
                              <p className="italic text-[var(--text-muted)]">Not provided</p>
                            )}
                          </div>
                        </div>

                        {/* 7. Patient Preferences */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Patient Preferences</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.patientPreferences?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('patientPreferences', 'Patient Preferences', coordinationSummary.patientPreferences?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.patientPreferences?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.patientPreferences?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.patientPreferences.notes}
                            </span>
                          )}
                        </div>

                        {/* 8. Travel & Coordination Requirements */}
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Travel & Coordination Logistics</span>
                            <div className="flex items-center gap-1.5">
                              {renderAttributionBadge(coordinationSummary.travelCoordinationRequirements?.source)}
                              <button
                                type="button"
                                onClick={() => handleOpenCorrection('travelCoordinationRequirements', 'Travel Logistics', coordinationSummary.travelCoordinationRequirements?.value || '')}
                                className="text-[var(--text-muted)] hover:text-[var(--green-rich)] transition-colors p-0.5"
                                title="Flag / Correct this fact"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                            {coordinationSummary.travelCoordinationRequirements?.value || 'Not provided'}
                          </p>
                          {coordinationSummary.travelCoordinationRequirements?.notes && (
                            <span className="inline-block text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded">
                              ✓ {coordinationSummary.travelCoordinationRequirements.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 9. Missing Information Checklist */}
                      <div className="p-3.5 bg-amber-50/50 dark:bg-amber-950/20 rounded-[3px] border border-amber-200 dark:border-amber-900/40 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Missing Pre-Procedure Information / Gaps Identified
                          </span>
                          {renderAttributionBadge(coordinationSummary.missingInformation?.source)}
                        </div>
                        {coordinationSummary.missingInformation?.items?.length > 0 &&
                        coordinationSummary.missingInformation.items[0] !== 'Not provided' ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {coordinationSummary.missingInformation.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 rounded-[3px] text-[11px] bg-[var(--bg-card)] text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/60 shadow-2xs flex items-center gap-1"
                              >
                                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                {item}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-amber-800 dark:text-amber-300 italic">
                            All standard intake information provided.
                          </p>
                        )}
                      </div>

                      {/* Patient Correction Audit Log Indicator */}
                      {summaryCorrections && summaryCorrections.length > 0 && (
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between text-[11px]">
                          <span className="text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            {summaryCorrections.length} Patient Fact Correction{summaryCorrections.length > 1 ? 's' : ''} Active & Applied
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            Overriding automated document extractions
                          </span>
                        </div>
                      )}

                      {/* Mandatory AI Disclaimer Banner */}
                      <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-start gap-2.5 text-[11px] text-[var(--text-muted)]">
                        <span className="w-2 h-2 rounded-full bg-[var(--copper)] shrink-0 mt-1" />
                        <p className="leading-relaxed">
                          AI-generated information is for coordination and informational purposes and does not replace professional medical advice.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center space-y-3 bg-[var(--bg-base)] dark:bg-[#1A2421] rounded-[3px] border border-dashed border-[var(--border-default)]">
                      <Sparkles className="w-8 h-8 text-[var(--green-rich)] dark:text-[var(--green-rich)] mx-auto opacity-70" />
                      <div className="space-y-1">
                        <h5 className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                          Synthesize AI Coordination Briefing
                        </h5>
                        <p className="text-xs text-[var(--text-secondary)] dark:text-[#B6C0BC] max-w-md mx-auto">
                          Automatically extract and consolidate your target procedure, symptoms, verified scans, and missing clearance records into a structured summary with source attributions.
                        </p>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={handleGenerateSummary}
                        disabled={isGeneratingSummary}
                        leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isGeneratingSummary ? 'animate-spin' : ''}`} />}
                      >
                        {isGeneratingSummary ? 'Generating Briefing...' : 'Generate AI Summary'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Travel & Surgical Parameters */}
            <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Target Travel Parameters</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px]">
                  <span className="text-[var(--text-primary)]/50 dark:text-[#89938F] block">Target Budget</span>
                  <strong className="text-sm text-[var(--text-primary)] dark:text-[var(--green-rich)]">
                    ${Number(medicalCase.budgetMin).toLocaleString()} – ${Number(medicalCase.budgetMax).toLocaleString()} USD
                  </strong>
                </div>
                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px]">
                  <span className="text-[var(--text-primary)]/50 dark:text-[#89938F] block">Preferred Date</span>
                  <strong className="text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">{medicalCase.preferredDate}</strong>
                </div>
                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px]">
                  <span className="text-[var(--text-primary)]/50 dark:text-[#89938F] block">Flexibility</span>
                  <strong className="text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">{medicalCase.flexibility}</strong>
                </div>
                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px]">
                  <span className="text-[var(--text-primary)]/50 dark:text-[#89938F] block">Companion Suite</span>
                  <strong className="text-sm text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                    {medicalCase.companion ? 'Requested (2 Guests)' : 'Single Patient'}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Next Appointment & Concierge */}
          <div className="space-y-6">
            {/* Next Appointment Spotlight Card */}
            <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                  Upcoming Milestone
                </span>
                <Badge variant="primary" size="sm">Confirmed</Badge>
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  {medicalCase.nextAppointment?.title}
                </h4>
                <p className="text-xs text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">{medicalCase.nextAppointment?.displayDate}</p>
              </div>

              <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1">
                <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">{medicalCase.nextAppointment?.doctor}</p>
                <p className="text-[11px] text-[var(--green-rich)] dark:text-[var(--green-rich)]">{medicalCase.nextAppointment?.specialty}</p>
                <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">{medicalCase.nextAppointment?.hospital}</p>
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => setActiveTab('consultation')}
                leftIcon={<Video className="w-4 h-4" />}
              >
                Join Video Consultation Room
              </Button>
            </div>

            {/* Assigned Coordinator Card */}
            <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4 text-xs">
              <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">International Care Coordinator</h3>
              <div className="flex items-center gap-3">
                <Avatar name="Priya Menon" size="md" />
                <div>
                  <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Priya Menon</p>
                  <p className="text-[11px] text-[var(--green-rich)] dark:text-[var(--green-rich)]">Senior Medical Travel Concierge</p>
                </div>
              </div>
              <p className="text-[var(--text-primary)]/70 dark:text-[#B6C0BC] leading-relaxed text-[11px]">
                Managing your hospital quotes, pre-travel telemedicine, airport transfer schedule, and visa invitation letters.
              </p>
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() =>
                  addToast({
                    type: 'info',
                    title: 'Message Sent to Coordinator',
                    message: 'Priya Menon will reply via your dashboard within 2 hours.',
                  })
                }
              >
                Message Coordinator
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: Quaternary Provider Matching & AI Relevance Evaluation               */}
      {/* ========================================================================= */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          {/* Top Banner & Destination Filter Strip */}
          <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-2">
                      Quaternary Healthcare Center Matches
                      <Badge variant="primary" size="sm">
                        Groq AI Explainability
                      </Badge>
                    </h3>
                    <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC]">
                      Screened through institutional verification, clinical capability, destination alignment, and AI relevance explanation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Destination Filter Pills */}
                <div className="flex items-center gap-1 p-1 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] text-xs">
                  {[
                    { id: 'all', label: 'All Destinations' },
                    { id: 'India', label: 'India 🇮🇳' },
                    { id: 'Thailand', label: 'Thailand 🇹🇭' },
                    { id: 'Turkey', label: 'Turkey 🇹🇷' },
                    { id: 'Mexico', label: 'Mexico 🇲🇽' },
                  ].map((dest) => (
                    <button
                      key={dest.id}
                      type="button"
                      onClick={() => setMatchesDestinationFilter(dest.id)}
                      className={`px-2.5 py-1 rounded-[3px] font-medium transition-colors cursor-pointer text-xs ${
                        matchesDestinationFilter.toLowerCase() === dest.id.toLowerCase()
                          ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] shadow-2xs'
                          : 'text-[var(--text-primary)]/70 dark:text-[#B6C0BC] hover:bg-[var(--bg-card)]'
                      }`}
                    >
                      {dest.label}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    loadMatches(matchesDestinationFilter)
                    addToast({
                      type: 'info',
                      title: 'Matching Pipeline Executing',
                      message: 'Evaluating hospital credentials, surgical capabilities, and scoring factors...',
                    })
                  }}
                  disabled={isLoadingMatches}
                  leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoadingMatches ? 'animate-spin' : ''}`} />}
                >
                  {isLoadingMatches ? 'Evaluating...' : 'Re-evaluate'}
                </Button>
              </div>
            </div>

            {/* Mandatory AI Safety Disclaimer Banner */}
            <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
              <Info className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Matching Transparency Notice:</strong> {matchesData?.disclaimer || 'Provider relevance explanations are for coordination and informational purposes and do not constitute a clinical endorsement or guarantee of care.'}
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingMatches && (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-4 animate-pulse">
                  <div className="h-6 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-1/3" />
                  <div className="h-4 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-1/2" />
                  <div className="h-20 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoadingMatches && (!matchesData?.matches || matchesData.matches.length === 0) && (
            <div className="p-12 text-center bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-3">
              <Building2 className="w-10 h-10 text-[var(--green-rich)] mx-auto opacity-70" />
              <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                No Hospital Centers Match Current Filters
              </h4>
              <p className="text-xs text-[var(--text-primary)]/60 dark:text-[#B6C0BC] max-w-md mx-auto">
                No quaternary providers matched the specific destination filter "{matchesDestinationFilter}". Select "All Destinations" to view all accredited institutions offering {medicalCase.treatmentName}.
              </p>
              <Button variant="primary" size="sm" onClick={() => setMatchesDestinationFilter('all')}>
                Show All Accredited Centers
              </Button>
            </div>
          )}

          {/* Ranked Matches List */}
          {!isLoadingMatches && matchesData?.matches && matchesData.matches.length > 0 && (
            <div className="space-y-6">
              {matchesData.matches.map((match, idx) => {
                const isTopMatch = idx === 0
                const isExpanded = expandedBreakdownId === match.provider.id

                return (
                  <div
                    key={match.provider.id}
                    className={`p-6 bg-[var(--bg-card)] rounded-[4px] border transition-all duration-200 shadow-xs space-y-5 ${
                      isTopMatch
                        ? 'border-2 border-[#173E39] dark:border-[#6F9F91]'
                        : 'border-[var(--border-default)] dark:border-[var(--border-default)]'
                    }`}
                  >
                    {/* 1. PROVIDER HEADER */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase tracking-wider bg-[#173E39] text-white dark:bg-[#6F9F91] dark:text-[#101614]">
                            #{idx + 1} Evaluated Match
                          </span>
                          {match.trustInformation?.accreditations?.map((acc, aIdx) => (
                            <Badge key={aIdx} variant="secondary" size="sm">
                              <ShieldCheck className="w-3 h-3 mr-1 inline text-[var(--green-rich)]" />
                              {acc}
                            </Badge>
                          ))}
                        </div>

                        <h4 className="text-xl font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                          {match.provider.name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text-primary)]/75 dark:text-[#B6C0BC]">
                          <span className="flex items-center gap-1 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                            {match.provider.city}, {match.provider.country} {match.provider.flag || ''}
                          </span>
                          <span>•</span>
                          <span>Est. {match.provider.establishedYear || 2008}</span>
                          <span>•</span>
                          <span>{match.provider.beds || 450} Beds</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                            <Star className="w-3 h-3 fill-amber-500" />
                            {match.provider.rating} ({match.provider.reviewCount} reviews)
                          </span>
                        </div>

                        {match.provider.tagline && (
                          <p className="text-xs text-[var(--text-primary)]/60 dark:text-[#89938F] italic pt-0.5">
                            "{match.provider.tagline}"
                          </p>
                        )}
                      </div>

                      {/* Score Pill & Breakdown Toggle */}
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <div className="px-4 py-2 rounded-[4px] bg-[#173E39]/10 dark:bg-[#6F9F91]/20 border border-[#173E39]/30 dark:border-[#6F9F91]/40 text-right">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] block">
                            Relevance Score
                          </span>
                          <span className="text-2xl font-serif font-medium text-[var(--text-primary)] dark:text-[var(--green-rich)]">
                            {match.matchScore}
                            <span className="text-xs font-sans text-[var(--text-muted)]"> / 100</span>
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => setExpandedBreakdownId(isExpanded ? null : match.provider.id)}
                          className="text-[11px] font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          {isExpanded ? 'Hide Score Breakdown' : 'View Scoring Breakdown'}
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>

                    {/* 2. MATCH FACTORS & TRANSPARENT SCORING BREAKDOWN */}
                    {isExpanded && match.scoringBreakdown && (
                      <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-3 text-xs animate-in fade-in duration-200">
                        <h5 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-[var(--green-rich)]" />
                          Transparent Scoring Dimensions (0 - 100 Points):
                        </h5>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                          <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)]">
                            <span className="text-[10px] text-[var(--text-muted)] block">Treatment Fit</span>
                            <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {match.scoringBreakdown.treatmentFit} / 30 pts
                            </span>
                          </div>
                          <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)]">
                            <span className="text-[10px] text-[var(--text-muted)] block">Destination Fit</span>
                            <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {match.scoringBreakdown.destinationFit} / 25 pts
                            </span>
                          </div>
                          <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)]">
                            <span className="text-[10px] text-[var(--text-muted)] block">Specialization</span>
                            <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {match.scoringBreakdown.specializationFit} / 20 pts
                            </span>
                          </div>
                          <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)]">
                            <span className="text-[10px] text-[var(--text-muted)] block">Logistics & Desk</span>
                            <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {match.scoringBreakdown.availabilityFit} / 15 pts
                            </span>
                          </div>
                          <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)]">
                            <span className="text-[10px] text-[var(--text-muted)] block">Preference Fit</span>
                            <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {match.scoringBreakdown.preferenceFit} / 10 pts
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Match Factors Tags */}
                    {match.matchFactors && match.matchFactors.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                          Verified Match Factors:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {match.matchFactors.map((factor, fIdx) => (
                            <span
                              key={fIdx}
                              className="px-2.5 py-1 text-[11px] rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A] text-[var(--text-primary)]/80 dark:text-[#B6C0BC] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center gap-1.5"
                            >
                              <Check className="w-3 h-3 text-[var(--green-rich)] shrink-0" />
                              {factor}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. WHY IT MAY FIT (GROQ AI RELEVANCE EXPLANATION) */}
                    <div className="p-4 bg-[var(--bg-elevated)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
                          <h5 className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                            Why this provider may be relevant:
                          </h5>
                        </div>
                        <Badge variant="primary" size="sm">
                          Groq AI Structured Analysis
                        </Badge>
                      </div>

                      <p className="text-xs text-[var(--text-primary)]/85 dark:text-[#E2E8E5] leading-relaxed italic bg-[var(--bg-card)] dark:bg-[#1F2926] p-3 rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                        "{match.whyRelevant}"
                      </p>

                      {match.highlights && match.highlights.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)]">
                            Key Highlights:
                          </span>
                          {match.highlights.map((h, hIdx) => (
                            <span
                              key={hIdx}
                              className="px-2 py-0.5 rounded text-[11px] bg-[#173E39]/10 text-[#173E39] dark:bg-[#6F9F91]/20 dark:text-[#83B2A3] font-medium"
                            >
                              • {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 4. RELEVANT TREATMENTS */}
                    {match.relevantTreatments && match.relevantTreatments.length > 0 && (
                      <div className="space-y-2 text-xs">
                        <span className="text-[11px] font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                          Relevant Treatments & Package Inclusions:
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {match.relevantTreatments.map((treatment, tIdx) => (
                            <div
                              key={tIdx}
                              className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex flex-col justify-between space-y-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                                  {treatment.name}
                                </span>
                                <span className="font-serif font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)] text-sm shrink-0">
                                  ${treatment.startingPriceUSD?.toLocaleString()} USD
                                </span>
                              </div>
                              {treatment.inclusions && treatment.inclusions.length > 0 && (
                                <p className="text-[11px] text-[var(--text-primary)]/65 dark:text-[#B6C0BC] line-clamp-2">
                                  Includes: {treatment.inclusions.join(' · ')}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. TRUST INFORMATION & CLINICAL LEADERSHIP */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)] text-xs text-[var(--text-primary)]/80 dark:text-[#B6C0BC]">
                      {match.provider.doctors?.[0] && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                            Lead Surgical Specialist
                          </span>
                          <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                            {match.provider.doctors[0].name}
                          </p>
                          <p className="text-[11px] text-[var(--text-primary)]/65 dark:text-[#89938F]">
                            {match.provider.doctors[0].title} · {match.provider.doctors[0].experienceYears}+ years experience
                          </p>
                        </div>
                      )}

                      {match.provider.internationalSupport && (
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                            International Patient Amenities
                          </span>
                          <p className="text-[11px] text-[var(--text-primary)]/75 dark:text-[#B6C0BC]">
                            {match.provider.internationalSupport.airportConcierge || 'Airport chauffeur reception included'}
                          </p>
                          <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">
                            {match.provider.internationalSupport.visaAssistance || 'Medical Visa invitation support'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* 6. ACTIONS: VIEW PROVIDER */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => navigate(`/providers/${match.provider.id}`)}
                          rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                        >
                          View Provider Profile
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => setActiveTab('quotes')}
                        >
                          Review Hospital Quotes
                        </Button>
                      </div>

                      <span className="text-[11px] text-[var(--text-muted)]">
                        Target Procedure: <strong>{matchesData.treatmentTarget || medicalCase.treatmentName}</strong>
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: Diagnostic Records & Sovereign Permission Matrix                   */}
      {/* ========================================================================= */}
      {activeTab === 'records' && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--bg-elevated)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck className="w-5 h-5 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
              <span>Sovereign Record Vault & Granular Hospital Visibility Matrix</span>
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/cases/${medicalCase.id}/records`)}
                leftIcon={<Layers className="w-3.5 h-3.5" />}
              >
                Open Full Records Manager
              </Button>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[var(--bg-base)] dark:bg-[#151C1A] border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] text-[var(--text-primary)] dark:text-[#F2F4F1] font-medium">
                  <tr>
                    <th className="p-4 sm:px-6">Diagnostic File</th>
                    <th className="p-4">Type / File Size</th>
                    <th className="p-4">Date Added</th>
                    <th className="p-4 text-center">Apex Joint (India)</th>
                    <th className="p-4 text-center">Horizon Medical (Thailand)</th>
                    <th className="p-4 text-right sm:pr-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEF1EF] dark:divide-[#2B3834]">
                  {medicalCase.records?.map((record, index) => {
                    const recKey = `rec_${index + 1}`
                    const apexAllowed = permissions['apex-joint-delhi']?.[recKey] ?? true
                    const horizonAllowed = permissions['horizon-bangkok']?.[recKey] ?? (index < 2)

                    return (
                      <tr key={record.id || index} className="hover:bg-[var(--bg-base)]/50 dark:hover:bg-[#151C1A]/50 transition-colors">
                        <td className="p-4 sm:px-6 font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
                          <span className="truncate max-w-[220px]">{record.name}</span>
                        </td>
                        <td className="p-4 text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">
                          {record.type} · {record.size}
                        </td>
                        <td className="p-4 text-[var(--text-primary)]/60 dark:text-[#89938F] font-mono text-[11px]">{record.date}</td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={apexAllowed}
                            onChange={() => handleTogglePermission('apex-joint-delhi', recKey)}
                            className="rounded text-[var(--text-primary)] focus:ring-[#315B55] cursor-pointer"
                            title="Toggle visibility for Apex Joint Institute"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            type="checkbox"
                            checked={horizonAllowed}
                            onChange={() => handleTogglePermission('horizon-bangkok', recKey)}
                            className="rounded text-[var(--text-primary)] focus:ring-[#315B55] cursor-pointer"
                            title="Toggle visibility for Horizon Medical City"
                          />
                        </td>
                        <td className="p-4 text-right sm:pr-6">
                          <button
                            type="button"
                            onClick={() =>
                              addToast({
                                type: 'info',
                                title: 'DICOM Viewer Launching',
                                message: `Opening encrypted preview of ${record.name}.`,
                              })
                            }
                            className="text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium hover:underline cursor-pointer"
                          >
                            Inspect Scan
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 3: Hospital Quotes & Sovereign Comparison                             */}
      {/* ========================================================================= */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          {/* Header Strip with Action & Neutrality Banner */}
          <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      Institutional Hospital Quotes ({quotes.length})
                    </h3>
                    <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC]">
                      Itemized proposals covering consultation, diagnostics, accommodation, and support services.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenCompare}
                  disabled={quotes.length === 0}
                  leftIcon={<Layers className="w-4 h-4" />}
                >
                  Compare Quotes Side-by-Side
                </Button>
              </div>
            </div>

            {/* Impartiality / Non-Bias Notice */}
            <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Patient-Controlled Choice:</strong> EthAum does not declare one quote "best" or favor any hospital. You can compare all inclusions, accommodation standards, clinical notes, and exclusions side-by-side to make the optimal decision for your clinical needs.
              </p>
            </div>
          </div>

          {/* Quotes List Grid */}
          {isLoadingQuotes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4 animate-pulse">
                  <div className="h-5 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-1/3" />
                  <div className="h-8 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-1/2" />
                  <div className="h-24 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[3px] w-full" />
                </div>
              ))}
            </div>
          ) : quotes.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-3">
              <Building2 className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-70" />
              <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                No Hospital Quotes Received Yet
              </h4>
              <p className="text-xs text-[var(--text-primary)]/60 dark:text-[#B6C0BC] max-w-md mx-auto">
                Accredited healthcare centers are currently reviewing your diagnostic records. Quotes will be dispatched here once clinical assessment is completed.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quotes.map((quote) => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  onCompare={handleOpenCompare}
                  onAskQuestion={handleOpenAskQuestion}
                  onSelectProvider={handleOpenSelectProvider}
                  onRejectQuote={handleRejectQuote}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: Surgeon Tele-Consultation (REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW) */}
      {/* ========================================================================= */}
      {activeTab === 'consultation' && (
        <div className="space-y-6">
          {/* Header Action Strip */}
          <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    Specialist Video Consultations & Follow-Ups
                  </h3>
                  <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC]">
                    Encrypted telemedicine sessions for pre-surgical reviews and post-procedure follow-ups.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenConsultationModal('follow-up')}
                  leftIcon={<Clock className="w-3.5 h-3.5" />}
                >
                  Schedule Follow-Up
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenConsultationModal('consultation')}
                  leftIcon={<Video className="w-3.5 h-3.5" />}
                >
                  Request Consultation
                </Button>
              </div>
            </div>

            {/* Status Workflow Guide */}
            <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center gap-2 text-[11px] text-[var(--text-muted)] flex-wrap">
              <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Workflow:</span>
              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-mono text-[10px]">
                REQUESTED (Awaiting Hospital)
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono text-[10px]">
                CONFIRMED (Room Ready)
              </span>
              <span>→</span>
              <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 font-mono text-[10px]">
                COMPLETED (Clinical Notes)
              </span>
              <span>→</span>
              <span className="text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium">
                Proceed to Treatment Booking
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {isLoadingAppointments ? (
                <div className="p-12 text-center bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)]">
                  <div className="animate-spin w-6 h-6 border-2 border-[var(--green-rich)] border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">Loading scheduled sessions...</p>
                </div>
              ) : appointments.length > 0 ? (
                appointments.map((apt) => {
                  const isConfirmed = apt.status === 'CONFIRMED' || apt.status === 'Confirmed'
                  const isRequested = apt.status === 'REQUESTED' || apt.status === 'Pending' || apt.status === 'requested'
                  const isCompleted = apt.status === 'COMPLETED' || apt.status === 'Completed'
                  const isCancelled = apt.status === 'CANCELLED' || apt.status === 'Cancelled'
                  const isNoShow = apt.status === 'NO_SHOW' || apt.status === 'No_Show'

                  return (
                    <Card key={apt.id} className="border-[var(--border-default)] dark:border-[var(--border-default)]">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#EBF5EE] dark:bg-[#1C2E29] text-[var(--green-rich)] dark:text-[#6F9F91]">
                              {apt.consultationType === 'follow-up' ? 'Post-Op Follow-Up' : 'Pre-Surgical Consultation'}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] font-mono">
                              #{apt.id}
                            </span>
                          </div>

                          <div>
                            {isRequested && (
                              <Badge variant="warning" size="sm">
                                REQUESTED · Awaiting Confirmation
                              </Badge>
                            )}
                            {isConfirmed && (
                              <Badge variant="success" size="sm">
                                CONFIRMED · Encrypted Room Ready
                              </Badge>
                            )}
                            {isCompleted && (
                              <Badge variant="primary" size="sm">
                                COMPLETED · Candidacy Approved
                              </Badge>
                            )}
                            {isCancelled && (
                              <Badge variant="default" size="sm">
                                CANCELLED
                              </Badge>
                            )}
                            {isNoShow && (
                              <Badge variant="outline" size="sm">
                                NO SHOW
                              </Badge>
                            )}
                          </div>
                        </div>

                        <CardTitle className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] mt-2">
                          {apt.title || `${apt.doctorName || 'Specialist'} - ${apt.format || 'Telemedicine Review'}`}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                              Doctor / Specialist
                            </span>
                            <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                              {apt.doctorName || 'Dr. Vikram Oberoi'}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)] block">
                              {apt.providerName || medicalCase.selectedProviderName || 'Apex Joint Institute'}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                              Scheduled Date & Time
                            </span>
                            <p className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                              {new Date(apt.dateTime).toLocaleDateString(undefined, {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>

                        {apt.notes && (
                          <div className="p-3 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block mb-1">
                              Clinical Consultation Notes
                            </span>
                            <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC] italic">
                              "{apt.notes}"
                            </p>
                          </div>
                        )}

                        {isRequested && (
                          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-[3px] border border-amber-200 dark:border-amber-900/50 flex items-start gap-2 text-[11px] text-amber-800 dark:text-amber-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <p>
                              Your consultation request is pending confirmation with the hospital clinical desk. You will receive an encrypted video room link and notification as soon as the appointment is confirmed.
                            </p>
                          </div>
                        )}

                        {isCompleted && (
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-[3px] border border-emerald-200 dark:border-emerald-900/50 flex items-start justify-between gap-3 text-[11px] text-emerald-800 dark:text-emerald-300">
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                              <div>
                                <strong className="font-medium">Telemedicine Consultation Completed</strong>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 mt-0.5">
                                  Your diagnostic scans were verified by the surgical panel. You are qualified to finalize your treatment booking and lock in your hospital admission.
                                </p>
                              </div>
                            </div>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={handleOpenBookingModal}
                              rightIcon={<ChevronDown className="w-3.5 h-3.5 rotate-270" />}
                            >
                              Book Treatment
                            </Button>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                          <div className="flex items-center gap-2">
                            {isConfirmed && (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  window.open(apt.meetingUrl || 'https://meet.ethaum.sovereign/room-ET8492', '_blank')
                                }}
                                leftIcon={<Play className="w-3.5 h-3.5" />}
                              >
                                Enter Video Room Now
                              </Button>
                            )}

                            {(isRequested || isConfirmed) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelAppointment(apt.id)}
                              >
                                Cancel Session
                              </Button>
                            )}

                            {(isCancelled || isNoShow) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenConsultationModal(apt.consultationType || 'consultation')}
                              >
                                Re-Request Slot
                              </Button>
                            )}
                          </div>

                          <span className="text-[11px] text-[var(--text-muted)]">
                            Format: <strong>{apt.format || 'Encrypted WebRTC Telemedicine'}</strong>
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              ) : (
                <div className="p-8 text-center bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-base)] dark:bg-[#151C1A] text-[var(--green-rich)] dark:text-[#6F9F91] flex items-center justify-center mx-auto">
                    <Video className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      No Virtual Consultations Scheduled Yet
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto mt-1">
                      Schedule a 45-minute virtual video evaluation with your chosen surgeon to discuss treatment candidacy, surgical technique, and recovery timeline.
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenConsultationModal('consultation')}
                      leftIcon={<Video className="w-4 h-4" />}
                    >
                      Request Consultation
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenConsultationModal('follow-up')}
                    >
                      Schedule Follow-Up
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar Credentials & Checklist */}
            <div className="space-y-6 text-xs">
              {/* Specialist Bio */}
              <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-3">
                <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  Featured Surgical Specialist
                </h4>
                <div className="flex items-center gap-3 pt-1">
                  <Avatar name="Dr. Vikram Oberoi" size="lg" />
                  <div>
                    <strong className="text-sm text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                      Dr. Vikram Oberoi
                    </strong>
                    <span className="text-[11px] text-[var(--green-rich)] dark:text-[var(--green-rich)] block">
                      MS (Ortho), MCh, FRCS (Glasg)
                    </span>
                    <span className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F] block">
                      22+ Years · 4,200+ Robotic Procedures
                    </span>
                  </div>
                </div>
                <p className="text-[var(--text-primary)]/70 dark:text-[#B6C0BC] leading-relaxed text-[11px] pt-1">
                  Chief of Robotic Joint Surgery at Apex Joint Institute. Fellowship trained at Royal National Orthopaedic Hospital, London.
                </p>
              </div>

              {/* Pre-Consultation Checklist */}
              <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-3">
                <h4 className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  Pre-Consultation Checklist
                </h4>
                <div className="space-y-2 text-[var(--text-primary)]/75 dark:text-[#B6C0BC] text-xs">
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                    <span>Upload latest DICOM MRI & X-Rays to vault</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                    <span>Confirm active microphone and webcam access</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                    <span>Have current medication list on hand</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                    <span>Prepare specific questions regarding recovery duration</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4.5: TREATMENT BOOKING (AFTER CONSULTATION -> HOSPITAL ADMISSION)      */}
      {/* ========================================================================= */}
      {activeTab === 'booking' && (
        <div className="space-y-6">
          {/* Top Banner */}
          <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-serif font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      Treatment & Hospital Admission Booking
                    </h3>
                    {(medicalCase.status === 'BOOKED' || medicalCase.bookingDetails || bookings.length > 0) && (
                      <Badge variant="success" size="sm">
                        BOOKED · Admission Itinerary Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC]">
                    Lock in your scheduled surgical admission date, private recovery suite, and sovereign escrow guarantee.
                  </p>
                </div>
              </div>

              {!(medicalCase.status === 'BOOKED' || medicalCase.bookingDetails || bookings.length > 0) && (
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenBookingModal}
                  leftIcon={<Check className="w-4 h-4" />}
                >
                  Proceed with Treatment Booking
                </Button>
              )}
            </div>

            {/* Sovereign Mock Escrow Notice */}
            <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Simulated Escrow Protection:</strong> To comply with healthcare system test boundaries, no real payment gateway is processed. The $500 USD deposit uses a mock authorization reference (<code className="text-xs font-mono font-bold text-[var(--green-rich)]">MOCK-ESCROW-XXXX</code>) and is held in simulated escrow until physical hospital check-in.
              </p>
            </div>
          </div>

          {/* If Booked, display full Confirmed Admission Dossier */}
          {(medicalCase.status === 'BOOKED' || medicalCase.bookingDetails || bookings.length > 0) ? (
            (() => {
              const b = medicalCase.bookingDetails || bookings[0] || {
                admissionDate: '2026-10-25',
                packagePrice: 6500,
                depositAmount: 500,
                estimatedStayDays: 10,
                providerName: medicalCase.selectedProviderName || 'Apex Orthopedic & Robotic Joint Institute',
                doctorName: 'Dr. Vikram Oberoi, MS, FRCS',
                paymentReference: 'MOCK-ESCROW-8492-9182',
                paymentStatus: 'MOCK_ESCROW_AUTHORIZED',
                companionNotes: 'Traveling with spouse, requires companion suite and kosher/vegetarian meals.',
                specialRequirements: ['Airport Chauffeur Transfer', 'Private Deluxe Suite', 'Multilingual Concierge'],
              }

              return (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left 2 Cols: Admission Itinerary & Accommodations */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card className="border-[var(--border-default)]">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-[var(--green-rich)]" />
                          <CardTitle className="text-base font-medium">
                            Confirmed Admission & Procedure Itinerary
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Case #{medicalCase.id} is officially reserved at the clinical center.
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-4 text-xs">
                        {/* 4 Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                              Hospital Center
                            </span>
                            <strong className="text-sm text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                              {b.providerName || medicalCase.destinationName}
                            </strong>
                            <span className="text-[11px] text-[var(--text-muted)] block">
                              Lead Surgeon: <strong>{b.doctorName || 'Dr. Vikram Oberoi'}</strong>
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                              Confirmed Admission Date
                            </span>
                            <strong className="text-sm text-[var(--green-rich)] dark:text-[#6F9F91] block">
                              {new Date(b.admissionDate).toLocaleDateString(undefined, {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </strong>
                            <span className="text-[11px] text-[var(--text-muted)] block">
                              Expected Duration: <strong>{b.estimatedStayDays || 10} Days Inpatient Stay</strong>
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                              Package Procedure
                            </span>
                            <strong className="text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                              {b.treatmentName || medicalCase.treatmentName}
                            </strong>
                            <span className="text-[11px] text-[var(--text-muted)] block">
                              Total Package: <strong>${(b.packagePrice || 6500).toLocaleString()} USD</strong>
                            </span>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                              Patient Full Name
                            </span>
                            <strong className="text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                              {medicalCase.patientName}
                            </strong>
                            <span className="text-[11px] text-[var(--text-muted)] block">
                              Case Ref: <strong>#{medicalCase.id}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Special Accommodations & Companion */}
                        <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                            Companion Accommodations & Requests
                          </span>
                          <p className="text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                            {b.companionNotes || 'Traveling with spouse, companion suite arranged.'}
                          </p>

                          {b.specialRequirements && b.specialRequirements.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {b.specialRequirements.map((req, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-[3px] bg-[var(--bg-base)] dark:bg-[#151C1A] border border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-center gap-1.5"
                                >
                                  <Check className="w-3 h-3 text-[var(--green-rich)]" /> {req}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              addToast({
                                type: 'success',
                                title: 'Voucher Exported',
                                message: `Official hospital admission voucher for ${medicalCase.id} downloaded.`,
                              })
                            }
                            leftIcon={<Download className="w-3.5 h-3.5" />}
                          >
                            Export Admission Voucher
                          </Button>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenConsultationModal('follow-up')}
                            leftIcon={<Clock className="w-3.5 h-3.5" />}
                          >
                            Schedule Post-Op Follow-Up
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Col: Mock Escrow & Security Card */}
                  <div className="space-y-6 text-xs">
                    <Card className="border-[var(--border-default)]">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[var(--green-rich)]" />
                          <CardTitle className="text-sm font-medium">
                            Sovereign Escrow Receipt
                          </CardTitle>
                        </div>
                        <CardDescription>
                          Simulated holding authorization
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                              Escrow Status
                            </span>
                            <Badge variant="success" size="sm">
                              {b.paymentStatus || 'MOCK_ESCROW_AUTHORIZED'}
                            </Badge>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                              Escrow Reference
                            </span>
                            <span className="text-xs font-mono font-medium text-[var(--green-rich)]">
                              {b.paymentReference || 'MOCK-ESCROW-8492-9182'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                              Deposit Hold
                            </span>
                            <span className="text-xs font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              ${(b.depositAmount || 500).toLocaleString()} USD
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-mono text-[var(--text-muted)]">
                              Remaining Balance
                            </span>
                            <span className="text-xs text-[var(--text-muted)]">
                              ${((b.packagePrice || 6500) - (b.depositAmount || 500)).toLocaleString()} USD (Due at Hospital)
                            </span>
                          </div>
                        </div>

                        <div className="text-[11px] text-[var(--text-muted)] space-y-1 leading-relaxed">
                          <p>
                            • Simulated deposit authorization ensures provider readiness without transferring real capital.
                          </p>
                          <p>
                            • In accordance with platform safety specifications, zero real payment gateways are connected.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })()
          ) : (
            /* If Not Booked, display Booking Callout and readiness check */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-[var(--border-default)]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--green-rich)]" />
                      <CardTitle className="text-base font-medium">
                        Lock In Your Surgical Admission & Package
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Once you have completed your telemedicine consultation or selected your accredited provider, confirm your admission date.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 text-xs">
                    <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] space-y-2">
                      <h4 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        Booking Inclusions Guarantee:
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[var(--text-secondary)] text-xs">
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
                          <span>Fixed transparent pricing with zero surprise bills</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
                          <span>Private Deluxe Inpatient Suite with companion stay</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
                          <span>Dedicated Airport Chauffeur & VIP Medical Concierge</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
                          <span>Mock escrow deposit protection ($500 USD simulated hold)</span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <Button
                        variant="primary"
                        size="lg"
                        onClick={handleOpenBookingModal}
                        leftIcon={<Check className="w-4 h-4" />}
                      >
                        Proceed with Treatment Booking
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => handleOpenConsultationModal('consultation')}
                        leftIcon={<Video className="w-4 h-4" />}
                      >
                        Schedule Video Consultation First
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6 text-xs">
                <div className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-3">
                  <h4 className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    Recommended Flow
                  </h4>
                  <div className="space-y-2 text-[11px] text-[var(--text-muted)]">
                    <p className="flex items-start gap-2">
                      <span className="font-mono font-medium text-[var(--green-rich)]">1.</span>
                      <span>Review institutional quotes and select preferred hospital.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-mono font-medium text-[var(--green-rich)]">2.</span>
                      <span>Request a 45-min virtual consultation with the lead surgeon.</span>
                    </p>
                    <p className="flex items-start gap-2">
                      <span className="font-mono font-medium text-[var(--green-rich)]">3.</span>
                      <span>Confirm your admission date & lock in your package.</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: Coordination-Focused Aftercare Support                             */}
      {/* ========================================================================= */}
      {activeTab === 'aftercare' && (
        <AftercareModule caseId={caseId} medicalCase={medicalCase} />
      )}

      {/* ========================================================================= */}
      {/* TAB 6: Access Audit Ledger                                                */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] p-6 space-y-4 text-xs">
          <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">Immutable Diagnostic Access Ledger</h3>
          <p className="text-xs text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">
            Cryptographically audited log tracking whenever an international physician, radiologist, or coordinator views your diagnostic records.
          </p>

          <div className="space-y-3 pt-2">
            <div className="p-3.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between">
              <div>
                <strong className="text-[var(--text-primary)] dark:text-[#F2F4F1] block">Apex Joint Institute · Dr. Vikram Oberoi</strong>
                <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">Inspected Right_Knee_Coronal_MRI_HighRes.pdf for surgical planning</p>
              </div>
              <span className="text-[10px] text-[var(--text-primary)]/50 dark:text-[#89938F] font-mono">Today, 09:14 AM</span>
            </div>

            <div className="p-3.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between">
              <div>
                <strong className="text-[var(--text-primary)] dark:text-[#F2F4F1] block">Horizon Medical City · Clinical Coordinator Desk</strong>
                <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">Viewed Weight_Bearing_Bilateral_XRay_AP.jpg for quotation generation</p>
              </div>
              <span className="text-[10px] text-[var(--text-primary)]/50 dark:text-[#89938F] font-mono">Yesterday, 04:22 PM</span>
            </div>

            <div className="p-3.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between">
              <div>
                <strong className="text-[var(--text-primary)] dark:text-[#F2F4F1] block">EthAum Grok AI Engine</strong>
                <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">Indexed 4 PDF/JPG documents and synthesized clinical coordination summary</p>
              </div>
              <span className="text-[10px] text-[var(--text-primary)]/50 dark:text-[#89938F] font-mono">Sept 18, 10:16 AM</span>
            </div>
          </div>
        </div>
      )}

      {/* Patient Fact Correction Modal */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[6px] shadow-xl w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[var(--copper)]" />
                <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  Flag or Correct Extracted Fact
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCorrectionModalOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCorrection} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Section
                </label>
                <p className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  {correctionTarget.title}
                </p>
              </div>

              {correctionTarget.originalValue && (
                <div>
                  <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                    Current Extracted Value
                  </label>
                  <p className="p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] text-[var(--text-secondary)] text-[11px]">
                    {correctionTarget.originalValue}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] mb-1">
                  Your Corrected Information <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={correctionNewValue}
                  onChange={(e) => setCorrectionNewValue(e.target.value)}
                  placeholder="Enter accurate information to override the automated extraction..."
                  rows={3}
                  required
                  className="w-full p-2.5 bg-[var(--bg-base)] dark:bg-[#151C1A] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-default)] rounded-[3px] outline-none focus:border-[#315B55] dark:focus:border-[#6F9F91]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-secondary)] mb-1">
                  Reason or Clarification (Optional)
                </label>
                <input
                  type="text"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  placeholder="e.g. Updated dosage per recent consult, misread date..."
                  className="w-full p-2 bg-[var(--bg-base)] dark:bg-[#151C1A] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-default)] rounded-[3px] outline-none focus:border-[#315B55] dark:focus:border-[#6F9F91]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCorrectionModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmittingCorrection || !correctionNewValue.trim()}
                >
                  {isSubmittingCorrection ? 'Saving...' : 'Apply Verified Correction'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quote Comparison Modal */}
      <QuoteComparisonModal
        isOpen={isComparisonModalOpen}
        onClose={() => setIsComparisonModalOpen(false)}
        quotes={quotes}
        onSelectProvider={handleOpenSelectProvider}
        onAskQuestion={handleOpenAskQuestion}
      />

      {/* Ask Question on Quote Modal */}
      <AskQuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        quote={activeQuoteForQuestion}
        onSubmitQuestion={handleSubmitQuestion}
        isSubmitting={isSubmittingQuestion}
      />

      {/* Select Provider Confirmation Modal (No Payment Processing) */}
      <SelectProviderModal
        isOpen={isSelectModalOpen}
        onClose={() => setIsSelectModalOpen(false)}
        quote={activeQuoteForSelect}
        onConfirmSelection={handleConfirmSelectProvider}
        isProcessing={isProcessingSelect}
      />

      {/* Consultation & Telemedicine Booking Modal */}
      <ConsultationBookingModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        caseId={medicalCase.id}
        defaultProviderId={medicalCase.selectedProviderId || 'apex-joint-delhi'}
        defaultDoctorId={medicalCase.selectedDoctorId || 'dr-vikram-oberoi'}
        onSuccess={handleConsultationSuccess}
      />

      {/* Treatment & Hospital Admission Booking Modal (Mock Escrow Only) */}
      <TreatmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        caseData={medicalCase}
        onSuccess={handleBookingSuccess}
      />
    </div>
  )
}

export default CaseDetailPage
