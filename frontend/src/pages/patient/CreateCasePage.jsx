import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Stethoscope,
  FileText,
  Heart,
} from 'lucide-react'

import {
  SectionHeading,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Breadcrumb,
  Button,
  Input,
  Select,
  FileUploader,
  Badge,
  useToast,
} from '../../components'

import { useAuth } from '../../context/AuthContext'
import { caseService } from '../../services/caseService'
import { TREATMENTS_DATA } from '../../data/treatmentsData'
import { DESTINATIONS_DATA } from '../../data/destinationsData'

export function CreateCasePage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { user } = useAuth()

  // Current Step: 1 = Basic Info, 2 = Treatment & Destination, 3 = Medical Info, 4 = Review
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasRestoredDraft, setHasRestoredDraft] = useState(false)

  // Step 1: Basic Information
  const [patientName, setPatientName] = useState(user?.name || 'Eleanor Vance')
  const [email, setEmail] = useState(user?.email || 'patient@ethaum.com')
  const [phone, setPhone] = useState('+44 7911 123456')
  const [country, setCountry] = useState(user?.country || 'United Kingdom 🇬🇧')
  const [age, setAge] = useState('58')
  const [gender, setGender] = useState('Female')
  const [companion, setCompanion] = useState(true)

  // Step 2: Treatment & Destination
  const [treatmentId, setTreatmentId] = useState('knee-replacement')
  const [destinationId, setDestinationId] = useState('india')
  const [budgetMin, setBudgetMin] = useState('5500')
  const [budgetMax, setBudgetMax] = useState('8500')
  const [preferredDate, setPreferredDate] = useState('2026-11-20')
  const [flexibility, setFlexibility] = useState('Flexible within 2-3 weeks')

  // Step 3: Medical Information
  const [medicalHistory, setMedicalHistory] = useState(
    'Grade IV tricompartmental osteoarthritis in right knee. Severe bone-on-bone medial narrowing causing mobility restriction. Treated with physical therapy and cortisone injections over 14 months without lasting relief. No cardiac disease; mild hypertension managed with Lisinopril 10mg. Non-smoker, no drug allergies.'
  )
  const [patientNotes, setPatientNotes] = useState(
    'Prefer robotic-assisted cruciate-retaining implant. Requesting wheelchair assistance at airport arrival. Traveling with spouse and require companion accommodation.'
  )
  const [files, setFiles] = useState([
    {
      name: 'Knee_MRI_Coronal_T2.pdf',
      size: '14.2 MB',
      type: 'DICOM MRI Scan',
    },
    {
      name: 'WeightBearing_XRay_AP.jpg',
      size: '3.8 MB',
      type: 'Full Leg Radiograph',
    },
  ])

  // Validation errors
  const [errors, setErrors] = useState({})

  // Attempt to restore saved draft on mount
  useEffect(() => {
    const draft = caseService.getDraft()
    if (draft && draft.data) {
      const d = draft.data
      if (d.patientName) setPatientName(d.patientName)
      if (d.email) setEmail(d.email)
      if (d.phone) setPhone(d.phone)
      if (d.country) setCountry(d.country)
      if (d.age) setAge(String(d.age))
      if (d.gender) setGender(d.gender)
      if (typeof d.companion === 'boolean') setCompanion(d.companion)
      if (d.treatmentId) setTreatmentId(d.treatmentId)
      if (d.destinationId) setDestinationId(d.destinationId)
      if (d.budgetMin) setBudgetMin(String(d.budgetMin))
      if (d.budgetMax) setBudgetMax(String(d.budgetMax))
      if (d.preferredDate) setPreferredDate(d.preferredDate)
      if (d.flexibility) setFlexibility(d.flexibility)
      if (d.medicalHistory) setMedicalHistory(d.medicalHistory)
      if (d.patientNotes) setPatientNotes(d.patientNotes)
      if (Array.isArray(d.files)) setFiles(d.files)
      setHasRestoredDraft(true)
    }
  }, [])

  // Collect active form data
  const getFormData = () => {
    const selectedTreatment = TREATMENTS_DATA.find((t) => t.id === treatmentId)
    const selectedDest = DESTINATIONS_DATA.find((d) => d.id === destinationId)

    return {
      patientName,
      email,
      phone,
      country,
      age,
      gender,
      companion,
      treatmentId,
      treatmentName: selectedTreatment?.name || 'Medical Treatment',
      destinationId,
      destinationName: selectedDest ? `${selectedDest.name} ${selectedDest.flag}` : 'Global Care Center',
      budgetMin,
      budgetMax,
      preferredDate,
      flexibility,
      medicalHistory,
      patientNotes,
      records: files,
    }
  }

  // Handle Save Draft
  const handleSaveDraft = () => {
    const data = getFormData()
    caseService.saveDraft(data)
    addToast({
      type: 'success',
      title: 'Draft Saved Locally',
      message: 'Your case intake draft has been saved. You can safely return and complete it anytime.',
    })
  }

  // Handle Discard Draft
  const handleDiscardDraft = () => {
    caseService.clearDraft()
    setHasRestoredDraft(false)
    addToast({
      type: 'info',
      title: 'Draft Cleared',
      message: 'Restored default case template.',
    })
  }

  // Step Validation
  const validateStep = (step) => {
    const newErrors = {}
    if (step === 1) {
      if (!patientName.trim()) newErrors.patientName = 'Patient full name is required'
      if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid contact email is required'
      if (!age || Number(age) < 1 || Number(age) > 120) newErrors.age = 'Valid age is required'
    } else if (step === 2) {
      if (!treatmentId) newErrors.treatmentId = 'Please select a procedure'
      if (!destinationId) newErrors.destinationId = 'Please select a target destination'
      if (Number(budgetMin) > Number(budgetMax)) {
        newErrors.budget = 'Minimum budget cannot exceed maximum budget'
      }
      if (!preferredDate) newErrors.preferredDate = 'Preferred travel date is required'
    } else if (step === 3) {
      if (!medicalHistory.trim() || medicalHistory.trim().length < 20) {
        newErrors.medicalHistory = 'Please provide at least a brief summary of medical history (min 20 characters)'
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Continue to next step
  const handleContinue = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4))
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      addToast({
        type: 'error',
        title: 'Missing Required Fields',
        message: 'Please complete all required fields highlighted in red before continuing.',
      })
    }
  }

  // Go back
  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Final Submit
  const handleSubmitCase = async (e) => {
    e.preventDefault()
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      addToast({
        type: 'error',
        title: 'Incomplete Dossier',
        message: 'Please review and fill in all required sections.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const data = getFormData()
      const newCase = await caseService.createCase(data)
      setIsSubmitting(false)

      addToast({
        type: 'success',
        title: 'Medical Case Created Successfully',
        message: `Case #${newCase.id} registered. Diagnostic vault initialized.`,
      })

      navigate(`/cases/${newCase.id}`)
    } catch (err) {
      setIsSubmitting(false)
      addToast({
        type: 'error',
        title: 'Case Registration Error',
        message: err.message || 'Could not register case dossier.',
      })
    }
  }

  // Active step metadata
  const stepsMeta = [
    { num: '01', title: 'Basic Information', desc: 'Patient demographics & travel companion' },
    { num: '02', title: 'Treatment', desc: 'Clinical procedure, destination & budget' },
    { num: '03', title: 'Medical Information', desc: 'Clinical history, symptoms & diagnostic scans' },
    { num: '04', title: 'Review', desc: 'Verify dossier & submit sovereign case' },
  ]

  const selectedTreatment = TREATMENTS_DATA.find((t) => t.id === treatmentId)
  const selectedDest = DESTINATIONS_DATA.find((d) => d.id === destinationId)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Patient Dashboard', href: '/dashboard' },
          { label: 'Create Medical Case', current: true },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[var(--border-default)] dark:border-[var(--border-default)]">
        <div>
          <SectionHeading
            eyebrow="Case Intake Dossier"
            title="Create a Sovereign Medical Case"
            description="Your medical information is encrypted and stored in your private vault. Hospitals can only view records you explicitly permission."
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSaveDraft}
          leftIcon={<Save className="w-4 h-4" />}
          title="Save progress locally"
        >
          Save Draft
        </Button>
      </div>

      {/* Restored Draft Banner */}
      {hasRestoredDraft && (
        <div className="p-3.5 bg-[var(--bg-elevated)] dark:bg-[#1E2D28] border border-[var(--border-default)] dark:border-[#2B3E36] rounded-[4px] flex items-center justify-between text-xs text-[var(--text-primary)] dark:text-[var(--green-rich)]">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
            <span>Restored your saved case draft from this device.</span>
          </div>
          <button
            type="button"
            onClick={handleDiscardDraft}
            className="text-[11px] font-medium text-[#A33B39] dark:text-[#F5B4B3] hover:underline cursor-pointer"
          >
            Discard Draft
          </button>
        </div>
      )}

      {/* Multi-Step Stepper UX */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-6 rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {stepsMeta.map((s, idx) => {
            const stepNum = idx + 1
            const isCompleted = stepNum < currentStep
            const isCurrent = stepNum === currentStep

            return (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  if (stepNum < currentStep) setCurrentStep(stepNum)
                }}
                disabled={stepNum > currentStep}
                className={`text-left p-3 rounded-[4px] transition-all duration-200 select-none ${
                  isCurrent
                    ? 'bg-[var(--bg-elevated)] dark:bg-[#202B28] border border-[#315B55]/30 dark:border-[#6F9F91]/40'
                    : isCompleted
                    ? 'bg-[var(--bg-base)] dark:bg-[#151C1A] hover:bg-[#EEF1EF] dark:hover:bg-[#202B28] cursor-pointer'
                    : 'opacity-50 cursor-not-allowed bg-transparent'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`w-6 h-6 rounded-full text-[11px] font-medium flex items-center justify-center ${
                      isCompleted
                        ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614]'
                        : isCurrent
                        ? 'bg-[#315B55] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614]'
                        : 'bg-[#EEF1EF] dark:bg-[#202B28] text-[var(--text-primary)]/60 dark:text-[#89938F]'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </span>
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                    Step {stepNum}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] truncate">{s.title}</h4>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Step Form Container */}
      <form onSubmit={handleSubmitCase} className="space-y-8">
        {/* ========================================================================= */}
        {/* STEP 1: Basic Information                                                */}
        {/* ========================================================================= */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <User className="w-5 h-5 text-[var(--green-rich)]" />
                <CardTitle>01 · Basic Patient Information</CardTitle>
              </div>
              <CardDescription>
                Essential demographic credentials required for international hospital admission and visa processing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Patient Full Legal Name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="As shown on international passport"
                  error={errors.patientName}
                  required
                />

                <Input
                  label="Contact Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  error={errors.email}
                  helperText="Hospital coordinators will send quotation notices here."
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Phone / WhatsApp Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7911 123456"
                  helperText="Used for telemedicine coordination."
                  required
                />

                <Select
                  label="Country of Residence"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  options={[
                    { value: 'United Kingdom 🇬🇧', label: 'United Kingdom 🇬🇧' },
                    { value: 'United States 🇺🇸', label: 'United States 🇺🇸' },
                    { value: 'Canada 🇨🇦', label: 'Canada 🇨🇦' },
                    { value: 'Australia 🇦🇺', label: 'Australia 🇦🇺' },
                    { value: 'Germany 🇩🇪', label: 'Germany 🇩🇪' },
                    { value: 'United Arab Emirates 🇦🇪', label: 'United Arab Emirates 🇦🇪' },
                    { value: 'Singapore 🇸🇬', label: 'Singapore 🇸🇬' },
                    { value: 'Other', label: 'Other Country' },
                  ]}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    label="Age"
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 58"
                    error={errors.age}
                    required
                  />
                  <Select
                    label="Gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    options={[
                      { value: 'Female', label: 'Female' },
                      { value: 'Male', label: 'Male' },
                      { value: 'Non-binary', label: 'Non-binary' },
                      { value: 'Prefer not to say', label: 'Other' },
                    ]}
                  />
                </div>
              </div>

              {/* Traveling Companion Option */}
              <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] flex items-start gap-3">
                <input
                  type="checkbox"
                  id="companionCheck"
                  checked={companion}
                  onChange={(e) => setCompanion(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-[var(--text-primary)] focus:ring-[#315B55] cursor-pointer"
                />
                <label htmlFor="companionCheck" className="cursor-pointer select-none text-xs">
                  <span className="font-medium text-[var(--text-primary)] block text-sm">
                    Traveling with a Companion or Caregiver
                  </span>
                  <span className="text-[var(--text-primary)]/70 leading-relaxed block mt-0.5">
                    Hospitals will automatically bundle private companion suites, double-occupancy hotel rooms, and airport transfers for two.
                  </span>
                </label>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Treatment & Destination                                          */}
        {/* ========================================================================= */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <Stethoscope className="w-5 h-5 text-[var(--green-rich)]" />
                <CardTitle>02 · Treatment Target & Travel Parameters</CardTitle>
              </div>
              <CardDescription>
                Define the medical procedure, preferred destination hubs, and surgical budget boundaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Target Treatment or Procedure"
                  value={treatmentId}
                  onChange={(e) => setTreatmentId(e.target.value)}
                  options={TREATMENTS_DATA.map((t) => ({
                    value: t.id,
                    label: `${t.name} (${t.category})`,
                  }))}
                  required
                />

                <Select
                  label="Preferred Medical Tourism Destination"
                  value={destinationId}
                  onChange={(e) => setDestinationId(e.target.value)}
                  options={[
                    { value: 'any', label: 'Worldwide / Any Accredited Center' },
                    ...DESTINATIONS_DATA.map((d) => ({
                      value: d.id,
                      label: `${d.name} ${d.flag} · ${d.specialties?.slice(0, 2).join(', ')}`,
                    })),
                  ]}
                  required
                />
              </div>

              {/* Budget Range Inputs */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Target Surgical & Treatment Budget Range (USD)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Budget Minimum (USD)"
                    type="number"
                    value={budgetMin}
                    onChange={(e) => setBudgetMin(e.target.value)}
                    placeholder="e.g. 5000"
                    leftIcon={<DollarSign className="w-4 h-4 text-[var(--green-rich)]" />}
                  />
                  <Input
                    label="Budget Maximum (USD)"
                    type="number"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    placeholder="e.g. 8500"
                    leftIcon={<DollarSign className="w-4 h-4 text-[var(--green-rich)]" />}
                    error={errors.budget}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-[var(--text-primary)]/60">Quick Preset Ranges:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMin('4000')
                      setBudgetMax('7000')
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EEF1EF] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
                  >
                    $4,000 – $7,000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMin('6000')
                      setBudgetMax('10000')
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EEF1EF] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
                  >
                    $6,000 – $10,000
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBudgetMin('10000')
                      setBudgetMax('18000')
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#EEF1EF] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
                  >
                    $10,000 – $18,000
                  </button>
                </div>
              </div>

              {/* Preferred Date & Flexibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Target Procedure / Travel Date"
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  error={errors.preferredDate}
                  leftIcon={<Calendar className="w-4 h-4 text-[var(--green-rich)]" />}
                  required
                />

                <Select
                  label="Travel Schedule Flexibility"
                  value={flexibility}
                  onChange={(e) => setFlexibility(e.target.value)}
                  options={[
                    { value: 'Flexible within 2-3 weeks', label: 'Flexible within 2-3 weeks (Recommended)' },
                    { value: 'Fixed travel dates', label: 'Fixed travel window only' },
                    { value: 'Immediate / ASAP', label: 'Urgent / Earliest available surgical slot' },
                    { value: 'Next 3-6 months', label: 'Elective / Next 3–6 months' },
                  ]}
                />
              </div>

              {/* Treatment Overview Micro-Card */}
              {selectedTreatment && (
                <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-medium text-[var(--text-primary)] text-sm">{selectedTreatment.name}</span>
                    <p className="text-[var(--text-primary)]/70">Typical Duration: {selectedTreatment.typicalStay || '5-7 days hospital stay'}</p>
                  </div>
                  <Badge variant="sage">{selectedTreatment.category}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Medical Information                                              */}
        {/* ========================================================================= */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <FileText className="w-5 h-5 text-[var(--green-rich)]" />
                <CardTitle>03 · Clinical History & Diagnostic Scans</CardTitle>
              </div>
              <CardDescription>
                Provide detailed symptoms, previous treatments, and upload diagnostic records for hospital evaluation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Medical History */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-[var(--text-primary)]">
                    Primary Medical History & Symptoms <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-primary)]/50 font-mono">
                    {medicalHistory.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  className={`w-full bg-white text-sm text-[var(--text-primary)] border rounded-[3px] p-3.5 outline-none transition-colors leading-relaxed ${
                    errors.medicalHistory
                      ? 'border-red-400 focus:border-red-500'
                      : 'border-[var(--border-default)] focus:border-[#315B55]'
                  }`}
                  placeholder="Detail your condition: symptoms, mobility impairment, previous treatments, surgeries, chronic medical conditions (diabetes, hypertension), and current medications..."
                />
                {errors.medicalHistory && (
                  <p className="text-xs text-red-500">{errors.medicalHistory}</p>
                )}
              </div>

              {/* Patient Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[var(--text-primary)]">
                  Patient Notes & Special Accommodations
                </label>
                <textarea
                  rows={3}
                  value={patientNotes}
                  onChange={(e) => setPatientNotes(e.target.value)}
                  className="w-full bg-white text-sm text-[var(--text-primary)] border border-[var(--border-default)] rounded-[3px] p-3.5 outline-none focus:border-[#315B55] transition-colors leading-relaxed"
                  placeholder="E.g., wheelchair assistance at airport, dietary preferences, questions for chief surgeon, companion room requests..."
                />
              </div>

              {/* Diagnostic Records Uploader */}
              <div className="pt-2">
                <FileUploader
                  files={files}
                  onFilesChange={setFiles}
                  label="Diagnostic Scans & Pathology Reports"
                  helperText="Upload DICOM MRI/CT, full-leg radiographs, blood chemistry panels, or physician referral letters. Max 30MB each."
                />
              </div>

              <div className="p-3.5 bg-[var(--bg-elevated)] rounded-[4px] border border-[var(--border-default)] flex items-center justify-between text-xs text-[var(--text-primary)]">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--green-rich)] shrink-0" />
                  <span>Sovereign Storage: Diagnostic files are zero-knowledge encrypted</span>
                </span>
                <span className="font-medium text-[var(--green-rich)]">
                  {files.length} {files.length === 1 ? 'file' : 'files'} attached
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: Review & Submit                                                  */}
        {/* ========================================================================= */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-[var(--text-primary)]">
                  <CheckCircle2 className="w-5 h-5 text-[var(--green-rich)]" />
                  <CardTitle>04 · Review Medical Case Dossier</CardTitle>
                </div>
                <CardDescription>
                  Verify your medical case parameters before registering it with the EthAum international network.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Section 1: Patient Information Review */}
                <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)] flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> 01 Basic Information
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-medium text-[var(--text-primary)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Patient Name</span>
                      <strong className="text-sm text-[var(--text-primary)]">{patientName}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Contact Email</span>
                      <strong className="text-sm text-[var(--text-primary)]">{email}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Phone</span>
                      <strong className="text-sm text-[var(--text-primary)]">{phone}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Demographics</span>
                      <strong className="text-sm text-[var(--text-primary)]">
                        {age} yrs · {gender} · {country}
                      </strong>
                    </div>
                  </div>
                  {companion && (
                    <div className="pt-2 border-t border-[var(--border-default)] text-xs text-[var(--green-rich)] flex items-center gap-1.5 font-medium">
                      <Heart className="w-3.5 h-3.5" /> Companion / Caregiver Accommodation Requested
                    </div>
                  )}
                </div>

                {/* Section 2: Treatment & Destination Review */}
                <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)] flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> 02 Treatment & Destination
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-medium text-[var(--text-primary)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Procedure</span>
                      <strong className="text-sm text-[var(--text-primary)]">{selectedTreatment?.name || treatmentId}</strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Destination</span>
                      <strong className="text-sm text-[var(--text-primary)]">
                        {selectedDest ? `${selectedDest.name} ${selectedDest.flag}` : 'Worldwide'}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Target Budget</span>
                      <strong className="text-sm text-[var(--text-primary)]">
                        ${Number(budgetMin).toLocaleString()} – ${Number(budgetMax).toLocaleString()} USD
                      </strong>
                    </div>
                    <div>
                      <span className="text-[var(--text-primary)]/50 block">Preferred Date</span>
                      <strong className="text-sm text-[var(--text-primary)]">{preferredDate}</strong>
                    </div>
                  </div>
                </div>

                {/* Section 3: Medical Information & Scans Review */}
                <div className="p-4 bg-[var(--bg-base)] rounded-[4px] border border-[var(--border-hairline)] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)] flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> 03 Clinical History & Scans
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-xs font-medium text-[var(--text-primary)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[var(--text-primary)]/50 block font-medium">Medical History:</span>
                      <p className="text-[var(--text-primary)] leading-relaxed mt-0.5">{medicalHistory}</p>
                    </div>
                    {patientNotes && (
                      <div className="pt-2 border-t border-[var(--border-default)]">
                        <span className="text-[var(--text-primary)]/50 block font-medium">Patient Notes:</span>
                        <p className="text-[var(--text-primary)] leading-relaxed mt-0.5">{patientNotes}</p>
                      </div>
                    )}
                    <div className="pt-2 border-t border-[var(--border-default)]">
                      <span className="text-[var(--text-primary)]/50 block font-medium mb-1">
                        Attached Diagnostic Records ({files.length}):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {files.map((f, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-[var(--border-default)] rounded-lg text-xs font-mono text-[var(--text-primary)]"
                          >
                            <FileText className="w-3 h-3 text-[var(--green-rich)]" />
                            {f.name} ({f.size || 'Scan'})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient Sovereign Consent Notice */}
                <div className="p-4 bg-[var(--bg-elevated)] rounded-[4px] border border-[var(--border-default)] flex items-start gap-3 text-xs text-[var(--text-primary)]">
                  <ShieldCheck className="w-5 h-5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium">Sovereign Patient Consent & Data Protection</p>
                    <p className="text-[var(--text-primary)]/80 leading-relaxed">
                      By registering this Medical Case, you authorize EthAum to transmit your anonymized dossier to accredited partner hospitals to produce transparent institutional package quotes. You retain granular control to revoke or permission scan visibility at any time.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stepper Controls Bar */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleBack}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Back
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
          )}

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={handleSaveDraft}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Draft
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleContinue}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Step {currentStep + 1}
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Submit Case
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateCasePage
