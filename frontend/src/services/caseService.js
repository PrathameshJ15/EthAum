/**
 * EthAum Medical Case Service
 * Manages Sovereign Medical Cases, Drafts, Diagnostic Record Permissions, and Journey Progression
 * Integrated with Node.js REST API & Supabase Backend
 */

import apiClient from './apiClient.js'

export const JOURNEY_STAGES = [
  { id: 'DRAFT', number: '01', title: 'Draft Intake', shortDesc: 'Dossier initialized & intake registered' },
  { id: 'RECORDS', number: '02', title: 'Diagnostic Records', shortDesc: 'Diagnostic scans & pathology uploaded' },
  { id: 'QUALIFICATION', number: '03', title: 'Clinical Qualification', shortDesc: 'Eligibility & pre-procedure review' },
  { id: 'MATCHING', number: '04', title: 'Provider Matching', shortDesc: 'JCI/NABH accredited centers screened' },
  { id: 'QUOTES', number: '05', title: 'Institutional Quotes', shortDesc: 'Transparent institutional pricing packages' },
  { id: 'PROVIDER', number: '06', title: 'Provider Selected', shortDesc: 'Center confirmed by patient' },
  { id: 'CONSULTATION', number: '07', title: 'Consultation', shortDesc: 'Pre-travel video call with lead surgeon' },
  { id: 'BOOKED', number: '08', title: 'Treatment Booked', shortDesc: 'Admission date & travel logistics confirmed' },
  { id: 'TREATMENT', number: '09', title: 'Inpatient Treatment', shortDesc: 'Hospital admission, procedure & acute care' },
  { id: 'AFTERCARE', number: '10', title: 'Aftercare & Recovery', shortDesc: 'Follow-up timeline, physio & recovery tracking' },
  { id: 'COMPLETED', number: '11', title: 'Care Completed', shortDesc: 'Full recovery achieved & dossier archived' },
]

export const DEFAULT_CASES = [
  {
    id: 'ET-8492',
    patientName: 'Eleanor Vance',
    email: 'patient@ethaum.com',
    phone: '+44 7911 123456',
    country: 'United Kingdom 🇬🇧',
    age: 58,
    gender: 'Female',
    companion: true,
    treatmentId: 'knee-replacement',
    treatmentName: 'Total Knee Replacement (Robotic Mako/Rosa)',
    destinationId: 'india',
    destinationName: 'New Delhi, India 🇮🇳',
    alternativeDestinations: ['Bangkok, Thailand 🇹🇭', 'Istanbul, Turkey 🇹🇷'],
    budgetMin: 5500,
    budgetMax: 8500,
    currency: 'USD',
    preferredDate: '2026-11-15',
    flexibility: 'Flexible within 2-3 weeks',
    status: 'CONSULTATION',
    journeyStage: 'Consultation',
    providerName: 'Apex Joint Institute (Apollo Health City)',
    providerStatus: 'Apex Joint Institute · Dr. Vikram Oberoi (Confirmed Match)',
    nextAppointment: {
      title: 'Pre-Surgical Video Consultation',
      doctor: 'Dr. Vikram Oberoi',
      specialty: 'Director of Robotic Joint Reconstruction',
      hospital: 'Apex Joint Institute (Apollo Health City)',
      dateTime: '2026-10-14T14:30:00Z',
      displayDate: 'October 14, 2026 at 14:30 UTC (20:00 IST)',
      meetingLink: 'https://meet.ethaum.health/room/ET-8492-SURG',
      type: 'Telemedicine Video Session',
      status: 'Confirmed',
    },
    medicalHistory:
      'Patient reports chronic bilateral knee pain, predominantly right-side over 4 years. Weight-bearing radiograph confirms severe medial joint space obliteration (Grade IV Kellgren-Lawrence). Conservative physical therapy and corticosteroid injections over past 14 months yielded no functional improvement. No history of cardiovascular conditions. Mild hypertension well-managed with Lisinopril 10mg daily. Non-smoker, no known drug allergies.',
    patientNotes:
      'Requires private room accommodating traveling spouse. Interested in cruciate-retaining implant (ceramic-on-polyethylene) and rapid-recovery inpatient rehabilitation. Needs wheelchair assistance at Delhi (DEL) international airport arrival.',
    createdAt: '2026-09-18T10:15:00Z',
    records: [
      {
        id: 'rec-1',
        name: 'Right_Knee_Coronal_MRI_HighRes.pdf',
        category: 'MRI',
        type: 'DICOM MRI Scan',
        size: '14.2 MB',
        date: '2026-09-12',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Grade IV medial joint space collapse, intact cruciate ligaments.',
        permissions: ['apex-joint-delhi', 'horizon-bangkok'],
      },
      {
        id: 'rec-2',
        name: 'Weight_Bearing_Bilateral_XRay_AP.jpg',
        category: 'X-Ray',
        type: 'Full Leg Radiograph',
        size: '3.8 MB',
        date: '2026-09-14',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Severe varus deformity (7° mechanical axis deviation).',
        permissions: ['apex-joint-delhi', 'horizon-bangkok'],
      },
      {
        id: 'rec-3',
        name: 'Knee_3D_Robotic_CT_Reconstruction.dcm',
        category: 'CT Scan',
        type: '3D Volume Rendering',
        size: '22.4 MB',
        date: '2026-09-15',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Subchondral bone mineral density mapping complete for robotic cuts.',
        permissions: ['apex-joint-delhi'],
      },
      {
        id: 'rec-4',
        name: 'Comprehensive_Metabolic_CBC_Panel.pdf',
        category: 'Blood Report',
        type: 'Laboratory Pathology',
        size: '1.2 MB',
        date: '2026-09-16',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Normal renal panel; HbA1c 5.8% (optimal for joint surgery).',
        permissions: ['apex-joint-delhi'],
      },
      {
        id: 'rec-5',
        name: 'Pain_Management_Prescription.pdf',
        category: 'Prescriptions',
        type: 'Medication Schedule',
        size: '0.6 MB',
        date: '2026-09-08',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Current medication: Lisinopril 10mg, Celecoxib 200mg daily.',
        permissions: ['apex-joint-delhi'],
      },
      {
        id: 'rec-6',
        name: 'Previous_Arthroscopy_Surgical_History.pdf',
        category: 'Medical History',
        type: 'Surgical Record',
        size: '1.5 MB',
        date: '2026-08-20',
        status: 'Verified',
        aiStatus: 'Organized',
        aiSummary: 'Diagnostic arthroscopy 3 years prior showed early osteochondral defect.',
        permissions: ['apex-joint-delhi'],
      },
    ],
    recordPermissions: {
      'apex-joint-delhi': {
        name: 'Apex Joint Institute (Apollo Health City, New Delhi)',
        location: 'New Delhi, India 🇮🇳',
        accreditation: 'JCI & NABH Accredited',
        leadDoctor: 'Dr. Vikram Oberoi',
        status: 'Access Granted',
        rec_1: true,
        rec_2: true,
        rec_3: true,
        rec_4: true,
        rec_5: true,
        rec_6: true,
      },
      'horizon-bangkok': {
        name: 'Horizon Medical City (Bangkok)',
        location: 'Bangkok, Thailand 🇹🇭',
        accreditation: 'JCI Accredited',
        leadDoctor: 'Dr. Somchai Prasert',
        status: 'Partial Access',
        rec_1: true,
        rec_2: true,
        rec_3: false,
        rec_4: false,
        rec_5: false,
        rec_6: false,
      },
      'istanbul-ortho': {
        name: 'Istanbul International Orthopedics Hospital',
        location: 'Istanbul, Turkey 🇹🇷',
        accreditation: 'JCI & ISO 9001 Accredited',
        leadDoctor: 'Dr. Emre Yilmaz',
        status: 'Access Revoked',
        rec_1: false,
        rec_2: false,
        rec_3: false,
        rec_4: false,
        rec_5: false,
        rec_6: false,
      },
    },
    accessLogs: [
      {
        id: 'log-1',
        accessor: 'Dr. Vikram Oberoi (Lead Surgeon)',
        provider: 'Apex Joint Institute',
        recordName: 'Right_Knee_Coronal_MRI_HighRes.pdf',
        category: 'MRI',
        timestamp: 'Today, 09:14 AM EST',
        purpose: 'Robotic alignment & implant sizing',
      },
      {
        id: 'log-2',
        accessor: 'Clinical Coordinator Desk',
        provider: 'Horizon Medical City',
        recordName: 'Weight_Bearing_Bilateral_XRay_AP.jpg',
        category: 'X-Ray',
        timestamp: 'Yesterday, 04:22 PM EST',
        purpose: 'Package quotation calculation',
      },
    ],
    quotes: [
      {
        id: 'quote-apex-1',
        providerId: 'apex-joint-delhi',
        providerName: 'Apex Joint Institute',
        hospitalName: 'Apollo Health City Campus',
        city: 'New Delhi',
        country: 'India 🇮🇳',
        accreditation: 'JCI & NABH Accredited',
        price: 6500,
        currency: 'USD',
        isRecommended: true,
        surgeonName: 'Dr. Vikram Oberoi',
        procedureType: 'Robotic Mako Total Knee Arthroplasty',
        stayDuration: '4 Nights Inpatient + 6 Nights Hotel Recovery',
        inclusions: [
          'Pre-operative anesthesia and diagnostic workup',
          'Robotic Mako arm surgical execution',
          'Premium Stryker Triathlon cruciate-retaining implant with 25-yr warranty',
          '4 nights private suite with companion sleeper bed',
          'Inpatient physical therapy & gait re-education',
          'Airport chauffeur transfers (DEL Airport ⇄ Hospital)',
          'Dedicated international patient relations officer',
        ],
        exclusions: ['International flights', 'Incidental travel expenses outside package'],
        status: 'OFFERED',
      },
    ],
    aiSummary: {
      clinicalCondition:
        'Advanced tricompartmental osteoarthritis of right knee with profound medial compartment bone-on-bone collapse (Grade IV). No inflammatory arthropathy markers.',
      anesthesiaRisk: 'Low risk (ASA Class II due to mild controlled hypertension). Pre-op 12-lead ECG and HbA1c required.',
      surgicalRecommendations:
        'Candidate for robotic-assisted cruciate-retaining total knee arthroplasty. Preserves native posterior cruciate ligament for enhanced proprioception.',
      missingInformation: ['Recent 12-lead Electrocardiogram (ECG)', 'HbA1c Blood Panel within 90 days'],
    },
    aftercarePlan: {
      leadTherapist: 'Meera Rao, MPT (Orthopedics)',
      timeline: [
        { day: 'Day 1 Post-Op', task: 'Assisted weight-bearing mobilization with walker', completed: false },
        { day: 'Day 3 Post-Op', task: 'Independent stairs ascent & 90° knee flexion', completed: false },
        { day: 'Week 2', task: 'Virtual wound inspection & staple check via EthAum telemedicine', completed: false },
        { day: 'Week 6', task: 'Full functional recovery evaluation & return to light sports', completed: false },
      ],
    },
  },
]

const CASES_STORAGE_KEY = 'ethaum_medical_cases_v1'
const DRAFT_STORAGE_KEY = 'ethaum_case_draft_v1'

function getStoredCases() {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (err) {
    console.warn('Could not read stored cases from localStorage:', err)
  }
  return DEFAULT_CASES
}

function persistCases(cases) {
  try {
    localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases))
  } catch (err) {
    console.warn('Could not write cases to localStorage:', err)
  }
}

export const caseService = {
  /**
   * Retrieves currently cached cases synchronously for instant UI initialization
   */
  getAllCasesSync() {
    return getStoredCases()
  },

  /**
   * Retrieves single case synchronously from local cache
   */
  getCaseByIdSync(id) {
    const all = getStoredCases()
    const found = all.find((c) => c.id.toLowerCase() === (id || '').toLowerCase())
    return found || all[0] || DEFAULT_CASES[0]
  },

  /**
   * Retrieves all medical cases from API or local storage
   */
  async getAllCases() {
    try {
      const apiCases = await apiClient.get('/cases')
      if (Array.isArray(apiCases) && apiCases.length > 0) {
        // Enhance with UI defaults for quotes, aftercare plan, etc.
        const merged = apiCases.map((c) => {
          const matchDefault = DEFAULT_CASES.find((d) => d.id === c.id) || DEFAULT_CASES[0]
          return {
            ...matchDefault,
            ...c,
            journeyStage: c.journeyStage || matchDefault.journeyStage,
            status: c.status || matchDefault.status,
          }
        })
        persistCases(merged)
        return merged
      }
    } catch (err) {
      console.warn('[caseService] API listCases fallback:', err.message)
    }

    return getStoredCases()
  },

  /**
   * Retrieves a single case by ID
   */
  async getCaseById(id) {
    try {
      const c = await apiClient.get(`/cases/${id}`)
      if (c && c.id) {
        const matchDefault = DEFAULT_CASES.find((d) => d.id === c.id) || DEFAULT_CASES[0]
        return {
          ...matchDefault,
          ...c,
        }
      }
    } catch (err) {
      console.warn(`[caseService] API getCaseById fallback for ${id}:`, err.message)
    }

    const all = getStoredCases()
    const found = all.find((c) => c.id.toLowerCase() === (id || '').toLowerCase())
    return found || all[0] || DEFAULT_CASES[0]
  },

  /**
   * Creates a new medical case from submission
   */
  async createCase(formData) {
    const all = getStoredCases()

    try {
      const created = await apiClient.post('/cases', {
        patientId: formData.patientId || 'pat-1',
        patientName: formData.patientName || 'Eleanor Vance',
        treatmentId: formData.treatmentId || 'knee-replacement',
        treatmentName: formData.treatmentName || 'Total Knee Replacement',
        destinationId: formData.destinationId || 'india',
        destinationName: formData.destinationName || 'New Delhi, India',
        budgetMin: Number(formData.budgetMin) || 5000,
        budgetMax: Number(formData.budgetMax) || 8000,
        currency: formData.currency || 'USD',
        preferredDate: formData.preferredDate || '2026-11-20',
        medicalHistory: formData.medicalHistory || 'Clinical case initialized for orthopedic assessment.',
        patientNotes: formData.patientNotes || '',
      })

      if (created && created.id) {
        const fullCase = {
          ...DEFAULT_CASES[0],
          ...formData,
          ...created,
          records: created.records || DEFAULT_CASES[0].records,
        }
        persistCases([fullCase, ...all])
        this.clearDraft()
        return fullCase
      }
    } catch (err) {
      console.warn('[caseService] API createCase fallback:', err.message)
    }

    // Local fallback creation
    const newId = `ET-${Math.floor(1000 + Math.random() * 9000)}`
    const newCase = {
      ...DEFAULT_CASES[0],
      ...formData,
      id: newId,
      status: 'DRAFT',
      journeyStage: 'Case Created',
      createdAt: new Date().toISOString(),
    }

    const updated = [newCase, ...all]
    persistCases(updated)
    this.clearDraft()
    return newCase
  },

  /**
   * Save a case draft for later continuation
   */
  saveDraft(draftData) {
    try {
      localStorage.setItem(
        DRAFT_STORAGE_KEY,
        JSON.stringify({
          data: draftData,
          updatedAt: new Date().toISOString(),
        })
      )
      return true
    } catch {
      return false
    }
  },

  getDraft() {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (raw) return JSON.parse(raw)
    } catch {
      // ignore
    }
    return null
  },

  clearDraft() {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch {
      // ignore
    }
  },

  /**
   * Update Journey Stage and sync with backend API
   */
  async updateCaseStage(caseId, stageId) {
    const stageToStatusMap = {
      'DRAFT': 'DRAFT',
      'Created': 'DRAFT',
      'RECORDS': 'RECORDS',
      'Records': 'RECORDS',
      'QUALIFICATION': 'QUALIFICATION',
      'AI': 'QUALIFICATION',
      'MATCHING': 'MATCHING',
      'Matching': 'MATCHING',
      'QUOTES': 'QUOTES',
      'Quotes': 'QUOTES',
      'PROVIDER': 'PROVIDER',
      'Provider Selected': 'PROVIDER',
      'CONSULTATION': 'CONSULTATION',
      'Consultation': 'CONSULTATION',
      'BOOKED': 'BOOKED',
      'Booked': 'BOOKED',
      'TREATMENT': 'TREATMENT',
      'Treatment': 'TREATMENT',
      'AFTERCARE': 'AFTERCARE',
      'Aftercare': 'AFTERCARE',
      'COMPLETED': 'COMPLETED',
      'Completed': 'COMPLETED',
    }

    const backendStatus = stageToStatusMap[stageId] || 'DRAFT'

    try {
      await apiClient.patch(`/cases/${caseId}/status`, { status: backendStatus })
    } catch (err) {
      console.warn('[caseService] API updateCaseStage fallback:', err.message)
    }

    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index !== -1) {
      all[index].journeyStage = stageId
      all[index].status = backendStatus
      persistCases(all)
      return all[index]
    }
    return null
  },

  /**
   * Toggle record permissions for a provider
   */
  toggleRecordPermission(caseId, hospitalKey, recordKey) {
    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    if (!all[index].recordPermissions[hospitalKey]) {
      all[index].recordPermissions[hospitalKey] = {}
    }
    const current = Boolean(all[index].recordPermissions[hospitalKey][recordKey])
    all[index].recordPermissions[hospitalKey][recordKey] = !current

    persistCases(all)
    return all[index]
  },

  /**
   * Accept an institutional quote
   */
  async acceptQuote(caseId, quoteId) {
    try {
      await apiClient.post(`/quotes/${quoteId}/accept`)
    } catch (err) {
      console.warn('[caseService] API acceptQuote error, proceeding with local update:', err.message)
    }

    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    all[index].quotes = (all[index].quotes || []).map((q) => ({
      ...q,
      status: q.id === quoteId ? 'ACCEPTED' : 'DECLINED',
    }))
    all[index].journeyStage = 'Provider Selected'
    all[index].status = 'PROVIDER_SELECTED'
    persistCases(all)
    return all[index]
  },

  /**
   * Add a new diagnostic record to a case
   */
  addRecord(caseId, recordData) {
    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    const newRec = {
      id: `rec-${Date.now()}`,
      name: recordData.name || 'Diagnostic_Document.pdf',
      category: recordData.category || 'MRI',
      type: recordData.type || 'Clinical Document',
      size: recordData.size || '3.5 MB',
      date: new Date().toISOString().split('T')[0],
      status: 'Verified',
      aiStatus: 'Organized',
      aiSummary: recordData.aiSummary || 'Document verified & indexed into clinical dossier.',
      permissions: ['apex-joint-delhi'],
    }

    if (!all[index].records) all[index].records = []
    all[index].records = [newRec, ...all[index].records]

    persistCases(all)
    return { record: newRec, updatedCase: all[index] }
  },

  deleteRecord(caseId, recordId) {
    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    all[index].records = (all[index].records || []).filter((r) => r.id !== recordId)
    persistCases(all)
    return all[index]
  },

  grantProviderAccess(caseId, providerId) {
    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    if (!all[index].recordPermissions) all[index].recordPermissions = {}
    if (!all[index].recordPermissions[providerId]) {
      all[index].recordPermissions[providerId] = {
        name: providerId,
        location: 'International Partner',
        accreditation: 'JCI Accredited',
        leadDoctor: 'Attending Specialist',
      }
    }
    all[index].recordPermissions[providerId].status = 'Access Granted'
    for (let i = 1; i <= 20; i++) {
      all[index].recordPermissions[providerId][`rec_${i}`] = true
    }
    persistCases(all)
    return all[index]
  },

  revokeProviderAccess(caseId, providerId) {
    const all = getStoredCases()
    const index = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
    if (index === -1) return null

    if (all[index].recordPermissions && all[index].recordPermissions[providerId]) {
      all[index].recordPermissions[providerId].status = 'Access Revoked'
      for (let i = 1; i <= 20; i++) {
        all[index].recordPermissions[providerId][`rec_${i}`] = false
      }
    }
    persistCases(all)
    return all[index]
  },

  /**
   * AI-Assisted Case Coordination Summary API integration
   */
  async generateCaseSummary(caseId) {
    try {
      const res = await apiClient.post(`/cases/${caseId}/summary/generate`)
      if (res?.data) {
        const all = getStoredCases()
        const idx = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
        if (idx !== -1) {
          all[idx].coordinationSummary = res.data.summary
          all[idx].summaryCorrections = res.data.corrections || []
          persistCases(all)
        }
        return res.data
      }
    } catch (err) {
      console.warn('[caseService] generateCaseSummary backend error:', err.message)
      throw err
    }
  },

  async getCaseSummary(caseId) {
    try {
      const res = await apiClient.get(`/cases/${caseId}/summary`)
      return res?.data || null
    } catch (err) {
      console.warn('[caseService] getCaseSummary fallback to local store:', err.message)
      const c = this.getCaseByIdSync(caseId)
      return {
        summary: c?.coordinationSummary || null,
        corrections: c?.summaryCorrections || [],
      }
    }
  },

  async submitCorrection(caseId, correctionData) {
    try {
      const res = await apiClient.post(`/cases/${caseId}/summary/corrections`, correctionData)
      if (res?.data) {
        const all = getStoredCases()
        const idx = all.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase())
        if (idx !== -1) {
          if (!all[idx].summaryCorrections) all[idx].summaryCorrections = []
          all[idx].summaryCorrections.push(res.data.correction)
          if (res.data.summary) {
            all[idx].coordinationSummary = res.data.summary
          }
          persistCases(all)
        }
        return res.data
      }
    } catch (err) {
      console.warn('[caseService] submitCorrection backend error:', err.message)
      throw err
    }
  },

  async getCaseProviderMatches(caseId, options = {}) {
    try {
      const params = {}
      if (options.destination) params.destination = options.destination
      if (options.maxResults) params.maxResults = options.maxResults
      const res = await apiClient.get(`/cases/${caseId}/matches`, { params })
      if (res?.data) return res.data
      if (res?.matches) return res
    } catch (err) {
      console.warn(`[caseService] getCaseProviderMatches error:`, err.message)
    }
    return {
      caseId,
      matches: [],
      disclaimer:
        'Provider relevance explanations are for coordination and informational purposes and do not constitute a clinical endorsement or guarantee of care.',
      evaluatedCount: 0,
    }
  },
}

export default caseService
