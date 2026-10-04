import React, { useState, useEffect } from 'react'
import {
  Building2,
  ShieldCheck,
  FileText,
  Calendar,
  DollarSign,
  Bell,
  User,
  Stethoscope,
  ExternalLink,
  Eye,
  Send,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  AlertCircle,
  Trash2,
  Edit3,
  Lock,
  MessageSquare,
  Search,
  Check,
  Download,
  Video,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import {
  Badge,
  Button,
  Modal,
  StatusBadge,
  useToast,
  Breadcrumb,
} from '../../components'

import { providerService } from '../../services/providerService'
import { recordService } from '../../services/recordService'
import { quoteService } from '../../services/quoteService'
import { appointmentService } from '../../services/appointmentService'
import { messageService } from '../../services/messageService'

export function ProviderPortalPage() {
  const { user } = useAuth()
  const { addToast } = useToast()

  // Primary State
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('cases')
  const [dashboardData, setDashboardData] = useState(null)

  // Cases and Selected Case
  const [cases, setCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [caseFilter, setCaseFilter] = useState('all') // 'all' | 'active' | 'pending'
  const [caseSearch, setCaseSearch] = useState('')
  const [appointmentFilter, setAppointmentFilter] = useState('all') // 'all' | 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'

  // Records Modal State
  const [recordsModalOpen, setRecordsModalOpen] = useState(false)
  const [caseRecords, setCaseRecords] = useState([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordAuditLogs, setRecordAuditLogs] = useState({})

  // Quote Creation & Management State
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [providerQuotes, setProviderQuotes] = useState([])
  const [quoteFilter, setQuoteFilter] = useState('all') // 'all' | 'DRAFT' | 'SUBMITTED' | 'ACCEPTED' | 'REJECTED'
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null)
  const [questionAnswerText, setQuestionAnswerText] = useState('')
  const [submittingAnswer, setSubmittingAnswer] = useState(false)
  const [submittingQuote, setSubmittingQuote] = useState(false)

  const [quoteForm, setQuoteForm] = useState({
    caseId: '',
    treatmentId: '',
    treatmentName: '',
    consultationDescription: 'Pre-operative specialist orthopedic evaluation & 45-min virtual video review',
    consultationCost: 300,
    diagnosticsDescription: 'Pre-admission robotic 3D CT scan, weight-bearing bilateral radiographs, complete metabolic panel',
    diagnosticsCost: 600,
    accommodationApplicable: true,
    accommodationRoomType: 'Private Deluxe Suite with Companion Bed',
    accommodationNights: 4,
    accommodationCost: 1200,
    accommodationNotes: 'Includes companion sleeper bed and daily meals',
    otherServicesDescription: 'Airport transfers, dedicated international concierge, and inpatient physiotherapy',
    otherServicesCost: 900,
    surgicalBaseFee: 3500,
    total: 6500,
    currency: 'USD',
    validity: '2026-12-15',
    notes: 'Cruciate-retaining robotic total knee arthroplasty using Stryker Mako robotic arm with FDA-approved implant.',
    exclusions: 'International airfare and travel visas\nPersonal incidental expenses\nTreatment of unrelated pre-existing acute comorbidities\nExtended ICU care beyond standard protocol',
  })


  // Treatment Catalog State
  const [treatments, setTreatments] = useState([])
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false)
  const [editingTreatment, setEditingTreatment] = useState(null)
  const [treatmentForm, setTreatmentForm] = useState({
    treatmentId: '',
    name: '',
    startingPriceUSD: 5000,
    inclusions: '',
  })

  // Patient Messaging Modal State
  const [messageModalOpen, setMessageModalOpen] = useState(false)
  const [messageText, setMessageText] = useState('')
  const [messagingCase, setMessagingCase] = useState(null)
  const [messagesList, setMessagesList] = useState([])
  const [sendingMessage, setSendingMessage] = useState(false)

  // Profile Edit State
  const [profile, setProfile] = useState(null)
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    tagline: '',
    overview: '',
    facilities: '',
    airportConcierge: '',
    visaAssistance: '',
  })

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await providerService.getDashboard()
      const d = data?.data || data || {}
      setDashboardData(d)
      setCases(d.cases || [])
      if (d.cases && d.cases.length > 0 && !selectedCase) {
        setSelectedCase(d.cases[0])
      }
      setProfile(d.provider || null)
      if (d.provider) {
        setProfileForm({
          tagline: d.provider.tagline || '',
          overview: d.provider.overview || '',
          facilities: Array.isArray(d.provider.facilities)
            ? d.provider.facilities.join('\n')
            : '',
          airportConcierge: d.provider.internationalSupport?.airportConcierge || '',
          visaAssistance: d.provider.internationalSupport?.visaAssistance || '',
        })
      }

      // Load Quotes for Provider
      try {
        const qList = await quoteService.listQuotes(null, d.provider?.id || user?.providerId || 'apex-joint-delhi')
        if (Array.isArray(qList)) {
          setProviderQuotes(qList)
        } else if (d.recentQuotes) {
          setProviderQuotes(d.recentQuotes)
        }
      } catch (qErr) {
        if (d.recentQuotes) setProviderQuotes(d.recentQuotes)
      }
    } catch (err) {
      console.warn('Failed to load live dashboard, applying fallback:', err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load Treatments
  const loadTreatments = async () => {
    try {
      const res = await providerService.getTreatments()
      const list = res?.data || res || []
      setTreatments(list)
    } catch (err) {
      console.warn('Failed to load treatments:', err.message)
    }
  }

  useEffect(() => {
    loadDashboard()
    loadTreatments()
  }, [])

  // Open Authorized Medical Records for a Case
  const handleOpenRecords = async (c) => {
    setSelectedCase(c)
    setRecordsModalOpen(true)
    setLoadingRecords(true)
    try {
      const res = await recordService.listRecords(c.id)
      const recs = res?.data || res || []
      setCaseRecords(recs)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Records Access Error',
        message: err.message || 'Unable to retrieve records for this case.',
      })
    } finally {
      setLoadingRecords(false)
    }
  }

  // View Record (Triggers object-level audit log on backend)
  const handleViewRecord = async (record) => {
    try {
      const res = await recordService.getRecordById(record.id)
      addToast({
        type: 'success',
        title: 'HIPAA Access Logged',
        message: `Sensitive record view for "${record.name}" logged in immutable audit trail.`,
      })

      // Fetch updated audit logs for this record
      const logsRes = await recordService.getAccessLogs(record.id)
      const logs = logsRes?.data || logsRes || []
      setRecordAuditLogs((prev) => ({ ...prev, [record.id]: logs }))
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Access Denied',
        message: err.message || 'You do not have active permission to inspect this scan.',
      })
    }
  }

  // Open Quote Modal
  const handleOpenQuoteModal = (c) => {
    setSelectedCase(c)
    const baseFee = c.budgetMin ? Math.round(c.budgetMin * 0.5) : 3500
    setQuoteForm({
      caseId: c.id,
      treatmentId: c.treatmentId || 'knee-replacement',
      treatmentName: c.treatmentName || 'Specialized Procedure',
      consultationDescription: 'Pre-operative specialist orthopedic evaluation & 45-min virtual video review',
      consultationCost: 300,
      diagnosticsDescription: 'Pre-admission robotic 3D CT scan, weight-bearing bilateral radiographs, complete metabolic panel',
      diagnosticsCost: 600,
      accommodationApplicable: true,
      accommodationRoomType: 'Private Deluxe Suite with Companion Bed',
      accommodationNights: 4,
      accommodationCost: 1200,
      accommodationNotes: 'Includes companion sleeper bed and daily meals',
      otherServicesDescription: 'Airport transfers, dedicated international concierge, and inpatient physiotherapy',
      otherServicesCost: 900,
      surgicalBaseFee: baseFee,
      total: 300 + 600 + 1200 + 900 + baseFee,
      currency: c.currency || 'USD',
      validity: '2026-12-15',
      notes: 'Cruciate-retaining robotic total knee arthroplasty using Stryker Mako robotic arm with FDA-approved implant.',
      exclusions: 'International airfare and travel visas\nPersonal incidental expenses\nTreatment of unrelated pre-existing acute comorbidities\nExtended ICU care beyond standard protocol',
    })
    setQuoteModalOpen(true)
  }

  // Create Quote as Draft or Submit
  const handleSaveQuote = async (statusToSet = 'SUBMITTED') => {
    setSubmittingQuote(true)
    try {
      const exclusionsList = quoteForm.exclusions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        caseId: quoteForm.caseId,
        treatmentId: quoteForm.treatmentId,
        treatmentName: quoteForm.treatmentName,
        consultation: {
          description: quoteForm.consultationDescription,
          cost: Number(quoteForm.consultationCost) || 0,
        },
        diagnostics: {
          description: quoteForm.diagnosticsDescription,
          cost: Number(quoteForm.diagnosticsCost) || 0,
        },
        accommodation: {
          applicable: Boolean(quoteForm.accommodationApplicable),
          roomType: quoteForm.accommodationRoomType,
          nights: Number(quoteForm.accommodationNights) || 0,
          cost: quoteForm.accommodationApplicable ? (Number(quoteForm.accommodationCost) || 0) : 0,
          notes: quoteForm.accommodationNotes,
        },
        otherServices: {
          description: quoteForm.otherServicesDescription,
          cost: Number(quoteForm.otherServicesCost) || 0,
        },
        total: Number(quoteForm.total) || 6500,
        price: Number(quoteForm.total) || 6500,
        currency: quoteForm.currency,
        validity: quoteForm.validity,
        validUntil: quoteForm.validity,
        notes: quoteForm.notes,
        exclusions: exclusionsList,
        status: statusToSet,
      }

      await quoteService.createQuote(payload)

      addToast({
        type: 'success',
        title: statusToSet === 'DRAFT' ? 'Draft Quote Saved' : 'Quote Submitted to Patient',
        message:
          statusToSet === 'DRAFT'
            ? 'Quote saved as draft in your portal.'
            : `Quote for ${quoteForm.treatmentName} successfully submitted to ${selectedCase?.patientName || 'patient'}.`,
      })
      setQuoteModalOpen(false)
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Submission Failed',
        message: err.message || 'Unable to submit quote.',
      })
    } finally {
      setSubmittingQuote(false)
    }
  }

  // Publish existing draft
  const handlePublishDraft = async (q) => {
    try {
      await quoteService.submitQuote(q.id)
      addToast({
        type: 'success',
        title: 'Quote Dispatched',
        message: `Draft Quote #${q.id} has been submitted to the patient.`,
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      })
    }
  }

  // Answer Patient Question
  const handleAnswerQuestion = async (quoteId, questionId) => {
    if (!questionAnswerText.trim()) return
    setSubmittingAnswer(true)
    try {
      await quoteService.answerQuestion(quoteId, questionId, questionAnswerText.trim())
      addToast({
        type: 'success',
        title: 'Response Sent',
        message: 'Your answer has been sent to the patient.',
      })
      setAnsweringQuestionId(null)
      setQuestionAnswerText('')
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Send Response',
        message: err.message,
      })
    } finally {
      setSubmittingAnswer(false)
    }
  }


  // Open Message Modal
  const handleOpenMessageModal = (c) => {
    setMessagingCase(c)
    setMessageModalOpen(true)
    setMessageText('')
    setMessagesList([
      {
        id: 'msg-1',
        sender: 'patient',
        senderName: c.patientName,
        text: `Hello Dr. Oberoi, I have uploaded my coronal MRI and full leg X-rays. Please let me know if you need additional views.`,
        timestamp: 'Oct 2, 2026, 11:20 AM',
      },
      {
        id: 'msg-2',
        sender: 'provider',
        senderName: 'Apex Joint Clinical Desk',
        text: `Thank you, ${c.patientName}. Our surgical panel is reviewing your DICOM series. We have scheduled your pre-operative tele-consultation.`,
        timestamp: 'Oct 2, 2026, 02:45 PM',
      },
    ])
  }

  // Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!messageText.trim()) return

    setSendingMessage(true)
    try {
      // Simulate/trigger message service
      const newMsg = {
        id: `msg-${Date.now()}`,
        sender: 'provider',
        senderName: 'Apex Joint Institute',
        text: messageText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
      setMessagesList((prev) => [...prev, newMsg])
      setMessageText('')
      addToast({
        type: 'success',
        title: 'Message Sent',
        message: `Direct note delivered securely to ${messagingCase?.patientName}.`,
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Send',
        message: err.message,
      })
    } finally {
      setSendingMessage(false)
    }
  }

  // Confirm Appointment (Provisions WebRTC meeting room & updates case journey)
  const handleConfirmAppointment = async (aptId) => {
    try {
      await appointmentService.confirmAppointment(aptId)
      addToast({
        type: 'success',
        title: 'Consultation Confirmed',
        message: 'Encrypted telemedicine room provisioned. Patient notified.',
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: err.message,
      })
    }
  }

  // Complete Appointment (Marks COMPLETED & logs clinical summary event)
  const handleCompleteAppointment = async (aptId) => {
    try {
      await appointmentService.completeAppointment(aptId)
      addToast({
        type: 'success',
        title: 'Consultation Completed',
        message: 'Clinical summary logged. Patient is now eligible to finalize treatment booking.',
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Completion Failed',
        message: err.message,
      })
    }
  }

  // Cancel Appointment
  const handleCancelAppointment = async (aptId) => {
    try {
      await appointmentService.cancelAppointment(aptId)
      addToast({
        type: 'info',
        title: 'Appointment Cancelled',
        message: 'The consultation slot has been released.',
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Cancellation Failed',
        message: err.message,
      })
    }
  }

  // Mark No-Show
  const handleMarkNoShow = async (aptId) => {
    try {
      await appointmentService.updateAppointment(aptId, { status: 'NO_SHOW' })
      addToast({
        type: 'warning',
        title: 'Marked as No-Show',
        message: 'Appointment recorded as patient no-show.',
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message,
      })
    }
  }

  // Legacy fallback
  const handleUpdateAppointment = async (aptId, newStatus) => {
    try {
      await appointmentService.updateAppointment(aptId, { status: newStatus })
      addToast({
        type: 'success',
        title: 'Appointment Updated',
        message: `Consultation marked as ${newStatus}.`,
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      })
    }
  }

  // Add / Edit Treatment Procedure
  const handleSaveTreatment = async (e) => {
    e.preventDefault()
    try {
      const inclusionsList = treatmentForm.inclusions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      const payload = {
        treatmentId: treatmentForm.treatmentId.toLowerCase().replace(/\s+/g, '-'),
        name: treatmentForm.name,
        startingPriceUSD: Number(treatmentForm.startingPriceUSD),
        inclusions: inclusionsList,
      }

      if (editingTreatment) {
        await providerService.updateTreatment(editingTreatment.treatmentId, payload)
        addToast({
          type: 'success',
          title: 'Treatment Package Updated',
          message: `${treatmentForm.name} package pricing updated.`,
        })
      } else {
        await providerService.addTreatment(payload)
        addToast({
          type: 'success',
          title: 'Procedure Package Created',
          message: `${treatmentForm.name} added to hospital offerings.`,
        })
      }

      setTreatmentModalOpen(false)
      loadTreatments()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message,
      })
    }
  }

  const handleDeleteTreatment = async (treatmentId) => {
    if (!window.confirm('Are you sure you want to remove this procedure package?')) return
    try {
      await providerService.deleteTreatment(treatmentId)
      addToast({
        type: 'info',
        title: 'Package Removed',
        message: 'Treatment package removed from catalog.',
      })
      loadTreatments()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Delete Failed',
        message: err.message,
      })
    }
  }

  // Save Institutional Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      const facilitiesList = profileForm.facilities
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)

      await providerService.updateProfile({
        tagline: profileForm.tagline,
        overview: profileForm.overview,
        facilities: facilitiesList,
        internationalSupport: {
          airportConcierge: profileForm.airportConcierge,
          visaAssistance: profileForm.visaAssistance,
        },
      })

      addToast({
        type: 'success',
        title: 'Profile Saved',
        message: 'Institutional hospital details successfully updated.',
      })
      loadDashboard()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message,
      })
    } finally {
      setSavingProfile(false)
    }
  }

  // Filtered Cases
  const filteredCases = cases.filter((c) => {
    if (caseFilter === 'active') {
      if (!['CONSULTATION', 'BOOKED', 'TREATMENT', 'AFTERCARE'].includes(c.status)) return false
    } else if (caseFilter === 'pending') {
      if (!['DRAFT', 'RECORDS_PENDING', 'QUALIFICATION', 'MATCHING', 'QUOTES_RECEIVED'].includes(c.status))
        return false
    }
    if (caseSearch.trim()) {
      const q = caseSearch.toLowerCase()
      const matchName = c.patientName?.toLowerCase().includes(q)
      const matchTreatment = c.treatmentName?.toLowerCase().includes(q)
      const matchId = c.id?.toLowerCase().includes(q)
      if (!matchName && !matchTreatment && !matchId) return false
    }
    return true
  })

  const metrics = dashboardData?.metrics || {
    activeCases: cases.filter((c) => ['CONSULTATION', 'BOOKED', 'TREATMENT', 'AFTERCARE'].includes(c.status)).length,
    pendingCases: cases.filter((c) => ['DRAFT', 'RECORDS_PENDING', 'QUALIFICATION', 'MATCHING', 'QUOTES_RECEIVED'].includes(c.status)).length,
    consultations: dashboardData?.upcomingConsultations?.length || 2,
    quotes: dashboardData?.recentQuotes?.length || 2,
    notifications: dashboardData?.notifications?.length || 3,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Provider Platform', current: true },
        ]}
      />

      {/* Sovereign Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)]">
              Hospital Clinical Desk & Case Command
            </span>
            <Badge variant="primary" size="sm">
              JCI Partner Network
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[var(--text-primary)] font-medium">
            {profile?.name || user?.organization || 'Apex Orthopedic & Robotic Joint Institute'}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-primary)]/70 mt-1 flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            {profile?.city || 'New Delhi'}, {profile?.country || 'India'}
            <span className="text-[var(--text-muted)]">·</span>
            <span>Lead: {user?.name || 'Dr. Vikram Oberoi, MS, FRCS'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-[#EBF5EE] border border-[#CFEADB] text-[var(--green-rich)] text-xs font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>HIPAA & GDPR Sovereign Audit Enforced</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5 KPI METRICS: ACTIVE CASES, PENDING CASES, CONSULTATIONS, QUOTES, NOTIFICATIONS */}
      {/* Non-Overloaded, Crisp Sovereign Cards */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Active Cases */}
        <div
          onClick={() => {
            setActiveTab('cases')
            setCaseFilter('active')
          }}
          className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--green-rich)]/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--green-rich)]">
              Active Cases
            </span>
            <Stethoscope className="w-4 h-4 text-[var(--green-rich)]" />
          </div>
          <div className="text-2xl font-serif font-medium text-[var(--text-primary)]">
            {metrics.activeCases}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            In consultation & care
          </span>
        </div>

        {/* 2. Pending Cases */}
        <div
          onClick={() => {
            setActiveTab('cases')
            setCaseFilter('pending')
          }}
          className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[#B07D1E]/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[#B07D1E]">
              Pending Cases
            </span>
            <Clock className="w-4 h-4 text-[#B07D1E]" />
          </div>
          <div className="text-2xl font-serif font-medium text-[var(--text-primary)]">
            {metrics.pendingCases}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Awaiting quotes / review
          </span>
        </div>

        {/* 3. Consultations */}
        <div
          onClick={() => setActiveTab('consultations')}
          className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[#20516E]/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[#20516E]">
              Consultations
            </span>
            <Video className="w-4 h-4 text-[#20516E]" />
          </div>
          <div className="text-2xl font-serif font-medium text-[var(--text-primary)]">
            {metrics.consultations}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Upcoming tele-health
          </span>
        </div>

        {/* 4. Quotes */}
        <div
          onClick={() => setActiveTab('quotes')}
          className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-[var(--green-rich)]/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] group-hover:text-[var(--green-rich)]">
              Quotes
            </span>
            <DollarSign className="w-4 h-4 text-[var(--green-rich)]" />
          </div>
          <div className="text-2xl font-serif font-medium text-[var(--text-primary)]">
            {metrics.quotes}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Active estimates
          </span>
        </div>

        {/* 5. Notifications */}
        <div
          onClick={() => setActiveTab('overview')}
          className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] hover:border-amber-500/50 transition-all cursor-pointer shadow-xs group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] group-hover:text-amber-600">
              Notifications
            </span>
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-serif font-medium text-[var(--text-primary)]">
            {metrics.notifications}
          </div>
          <span className="text-[11px] text-[var(--text-muted)] mt-1 block">
            Coordination updates
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-[var(--border-hairline)] flex items-center justify-between">
        <div className="flex space-x-2 sm:space-x-4 overflow-x-auto">
          {[
            { id: 'cases', label: 'Authorized Cases', count: cases.length },
            { id: 'consultations', label: 'Consultations', count: metrics.consultations },
            { id: 'quotes', label: 'Institutional Quotes', count: metrics.quotes },
            { id: 'treatments', label: 'Treatment Catalog', count: treatments.length },
            { id: 'profile', label: 'Hospital Profile' },
          ].map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3 text-xs sm:text-sm font-medium border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'border-[var(--green-rich)] text-[var(--green-rich)] font-medium'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-[var(--green-rich)] text-white'
                        : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {activeTab === 'cases' && (
          <div className="hidden sm:flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={caseSearch}
                onChange={(e) => setCaseSearch(e.target.value)}
                placeholder="Search patient or case..."
                className="pl-8 pr-3 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: AUTHORIZED CASES (CASE MANAGEMENT) */}
      {/* Shows: case summary, relevant records, patient preferences, journey status, requested treatment */}
      {/* Strict Object-Level Access: Provider only sees authorized cases */}
      {/* ========================================================================= */}
      {activeTab === 'cases' && (
        <div className="space-y-6">
          {/* Sub-Filter Pills */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCaseFilter('all')}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                  caseFilter === 'all'
                    ? 'bg-[var(--green-rich)] text-white'
                    : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                }`}
              >
                All Authorized ({cases.length})
              </button>
              <button
                onClick={() => setCaseFilter('active')}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                  caseFilter === 'active'
                    ? 'bg-[var(--green-rich)] text-white'
                    : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                }`}
              >
                Active In-Care ({metrics.activeCases})
              </button>
              <button
                onClick={() => setCaseFilter('pending')}
                className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors ${
                  caseFilter === 'pending'
                    ? 'bg-[var(--green-rich)] text-white'
                    : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                }`}
              >
                Pending Quotes ({metrics.pendingCases})
              </button>
            </div>

            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[var(--green-rich)]" />
              <span>Strictly restricted to explicitly assigned & permitted patient records</span>
            </div>
          </div>

          {filteredCases.length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] space-y-3">
              <Stethoscope className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                No matching authorized cases
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Cases appear here once patients grant viewing permissions or your hospital is assigned.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredCases.map((c) => (
                <div
                  key={c.id}
                  className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-5 sm:p-6 shadow-xs hover:border-[var(--green-rich)]/40 transition-all space-y-5"
                >
                  {/* Case Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-hairline)]">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[4px] bg-[#EBF5EE] text-[var(--green-rich)] flex items-center justify-center font-medium text-sm">
                        {c.patientName ? c.patientName.charAt(0) : 'P'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-medium text-[var(--text-primary)]">
                            {c.patientName}
                          </h3>
                          <span className="text-xs text-[var(--text-muted)] font-mono">
                            #{c.id}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">
                          Target Destination: {c.destinationName || 'India'} · Preferred Date:{' '}
                          {c.preferredDate || 'Flexible 2026'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={c.status} />
                      <span className="text-xs px-2.5 py-1 rounded-[4px] bg-[var(--bg-base)] border border-[var(--border-hairline)] text-[var(--text-secondary)] font-medium">
                        Stage: {c.journeyStage || 'Clinical Evaluation'}
                      </span>
                    </div>
                  </div>

                  {/* 4 Core Dimensions: Requested Treatment, Case Summary, Patient Preferences, Records Status */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                    {/* 1. Requested Treatment */}
                    <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] block">
                        Requested Treatment
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-medium block">
                        {c.treatmentName}
                      </strong>
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        ID: {c.treatmentId}
                      </span>
                    </div>

                    {/* 2. Patient Preferences & Budget */}
                    <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] block">
                        Patient Preferences
                      </span>
                      <strong className="text-xs text-[var(--text-primary)] font-medium block">
                        Budget: ${c.budgetMin?.toLocaleString()} – ${c.budgetMax?.toLocaleString()} USD
                      </strong>
                      <span className="text-[11px] text-[var(--text-muted)] line-clamp-2">
                        {c.patientNotes || 'No specific accommodations noted'}
                      </span>
                    </div>

                    {/* 3. Clinical Summary / History */}
                    <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-1 md:col-span-2">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
                        <span>Case Summary & Documented History</span>
                        {c.coordinationSummary && (
                          <span className="text-[var(--green-rich)] flex items-center gap-1 font-mono text-[9px]">
                            <Sparkles className="w-2.5 h-2.5" /> AI Summarized
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                        {c.coordinationSummary?.executiveBrief ||
                          c.medicalHistory ||
                          'Clinical records and anamnesis provided for surgeon review.'}
                      </p>
                    </div>
                  </div>

                  {/* Confirmed Treatment Booking Strip (if BOOKED) */}
                  {(c.status === 'BOOKED' || c.bookingDetails) && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-[4px] border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-900 dark:text-emerald-200">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <strong>Confirmed Treatment Booking & Mock Escrow Authorized</strong>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Admission Date: <strong>{c.bookingDetails?.admissionDate || '2026-10-25'}</strong> · Stay: <strong>{c.bookingDetails?.estimatedStayDays || 10} days</strong> · Ref: <code className="font-mono text-[10px]">{c.bookingDetails?.paymentReference || 'MOCK-ESCROW-XXXX'}</code>
                          </p>
                        </div>
                      </div>
                      <Badge variant="success" size="sm">
                        Admission Locked
                      </Badge>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenRecords(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-base)] hover:bg-[#EBF5EE] text-xs font-medium text-[var(--text-primary)] hover:text-[var(--green-rich)] border border-[var(--border-default)] transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                        <span>Inspect Authorized Records</span>
                      </button>

                      <button
                        onClick={() => handleOpenMessageModal(c)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--bg-base)] hover:bg-[var(--bg-card)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border-default)] transition-colors"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                        <span>Message Patient</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleOpenQuoteModal(c)}
                        icon={<DollarSign className="w-3.5 h-3.5" />}
                      >
                        Create Quote
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONSULTATIONS (APPOINTMENT MANAGEMENT - REQUESTED, CONFIRMED, COMPLETED, CANCELLED, NO_SHOW) */}
      {/* ========================================================================= */}
      {activeTab === 'consultations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                Scheduled Clinical Consultations
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Manage pre-surgical telemedicine calls and post-op follow-ups with WebRTC rooms
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'all', label: 'All' },
                { id: 'REQUESTED', label: 'Requested' },
                { id: 'CONFIRMED', label: 'Confirmed' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'CANCELLED', label: 'Cancelled' },
                { id: 'NO_SHOW', label: 'No-Show' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setAppointmentFilter(f.id)}
                  className={`px-2.5 py-1 rounded-[3px] text-xs font-medium transition-colors ${
                    appointmentFilter === f.id
                      ? 'bg-[var(--green-rich)] text-white'
                      : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)] border border-[var(--border-hairline)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {(() => {
              const allApts = dashboardData?.upcomingConsultations || []
              const filtered = allApts.filter((apt) => {
                if (appointmentFilter === 'all') return true
                const st = (apt.status || '').toUpperCase()
                if (appointmentFilter === 'REQUESTED') return st === 'REQUESTED' || st === 'PENDING'
                if (appointmentFilter === 'CONFIRMED') return st === 'CONFIRMED'
                if (appointmentFilter === 'COMPLETED') return st === 'COMPLETED'
                if (appointmentFilter === 'CANCELLED') return st === 'CANCELLED'
                if (appointmentFilter === 'NO_SHOW') return st === 'NO_SHOW'
                return true
              })

              if (filtered.length === 0) {
                return (
                  <div className="p-12 text-center bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-2">
                    <Video className="w-8 h-8 mx-auto text-[var(--text-muted)] opacity-60" />
                    <h3 className="text-sm font-medium text-[var(--text-primary)]">
                      No appointments matching filter
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Appointments in status "{appointmentFilter}" will appear here.
                    </p>
                  </div>
                )
              }

              return filtered.map((apt) => {
                const st = (apt.status || '').toUpperCase()
                const isRequested = st === 'REQUESTED' || st === 'PENDING'
                const isConfirmed = st === 'CONFIRMED'
                const isCompleted = st === 'COMPLETED'
                const isCancelled = st === 'CANCELLED'
                const isNoShow = st === 'NO_SHOW'

                return (
                  <div
                    key={apt.id}
                    className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-[4px] bg-[#EBF5EE] text-[var(--green-rich)]">
                          {apt.consultationType === 'follow-up' ? 'Post-Op Follow-Up' : 'Pre-Surgical Consultation'}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-mono">
                          Case #{apt.caseId}
                        </span>

                        {isRequested && (
                          <Badge variant="warning" size="sm">
                            REQUESTED
                          </Badge>
                        )}
                        {isConfirmed && (
                          <Badge variant="success" size="sm">
                            CONFIRMED
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="primary" size="sm">
                            COMPLETED
                          </Badge>
                        )}
                        {isCancelled && (
                          <Badge variant="default" size="sm">
                            CANCELLED
                          </Badge>
                        )}
                        {isNoShow && (
                          <Badge variant="outline" size="sm">
                            NO_SHOW
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-base font-medium text-[var(--text-primary)]">
                        {apt.title}
                      </h3>

                      <p className="text-xs text-[var(--text-secondary)]">
                        Specialist: <strong>{apt.doctorName || 'Dr. Vikram Oberoi'}</strong> · Scheduled:{' '}
                        <strong>
                          {new Date(apt.dateTime).toLocaleDateString()} at{' '}
                          {new Date(apt.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </strong>
                      </p>

                      {apt.notes && (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          Notes: {apt.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {isRequested && (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleConfirmAppointment(apt.id)}
                            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                          >
                            Confirm Consultation
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          {apt.meetingUrl && (
                            <a
                              href={apt.meetingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--green-rich)] text-white text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Launch Video Room</span>
                            </a>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCompleteAppointment(apt.id)}
                          >
                            Mark Completed
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkNoShow(apt.id)}
                          >
                            Mark No-Show
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCancelAppointment(apt.id)}
                          >
                            Cancel
                          </Button>
                        </>
                      )}

                      {isCompleted && (
                        <span className="text-xs font-medium text-[var(--green-rich)] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Consultation Completed
                        </span>
                      )}

                      {isCancelled && (
                        <span className="text-xs text-[var(--text-muted)] italic">
                          Slot Released
                        </span>
                      )}

                      {isNoShow && (
                        <span className="text-xs text-amber-700 dark:text-amber-400 italic">
                          Patient Missed Session
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* TAB 3: INSTITUTIONAL QUOTES MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[var(--border-hairline)]">
            <div>
              <h2 className="text-base font-serif font-medium text-[var(--text-primary)]">
                Institutional Hospital Quotes
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Draft, submit, and manage transparent clinical packages and patient inquiries
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => handleOpenQuoteModal(cases[0] || { id: 'ET-8492' })}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Create New Quote
            </Button>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Quotes' },
              { id: 'DRAFT', label: 'Drafts' },
              { id: 'SUBMITTED', label: 'Submitted' },
              { id: 'ACCEPTED', label: 'Accepted' },
              { id: 'REJECTED', label: 'Declined' },
              { id: 'EXPIRED', label: 'Expired' },
            ].map((st) => {
              const count =
                st.id === 'all'
                  ? providerQuotes.length
                  : providerQuotes.filter((q) => q.status === st.id).length
              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setQuoteFilter(st.id)}
                  className={`px-3 py-1 rounded-[4px] text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                    quoteFilter === st.id
                      ? 'bg-[var(--green-rich)] text-white shadow-2xs'
                      : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-base)]'
                  }`}
                >
                  <span>{st.label}</span>
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      quoteFilter === st.id ? 'bg-white/20 text-white' : 'bg-[var(--bg-base)] text-[var(--text-muted)]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Quotes List */}
          {providerQuotes.filter((q) => (quoteFilter === 'all' ? true : q.status === quoteFilter)).length === 0 ? (
            <div className="p-12 text-center bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] space-y-3">
              <DollarSign className="w-10 h-10 mx-auto text-[var(--text-muted)]" />
              <h3 className="text-sm font-medium text-[var(--text-primary)]">
                No quotes in category "{quoteFilter}"
              </h3>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                Create a proposal for any active case to dispatch or draft institutional pricing.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {providerQuotes
                .filter((q) => (quoteFilter === 'all' ? true : q.status === quoteFilter))
                .map((q) => {
                  const hasQuestions = q.questions && q.questions.length > 0
                  const isDraft = q.status === 'DRAFT'
                  const isAccepted = q.status === 'ACCEPTED'

                  return (
                    <div
                      key={q.id}
                      className={`p-6 bg-[var(--bg-card)] rounded-[4px] border space-y-5 shadow-xs ${
                        isAccepted
                          ? 'border-2 border-emerald-600 bg-emerald-50/10'
                          : isDraft
                          ? 'border-dashed border-amber-400 bg-amber-50/10'
                          : 'border-[var(--border-default)]'
                      }`}
                    >
                      {/* Top Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-hairline)]">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-serif font-medium text-[var(--text-primary)]">
                              {q.treatmentName}
                            </h3>
                            <StatusBadge status={q.status} />
                          </div>
                          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                            Case #{q.caseId} · Valid until: <strong>{q.validity || q.validUntil}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--text-muted)] block">
                            Total Package Fee
                          </span>
                          <strong className="text-xl font-serif text-[var(--text-primary)]">
                            ${(q.total || q.price)?.toLocaleString()} {q.currency || 'USD'}
                          </strong>
                        </div>
                      </div>

                      {/* 4-Component Cost Breakdown Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">
                            Consultation
                          </span>
                          <span className="font-medium text-xs text-[var(--text-primary)]">
                            ${q.consultation?.cost || 0}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {q.consultation?.description || 'Specialist Evaluation'}
                          </p>
                        </div>

                        <div className="p-2.5 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">
                            Diagnostics
                          </span>
                          <span className="font-medium text-xs text-[var(--text-primary)]">
                            ${q.diagnostics?.cost || 0}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {q.diagnostics?.description || 'Pre-op scans & labs'}
                          </p>
                        </div>

                        <div className="p-2.5 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">
                            Accommodation
                          </span>
                          <span className="font-medium text-xs text-[var(--text-primary)]">
                            {q.accommodation?.applicable ? `$${q.accommodation.cost || 0}` : 'Outpatient'}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {q.accommodation?.roomType || 'Standard Room'} ({q.accommodation?.nights || 0}N)
                          </p>
                        </div>

                        <div className="p-2.5 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)]">
                          <span className="text-[10px] text-[var(--text-muted)] block uppercase font-mono">
                            Other Services
                          </span>
                          <span className="font-medium text-xs text-[var(--text-primary)]">
                            ${q.otherServices?.cost || 0}
                          </span>
                          <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 mt-0.5">
                            {q.otherServices?.description || 'Concierge & transfers'}
                          </p>
                        </div>
                      </div>

                      {/* Clinical Notes & Exclusions */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {q.notes && (
                          <div className="p-3 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
                            <span className="text-[10px] font-mono uppercase text-[var(--text-muted)] block">
                              Clinical Protocol Notes:
                            </span>
                            <p className="text-[11px] text-[var(--text-secondary)] italic">
                              "{q.notes}"
                            </p>
                          </div>
                        )}

                        {q.exclusions && q.exclusions.length > 0 && (
                          <div className="p-3 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-1">
                            <span className="text-[10px] font-mono uppercase text-amber-700 block">
                              Exclusions:
                            </span>
                            <div className="space-y-0.5">
                              {q.exclusions.map((exc, eIdx) => (
                                <div key={eIdx} className="text-[11px] text-[var(--text-secondary)] flex items-start gap-1">
                                  <span className="text-amber-600 font-bold">•</span>
                                  <span>{exc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Patient Questions & Answers Section */}
                      {hasQuestions && (
                        <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-3 text-xs">
                          <span className="text-[11px] font-medium uppercase font-mono text-[var(--text-muted)] flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                            Patient Inquiries on this Quote ({q.questions.length})
                          </span>

                          <div className="space-y-3">
                            {q.questions.map((quest) => (
                              <div
                                key={quest.id}
                                className="p-3 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-hairline)] space-y-2"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <span className="text-[11px] font-medium text-[var(--text-primary)] block">
                                      {quest.patientName || 'Patient'}: "{quest.question}"
                                    </span>
                                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                                      {new Date(quest.createdAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <Badge
                                    variant={quest.status === 'ANSWERED' ? 'success' : 'warning'}
                                    size="sm"
                                  >
                                    {quest.status}
                                  </Badge>
                                </div>

                                {quest.answer ? (
                                  <div className="pt-1 text-[11px] text-[var(--text-secondary)] border-t border-[var(--border-hairline)]">
                                    <strong className="text-[var(--green-rich)] block text-[10px] uppercase font-mono">
                                      Your Sent Response ({quest.answeredBy || 'Provider'}):
                                    </strong>
                                    <p className="mt-0.5 italic">{quest.answer}</p>
                                  </div>
                                ) : (
                                  <div className="pt-2 border-t border-[var(--border-hairline)] space-y-2">
                                    {answeringQuestionId === quest.id ? (
                                      <div className="space-y-2">
                                        <textarea
                                          rows={2}
                                          value={questionAnswerText}
                                          onChange={(e) => setQuestionAnswerText(e.target.value)}
                                          placeholder="Type your clinical response to the patient..."
                                          className="w-full p-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-xs outline-none focus:border-[var(--green-rich)]"
                                        />
                                        <div className="flex items-center gap-2 justify-end">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setAnsweringQuestionId(null)}
                                          >
                                            Cancel
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="primary"
                                            loading={submittingAnswer}
                                            onClick={() => handleAnswerQuestion(q.id, quest.id)}
                                          >
                                            Submit Reply
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setAnsweringQuestionId(quest.id)
                                          setQuestionAnswerText('')
                                        }}
                                        className="text-xs font-medium text-[var(--green-rich)] hover:underline flex items-center gap-1 cursor-pointer"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>Reply to Patient</span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions for Draft / Active */}
                      {isDraft && (
                        <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                            Draft Status — Patient cannot see this until submitted.
                          </span>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handlePublishDraft(q)}
                            leftIcon={<Send className="w-3.5 h-3.5" />}
                          >
                            Submit Quote to Patient
                          </Button>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TREATMENT PROCEDURE CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'treatments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
            <div>
              <h2 className="text-base font-medium text-[var(--text-primary)]">
                Hospital Treatment & Package Catalog
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Define the procedures, starting package rates, and clinical inclusions offered by your hospital
              </p>
            </div>

            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                setEditingTreatment(null)
                setTreatmentForm({
                  treatmentId: '',
                  name: '',
                  startingPriceUSD: 5000,
                  inclusions: 'Pre-op diagnostic workup\nOperating room & surgeon fee\nInpatient private room\nPhysical therapy',
                })
                setTreatmentModalOpen(true)
              }}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Procedure
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {treatments.map((t) => (
              <div
                key={t.treatmentId}
                className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)]">
                      {t.name}
                    </h3>
                    <span className="text-xs font-mono text-[var(--text-muted)]">
                      {t.treatmentId}
                    </span>
                  </div>

                  <strong className="text-base font-serif text-[var(--green-rich)]">
                    ${t.startingPriceUSD?.toLocaleString()} USD
                  </strong>
                </div>

                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-muted)] block">
                    Inclusions
                  </span>
                  <ul className="space-y-1 list-disc list-inside">
                    {(t.inclusions || []).map((inc, idx) => (
                      <li key={idx} className="text-[11px] text-[var(--text-secondary)]">
                        {inc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-hairline)]">
                  <button
                    onClick={() => {
                      setEditingTreatment(t)
                      setTreatmentForm({
                        treatmentId: t.treatmentId,
                        name: t.name,
                        startingPriceUSD: t.startingPriceUSD,
                        inclusions: (t.inclusions || []).join('\n'),
                      })
                      setTreatmentModalOpen(true)
                    }}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-[4px]"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTreatment(t.treatmentId)}
                    className="p-1.5 text-red-500 hover:text-red-700 transition-colors rounded-[4px]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: HOSPITAL PROFILE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6 max-w-3xl">
          <div className="pb-2 border-b border-[var(--border-hairline)]">
            <h2 className="text-base font-medium text-[var(--text-primary)]">
              Hospital Institutional Profile
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Accreditation details, clinical facilities, and international patient desk services
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Institutional Tagline
              </label>
              <input
                type="text"
                value={profileForm.tagline}
                onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Overview & Surgical Capabilities
              </label>
              <textarea
                rows={4}
                value={profileForm.overview}
                onChange={(e) => setProfileForm({ ...profileForm, overview: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Clinical Facilities & Technology (one per line)
              </label>
              <textarea
                rows={4}
                value={profileForm.facilities}
                onChange={(e) => setProfileForm({ ...profileForm, facilities: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                  Airport Concierge Service
                </label>
                <input
                  type="text"
                  value={profileForm.airportConcierge}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, airportConcierge: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                  Medical Visa (MED-V) Assistance
                </label>
                <input
                  type="text"
                  value={profileForm.visaAssistance}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, visaAssistance: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" loading={savingProfile}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: AUTHORIZED MEDICAL RECORDS VIEWER (WITH AUDIT LOG CONFIRMATION) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={recordsModalOpen}
        onClose={() => setRecordsModalOpen(false)}
        title={`Authorized Diagnostic Records · Case #${selectedCase?.id}`}
        description={`Displaying patient files for ${selectedCase?.patientName} where explicit permission was granted.`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-3 bg-[#EBF5EE] border border-[#CFEADB] rounded-[4px] text-xs text-[var(--green-rich)] flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>HIPAA / GDPR Sovereign Security Active:</strong>
              <p className="mt-0.5 text-[11px] opacity-90">
                You can only access records explicitly authorized for your hospital ID. Every view and download event is immutably timestamped in the audit log.
              </p>
            </div>
          </div>

          {loadingRecords ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              Decrypting and loading authorized records...
            </div>
          ) : caseRecords.length === 0 ? (
            <div className="p-8 text-center text-xs text-[var(--text-muted)]">
              No medical records are currently permitted for this hospital ID.
            </div>
          ) : (
            <div className="space-y-3">
              {caseRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-3.5 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[var(--green-rich)]" />
                      <strong className="text-xs text-[var(--text-primary)] font-medium">
                        {r.name}
                      </strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)] font-medium">
                        {r.category || r.type}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">
                        {r.size}
                      </span>
                    </div>
                  </div>

                  {r.aiSummary && (
                    <div className="p-2 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-hairline)] text-[11px] text-[var(--text-secondary)] flex items-start gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                      <span>{r.aiSummary}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-[var(--text-muted)]">
                      Status: <strong className="text-[var(--green-rich)]">{r.status}</strong>
                    </span>

                    <button
                      onClick={() => handleViewRecord(r)}
                      className="inline-flex items-center gap-1 text-[var(--green-rich)] hover:underline font-medium"
                    >
                      <Eye className="w-3 h-3" /> Inspect Scan & Verify
                    </button>
                  </div>

                  {recordAuditLogs[r.id] && (
                    <div className="mt-2 pt-2 border-t border-[var(--border-hairline)] text-[10px] text-[var(--text-muted)]">
                      <span className="font-medium text-[var(--text-primary)]">Recent Access Log:</span>
                      <ul className="mt-1 space-y-0.5 font-mono">
                        {recordAuditLogs[r.id].slice(0, 3).map((log, idx) => (
                          <li key={idx}>
                            [{new Date(log.timestamp).toLocaleTimeString()}] {log.action} by {log.accessRole}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* MODAL 2: CREATE / EDIT INSTITUTIONAL QUOTE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
        title="Create Institutional Quote"
        description={`Configure comprehensive clinical package pricing for Case #${quoteForm.caseId}`}
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSaveQuote('SUBMITTED')
          }}
          className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1"
        >
          {/* Procedure & Target Case */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Case ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quoteForm.caseId}
                onChange={(e) => setQuoteForm({ ...quoteForm, caseId: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Procedure / Treatment Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={quoteForm.treatmentName}
                onChange={(e) => setQuoteForm({ ...quoteForm, treatmentName: e.target.value })}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
              />
            </div>
          </div>

          {/* 1. Consultation Component */}
          <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[11px] font-medium uppercase font-mono text-[var(--text-primary)] block">
              1. Consultation Component
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Consultation Description
                </label>
                <input
                  type="text"
                  value={quoteForm.consultationDescription}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, consultationDescription: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Fee ($ USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={quoteForm.consultationCost}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      consultationCost: Number(e.target.value),
                      total:
                        Number(e.target.value) +
                        Number(quoteForm.diagnosticsCost) +
                        (quoteForm.accommodationApplicable ? Number(quoteForm.accommodationCost) : 0) +
                        Number(quoteForm.otherServicesCost) +
                        Number(quoteForm.surgicalBaseFee),
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Diagnostics Component */}
          <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[11px] font-medium uppercase font-mono text-[var(--text-primary)] block">
              2. Diagnostics & Pre-Admission Workup
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Diagnostic Scope
                </label>
                <input
                  type="text"
                  value={quoteForm.diagnosticsDescription}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, diagnosticsDescription: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Diagnostics Fee ($ USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={quoteForm.diagnosticsCost}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      diagnosticsCost: Number(e.target.value),
                      total:
                        Number(quoteForm.consultationCost) +
                        Number(e.target.value) +
                        (quoteForm.accommodationApplicable ? Number(quoteForm.accommodationCost) : 0) +
                        Number(quoteForm.otherServicesCost) +
                        Number(quoteForm.surgicalBaseFee),
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
            </div>
          </div>

          {/* 3. Accommodation Component */}
          <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase font-mono text-[var(--text-primary)]">
                3. Accommodation Component
              </span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={quoteForm.accommodationApplicable}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setQuoteForm({
                      ...quoteForm,
                      accommodationApplicable: checked,
                      total:
                        Number(quoteForm.consultationCost) +
                        Number(quoteForm.diagnosticsCost) +
                        (checked ? Number(quoteForm.accommodationCost) : 0) +
                        Number(quoteForm.otherServicesCost) +
                        Number(quoteForm.surgicalBaseFee),
                    })
                  }}
                  className="rounded text-[var(--green-rich)]"
                />
                <span className="text-[11px] text-[var(--text-secondary)]">Include Accommodation</span>
              </label>
            </div>

            {quoteForm.accommodationApplicable && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                    Room Type
                  </label>
                  <input
                    type="text"
                    value={quoteForm.accommodationRoomType}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, accommodationRoomType: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                    Nights
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={quoteForm.accommodationNights}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, accommodationNights: Number(e.target.value) })
                    }
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                    Accommodation Fee ($ USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={quoteForm.accommodationCost}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        accommodationCost: Number(e.target.value),
                        total:
                          Number(quoteForm.consultationCost) +
                          Number(quoteForm.diagnosticsCost) +
                          Number(e.target.value) +
                          Number(quoteForm.otherServicesCost) +
                          Number(quoteForm.surgicalBaseFee),
                      })
                    }
                    className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. Other Services & Surgical Team */}
          <div className="p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-2">
            <span className="text-[11px] font-medium uppercase font-mono text-[var(--text-primary)] block">
              4. Support Services & Surgical Base
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Other Services (Transfers, Concierge, Physio)
                </label>
                <input
                  type="text"
                  value={quoteForm.otherServicesDescription}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, otherServicesDescription: e.target.value })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                  Services Cost ($ USD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={quoteForm.otherServicesCost}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      otherServicesCost: Number(e.target.value),
                      total:
                        Number(quoteForm.consultationCost) +
                        Number(quoteForm.diagnosticsCost) +
                        (quoteForm.accommodationApplicable ? Number(quoteForm.accommodationCost) : 0) +
                        Number(e.target.value) +
                        Number(quoteForm.surgicalBaseFee),
                    })
                  }
                  className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                Surgeon & Operating Room Base Fee ($ USD)
              </label>
              <input
                type="number"
                min={0}
                value={quoteForm.surgicalBaseFee}
                onChange={(e) =>
                  setQuoteForm({
                    ...quoteForm,
                    surgicalBaseFee: Number(e.target.value),
                    total:
                      Number(quoteForm.consultationCost) +
                      Number(quoteForm.diagnosticsCost) +
                      (quoteForm.accommodationApplicable ? Number(quoteForm.accommodationCost) : 0) +
                      Number(quoteForm.otherServicesCost) +
                      Number(e.target.value),
                  })
                }
                className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
              />
            </div>
          </div>

          {/* Total & Validity Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] items-end">
            <div>
              <label className="block text-[10px] font-mono uppercase text-[var(--text-muted)] mb-1">
                Calculated Total
              </label>
              <div className="text-xl font-serif font-medium text-[var(--green-rich)]">
                ${Number(quoteForm.total).toLocaleString()} {quoteForm.currency}
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                Currency
              </label>
              <select
                value={quoteForm.currency}
                onChange={(e) => setQuoteForm({ ...quoteForm, currency: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-muted)] mb-0.5">
                Quote Validity Date
              </label>
              <input
                type="date"
                required
                value={quoteForm.validity}
                onChange={(e) => setQuoteForm({ ...quoteForm, validity: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px] text-xs"
              />
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
              Clinical & Surgical Protocol Notes
            </label>
            <textarea
              rows={2}
              value={quoteForm.notes}
              onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
              className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-xs"
            />
          </div>

          {/* Exclusions */}
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
              Package Exclusions (one per line)
            </label>
            <textarea
              rows={3}
              value={quoteForm.exclusions}
              onChange={(e) => setQuoteForm({ ...quoteForm, exclusions: e.target.value })}
              className="w-full p-2.5 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-xs"
            />
          </div>

          {/* Action Buttons: Save Draft vs Submit */}
          <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setQuoteModalOpen(false)}
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={submittingQuote}
                onClick={() => handleSaveQuote('DRAFT')}
              >
                Save as Draft
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={submittingQuote}
                leftIcon={<Send className="w-3.5 h-3.5" />}
              >
                Submit Quote to Patient
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: PATIENT COMMUNICATION THREAD */}
      {/* ========================================================================= */}
      <Modal
        isOpen={messageModalOpen}
        onClose={() => setMessageModalOpen(false)}
        title={`Direct Case Communication · ${messagingCase?.patientName}`}
        description={`Secure clinical channel for Case #${messagingCase?.id}`}
        size="md"
      >
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto p-3 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-3 text-xs">
            {messagesList.map((m) => {
              const isProvider = m.sender === 'provider'
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isProvider ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-[10px] text-[var(--text-muted)] mb-0.5">
                    {m.senderName} · {m.timestamp}
                  </div>
                  <div
                    className={`p-2.5 rounded-[4px] max-w-[85%] text-xs leading-relaxed ${
                      isProvider
                        ? 'bg-[var(--green-rich)] text-white'
                        : 'bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-primary)]'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              )
            })}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type message to patient or coordinator..."
              className="flex-1 px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={sendingMessage}
              icon={<Send className="w-3.5 h-3.5" />}
            >
              Send
            </Button>
          </form>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 4: ADD/EDIT TREATMENT PROCEDURE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={treatmentModalOpen}
        onClose={() => setTreatmentModalOpen(false)}
        title={editingTreatment ? 'Edit Treatment Package' : 'New Treatment Procedure Package'}
        description="Configure procedure offerings and baseline international pricing."
        size="md"
      >
        <form onSubmit={handleSaveTreatment} className="space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
              Procedure Name
            </label>
            <input
              type="text"
              required
              value={treatmentForm.name}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Procedure Slug ID
              </label>
              <input
                type="text"
                required
                disabled={Boolean(editingTreatment)}
                value={treatmentForm.treatmentId}
                onChange={(e) => setTreatmentForm({ ...treatmentForm, treatmentId: e.target.value })}
                placeholder="e.g. robotic-hip-resurfacing"
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs font-mono disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
                Starting Price ($ USD)
              </label>
              <input
                type="number"
                required
                min={500}
                value={treatmentForm.startingPriceUSD}
                onChange={(e) =>
                  setTreatmentForm({ ...treatmentForm, startingPriceUSD: Number(e.target.value) })
                }
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[var(--text-primary)] mb-1">
              Standard Inclusions (one per line)
            </label>
            <textarea
              rows={4}
              required
              value={treatmentForm.inclusions}
              onChange={(e) => setTreatmentForm({ ...treatmentForm, inclusions: e.target.value })}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setTreatmentModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Offering
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProviderPortalPage
