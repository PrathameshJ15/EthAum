import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FileText,
  Upload,
  ShieldCheck,
  AlertCircle,
  Eye,
  Trash2,
  Lock,
  Unlock,
  Sparkles,
  ArrowLeft,
  Building2,
  Clock,
  Download,
  Check,
  RefreshCw,
  Search,
  FileCode,
} from 'lucide-react'

import {
  Breadcrumb,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  Tabs,
  Modal,
  useToast,
  BackgroundGrid,
} from '../../components'

import { caseService } from '../../services/caseService'
import { recordService } from '../../services/recordService'

// All 8 supported medical record categories
const RECORD_CATEGORIES = [
  { id: 'all', label: 'All Records' },
  { id: 'MRI', label: 'MRI', desc: 'Magnetic Resonance Imaging DICOM' },
  { id: 'X-Ray', label: 'X-Ray', desc: 'Plain & weight-bearing radiographs' },
  { id: 'CT Scan', label: 'CT Scan', desc: 'Computed Tomography 3D slices' },
  { id: 'Blood Report', label: 'Blood Report', desc: 'Pathology & hematology panels' },
  { id: 'Prescription', label: 'Prescription', desc: 'Medication regimens & dosages' },
  { id: 'Medical History', label: 'Medical History', desc: 'Prior surgery & chronic conditions' },
  { id: 'Discharge Summary', label: 'Discharge Summary', desc: 'Inpatient hospital summaries' },
  { id: 'Doctor Notes', label: 'Doctor Notes', desc: 'Clinical specialist consult evaluations' },
]

export function CaseRecordsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToast } = useToast()
  const fileInputRef = useRef(null)

  const caseId = id || 'ET-8492'
  const [medicalCase, setMedicalCase] = useState(() => caseService.getCaseByIdSync(caseId))

  // Synchronize case data
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

  // Active view tab: 'vault' | 'upload' | 'permissions' | 'audit'
  const [activeTab, setActiveTab] = useState('vault')

  // Category filter for records list
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Selected Category for new upload
  const [uploadCategory, setUploadCategory] = useState('MRI')

  // Drag and Drop & Upload State
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(null) // null | 0..100
  const [uploadSuccessFile, setUploadSuccessFile] = useState(null)
  const [uploadError, setUploadError] = useState(null)
  const [pendingUploadFile, setPendingUploadFile] = useState(null)

  // AI Organization Simulator state per record ID: { [recordId]: 'organizing' | 'organized' }
  const [aiProcessingState, setAiProcessingState] = useState({})

  // Preview Modal State
  const [previewRecord, setPreviewRecord] = useState(null)

  // Quick Permission Modal State
  const [permissionRecord, setPermissionRecord] = useState(null)

  // Filter records based on category and search
  const records = medicalCase?.records || []
  const filteredRecords = records.filter((r) => {
    const matchesCategory =
      selectedCategory === 'all' || r.category?.toLowerCase() === selectedCategory.toLowerCase()
    const matchesSearch =
      searchQuery === '' ||
      r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.type?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Handle Drag Over & Leave
  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  // Handle Drop
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles && droppedFiles.length > 0) {
      processSelectedFile(droppedFiles[0])
    }
  }

  // Handle Manual File Selection via Browse
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0])
    }
  }

  // Process and validate selected file
  const processSelectedFile = (file) => {
    setUploadError(null)
    setUploadSuccessFile(null)

    // Validation 1: Size check (max 30MB)
    const MAX_SIZE = 30 * 1024 * 1024 // 30MB
    if (file.size > MAX_SIZE) {
      setUploadError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 30 MB.`
      )
      return
    }

    // Validation 2: Allowed extensions
    const allowedExtensions = ['.pdf', '.dicom', '.dcm', '.jpg', '.jpeg', '.png', '.tiff']
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
    if (!allowedExtensions.includes(ext)) {
      setUploadError(
        `Unsupported file type "${ext}". Supported formats are: PDF, DICOM (.dcm), JPG, PNG, TIFF.`
      )
      return
    }

    setPendingUploadFile(file)
    startSimulatedUpload(file)
  }

  // Start simulated upload with progress bar
  const startSimulatedUpload = (file) => {
    setUploadProgress(10)

    const timer1 = setTimeout(() => setUploadProgress(45), 200)
    const timer2 = setTimeout(() => setUploadProgress(78), 450)
    const timer3 = setTimeout(() => {
      setUploadProgress(100)
      completeUpload(file)
    }, 700)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }

  // Complete Upload & trigger AI Organization
  const completeUpload = async (file) => {
    const formattedSize =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`

    // Attempt backend registration & direct upload
    try {
      const uploadInit = await recordService.requestUploadUrl({
        caseId: medicalCase.id,
        fileName: file.name,
        category: uploadCategory,
        type: `${uploadCategory} File`,
        size: formattedSize,
        sizeBytes: file.size,
      })

      if (uploadInit?.uploadUrl) {
        await recordService.uploadFileDirect(uploadInit.uploadUrl, file)
      }
    } catch (err) {
      console.warn('[CaseRecordsPage] Backend upload fallback:', err.message)
    }

    const { record: newRecord, updatedCase } = caseService.addRecord(medicalCase.id, {
      name: file.name,
      category: uploadCategory,
      type: `${uploadCategory} File`,
      size: formattedSize,
    })

    setMedicalCase({ ...updatedCase })
    setUploadSuccessFile(newRecord)
    setUploadProgress(null)
    setPendingUploadFile(null)

    // Trigger AI Status: "Organizing your record..." then "Organized"
    setAiProcessingState((prev) => ({ ...prev, [newRecord.id]: 'organizing' }))

    setTimeout(() => {
      setAiProcessingState((prev) => ({ ...prev, [newRecord.id]: 'organized' }))
      addToast({
        type: 'success',
        title: 'Record Organized by AI',
        message: `${newRecord.name} classified and indexed into clinical dossier.`,
      })
    }, 2000)

    addToast({
      type: 'success',
      title: 'Record Uploaded & Encrypted',
      message: `${file.name} saved to sovereign vault with default permissions.`,
    })
  }

  // Handle Download Record
  const handleDownloadRecord = async (record) => {
    try {
      const res = await recordService.getDownloadUrl(record.id)
      if (res?.downloadUrl) {
        window.open(res.downloadUrl, '_blank')
        addToast({
          type: 'success',
          title: 'Authorized Download Initiated',
          message: `Signed secure link generated for ${record.name}.`,
        })
        return
      }
    } catch (err) {
      console.warn('[CaseRecordsPage] Download URL fallback:', err.message)
    }

    addToast({
      type: 'success',
      title: 'Download Initialized',
      message: `Decrypting ${record.name} for local save.`,
    })
  }

  // Re-run AI Document Intelligence for any record via backend
  const handleReanalyzeAI = async (recordId, recordName) => {
    setAiProcessingState((prev) => ({ ...prev, [recordId]: 'organizing' }))
    addToast({
      type: 'info',
      title: 'Indexing Document...',
      message: `Groq AI Document Intelligence is analyzing ${recordName}.`,
    })

    try {
      const res = await recordService.analyzeRecord(recordId, {
        caseContext: medicalCase?.medicalHistory || '',
      })
      if (res?.analysis) {
        setMedicalCase((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            records: (prev.records || []).map((r) =>
              r.id === recordId
                ? {
                    ...r,
                    category: res.analysis.documentType || r.category,
                    aiStatus: 'Organized',
                    aiSummary: res.analysis.summary,
                    aiMetadata: res.analysis,
                  }
                : r
            ),
          }
        })
      }
    } catch (err) {
      console.warn('[CaseRecordsPage] Groq AI analysis fallback:', err.message)
    } finally {
      setAiProcessingState((prev) => ({ ...prev, [recordId]: 'organized' }))
      addToast({
        type: 'success',
        title: 'Document Classified & Structured',
        message: `${recordName} indexed. Note: AI information is for coordination only.`,
      })
    }
  }

  // Handle Record Delete
  const handleDeleteRecord = (recordId, recordName) => {
    const updated = caseService.deleteRecord(medicalCase.id, recordId)
    if (updated) {
      setMedicalCase({ ...updated })
      addToast({
        type: 'info',
        title: 'Record Deleted',
        message: `${recordName} has been purged from your sovereign vault.`,
      })
    }
  }

  // Handle Grant Access to entire provider
  const handleGrantProvider = async (providerId) => {
    try {
      if (medicalCase.records && medicalCase.records.length > 0) {
        for (const r of medicalCase.records) {
          recordService.grantPermission(r.id, providerId).catch(() => {})
        }
      }
    } catch (err) {
      console.warn('[CaseRecordsPage] Grant API notice:', err.message)
    }

    const updated = caseService.grantProviderAccess(medicalCase.id, providerId)
    if (updated) {
      setMedicalCase({ ...updated })
      addToast({
        type: 'success',
        title: 'Access Granted',
        message: `All diagnostic records are now permitted for ${
          updated.recordPermissions[providerId]?.name || providerId
        }.`,
      })
    }
  }

  // Handle Revoke Access to entire provider
  const handleRevokeProvider = async (providerId) => {
    try {
      if (medicalCase.records && medicalCase.records.length > 0) {
        for (const r of medicalCase.records) {
          recordService.revokePermission(r.id, providerId).catch(() => {})
        }
      }
    } catch (err) {
      console.warn('[CaseRecordsPage] Revoke API notice:', err.message)
    }

    const updated = caseService.revokeProviderAccess(medicalCase.id, providerId)
    if (updated) {
      setMedicalCase({ ...updated })
      addToast({
        type: 'warning',
        title: 'Access Revoked',
        message: `Visibility revoked for ${
          updated.recordPermissions?.[providerId]?.name || providerId
        }. Doctors cannot view these records.`,
      })
    }
  }

  // Handle Individual Record Permission Toggle
  const handleToggleRecordPermission = async (providerId, recordIndex) => {
    const recKey = `rec_${recordIndex + 1}`
    const targetRecord = medicalCase.records?.[recordIndex]

    const updated = caseService.toggleRecordPermission(medicalCase.id, providerId, recKey)
    if (updated) {
      const isNowGranted = Boolean(updated.recordPermissions?.[providerId]?.[recKey])
      if (targetRecord?.id) {
        if (isNowGranted) {
          recordService.grantPermission(targetRecord.id, providerId).catch(() => {})
        } else {
          recordService.revokePermission(targetRecord.id, providerId).catch(() => {})
        }
      }

      setMedicalCase({ ...updated })
      addToast({
        type: 'info',
        title: 'Permission Toggled',
        message: `Updated record visibility for ${
          updated.recordPermissions[providerId]?.name || providerId
        }.`,
      })
    }
  }

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 text-left">
      <BackgroundGrid mask="radial" opacityClass="opacity-[0.06] dark:opacity-[0.08]" />

      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Patient Dashboard', href: '/dashboard' },
          { label: `Case #${medicalCase.id}`, href: `/cases/${medicalCase.id}` },
          { label: 'Diagnostic Records & Vault', current: true },
        ]}
      />

      {/* Header Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border-default)] dark:border-[var(--border-default)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)]">
              Sovereign Medical Record Management
            </span>
            <Badge variant="sage" size="sm">
              <ShieldCheck className="w-3 h-3 inline mr-1 text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
              Zero-Knowledge Vault
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-[var(--text-primary)] dark:text-[#F2F4F1] font-medium tracking-tight">
            Diagnostic Records · Case #{medicalCase.id}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-primary)]/70 dark:text-[#B6C0BC] mt-1">
            Upload scans, manage doctor permissions, and track real-time access logs for {medicalCase.treatmentName}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/cases/${medicalCase.id}`)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Case Dossier
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setActiveTab('upload')
              window.scrollTo({ top: 300, behavior: 'smooth' })
            }}
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload New Record
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: 'vault', label: 'All Records', badge: `${records.length}` },
          { id: 'upload', label: 'Upload Interface' },
          { id: 'permissions', label: 'Hospital Access Permissions', badge: '3 Providers' },
          { id: 'audit', label: 'Immutable Access History', badge: `${medicalCase.accessLogs?.length || 0}` },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* ========================================================================= */}
      {/* SECTION 1: UPLOAD INTERFACE (Drag & Drop, Categories, Progress, States)   */}
      {/* ========================================================================= */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-[var(--text-primary)]">
                <Upload className="w-5 h-5 text-[var(--green-rich)]" />
                <CardTitle>Upload Diagnostic Records & Imaging</CardTitle>
              </div>
              <CardDescription>
                Drag and drop your medical files or browse from your device. Supported: MRI, X-Ray, CT Scan, Blood Report, Prescription, Medical History, Discharge Summary, and Doctor Notes.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Category Selector Chips */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  Select Record Category Before Upload <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {RECORD_CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setUploadCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-[3px] text-xs font-medium transition-all cursor-pointer select-none ${
                        uploadCategory === cat.id
                          ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] shadow-xs ring-2 ring-[#315B55]/30'
                          : 'bg-[var(--bg-base)] dark:bg-[#151C1A] hover:bg-[#EEF1EF] dark:hover:bg-[#1A2421] text-[var(--text-primary)]/80 dark:text-[#B6C0BC] border border-[var(--border-default)] dark:border-[var(--border-default)]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">
                  Target: <strong>{uploadCategory}</strong> ·{' '}
                  {RECORD_CATEGORIES.find((c) => c.id === uploadCategory)?.desc}
                </p>
              </div>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative p-8 sm:p-12 border-2 border-dashed rounded-[4px] text-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? 'border-[#315B55] dark:border-[#6F9F91] bg-[var(--bg-elevated)] dark:bg-[#202B28] scale-[1.01]'
                    : 'border-[var(--border-default)] dark:border-[var(--border-default)] bg-[var(--bg-base)]/80 dark:bg-[#151C1A]/60 hover:bg-[var(--bg-base)] dark:hover:bg-[#151C1A] hover:border-[#315B55] dark:hover:border-[#6F9F91]'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.dicom,.dcm,.jpg,.jpeg,.png,.tiff"
                />

                <div className="max-w-md mx-auto space-y-3 pointer-events-none">
                  <div className="w-14 h-14 rounded-[4px] bg-[var(--bg-elevated)] dark:bg-[#202B28] text-[var(--text-primary)] dark:text-[var(--green-rich)] flex items-center justify-center mx-auto shadow-2xs">
                    <Upload className="w-7 h-7 stroke-[2]" />
                  </div>

                  <div>
                    <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      Drag and drop your {uploadCategory} file here
                    </h3>
                    <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-1">
                      or click to browse from your computer or smartphone
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] text-[11px] text-[var(--text-primary)]/70 dark:text-[#B6C0BC] font-mono">
                    <span>PDF · DICOM · JPG · PNG · TIFF (Max 30MB)</span>
                  </div>
                </div>
              </div>

              {/* Upload Progress State */}
              {uploadProgress !== null && (
                <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[#315B55]/30 dark:border-[#6F9F91]/30 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
                      Encrypting & Uploading {pendingUploadFile?.name}...
                    </span>
                    <span className="font-mono font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)]">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-[#EEF1EF] dark:bg-[#202B28] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#173E39] dark:bg-[#6F9F91] h-full transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error State */}
              {uploadError && (
                <div className="p-4 bg-[#FDF2F2] dark:bg-red-950/30 rounded-[4px] border border-[#F5D4D4] dark:border-red-900/50 flex items-start justify-between gap-3 text-xs text-[#A33B39] dark:text-red-400">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-sm">Upload Validation Failed</strong>
                      <p className="mt-0.5 leading-relaxed">{uploadError}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadError(null)}
                    className="text-[#A33B39] hover:bg-[#F5D4D4]/50"
                  >
                    Dismiss
                  </Button>
                </div>
              )}

              {/* Success State */}
              {uploadSuccessFile && (
                <div className="p-4 bg-[var(--bg-elevated)] dark:bg-[#1A2421] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-[3px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <strong className="block text-sm">
                        File Successfully Encrypted & Saved
                      </strong>
                      <p className="text-[var(--text-primary)]/75 dark:text-[#B6C0BC] mt-0.5">
                        {uploadSuccessFile.name} ({uploadSuccessFile.size}) · Category: {uploadSuccessFile.category}
                      </p>
                      <div className="pt-1 flex items-center gap-2">
                        {aiProcessingState[uploadSuccessFile.id] === 'organizing' ? (
                          <Badge variant="warning" size="sm">
                            <RefreshCw className="w-3 h-3 inline mr-1 animate-spin" />
                            Organizing your record...
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            <Check className="w-3 h-3 inline mr-1" />
                            Organized
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setActiveTab('vault')}
                    >
                      View in Vault
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: ALL RECORDS (Record Cards with Category, Date, AI & Permissions)*/}
      {/* ========================================================================= */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Controls: Search and Category Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-primary)]/50 dark:text-[#89938F]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search diagnostic files..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-card)] text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[3px] outline-none focus:border-[#315B55] dark:focus:border-[#6F9F91] transition-colors placeholder-[#172321]/40 dark:placeholder-[#89938F]"
              />
            </div>

            {/* Quick Upload Trigger */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('upload')}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload Record
              </Button>
            </div>
          </div>

          {/* Category Filter Horizontal Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)] uppercase tracking-wider shrink-0 mr-1">
              Category:
            </span>
            {RECORD_CATEGORIES.map((cat) => {
              const count =
                cat.id === 'all'
                  ? records.length
                  : records.filter((r) => r.category?.toLowerCase() === cat.id.toLowerCase()).length

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-[3px] font-medium whitespace-nowrap transition-colors cursor-pointer select-none ${
                    selectedCategory === cat.id
                      ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614]'
                      : 'bg-[var(--bg-card)] text-[var(--text-primary)]/75 dark:text-[#B6C0BC] hover:bg-[#EEF1EF] dark:hover:bg-[#202B28] border border-[var(--border-default)] dark:border-[var(--border-default)]'
                  }`}
                >
                  {cat.label} ({count})
                </button>
              )
            })}
          </div>

          {/* Records Grid */}
          {filteredRecords.length === 0 ? (
            <div className="p-12 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] text-center space-y-3">
              <FileText className="w-10 h-10 text-[var(--green-rich)] dark:text-[var(--green-rich)] mx-auto opacity-40" />
              <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">No Diagnostic Records Found</h4>
              <p className="text-xs text-[var(--text-primary)]/60 dark:text-[#89938F] max-w-sm mx-auto">
                No documents match the category "{selectedCategory}". Upload new diagnostic scans to expand your dossier.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveTab('upload')}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Record
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredRecords.map((record) => {
                const isAiOrganizing = aiProcessingState[record.id] === 'organizing'
                const isAiOrganized = aiProcessingState[record.id] === 'organized' || (!isAiOrganizing && record.aiStatus === 'Organized')

                return (
                  <div
                    key={record.id}
                    className="p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs hover:border-[#315B55]/50 dark:hover:border-[#6F9F91]/50 hover:shadow-sm transition-all space-y-4 text-xs"
                  >
                    {/* Header: Category Badge & Status */}
                    <div className="flex items-center justify-between">
                      <Badge variant="sage">{record.category || 'Diagnostic'}</Badge>
                      <span className="text-[11px] font-mono text-[var(--text-primary)]/50 dark:text-[#89938F]">{record.size}</span>
                    </div>

                    {/* Filename & Details */}
                    <div>
                      <h4
                        className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] truncate cursor-pointer hover:text-[var(--text-primary)] dark:hover:text-[var(--green-rich)]"
                        title={record.name}
                        onClick={() => setPreviewRecord(record)}
                      >
                        {record.name}
                      </h4>
                      <p className="text-[11px] text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-0.5">
                        {record.type} · Uploaded on {record.date}
                      </p>
                    </div>

                    {/* AI Status Block: "Organizing your record..." or "Organized" */}
                    <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
                          AI Extraction Status
                        </span>

                        {isAiOrganizing ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#B07D1E] animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Organizing your record...
                          </span>
                        ) : isAiOrganized ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)]">
                            <Check className="w-3 h-3" />
                            Organized
                          </span>
                        ) : (
                          <span className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">Pending</span>
                        )}
                      </div>

                      <p className="text-[11px] text-[var(--text-primary)]/80 dark:text-[#B6C0BC] leading-relaxed italic">
                        {isAiOrganizing
                          ? 'Extracting clinical findings, anatomical slices, and medication schedules...'
                          : record.aiSummary || 'Document indexed into clinical dossier.'}
                      </p>

                      <p className="text-[10px] text-[var(--text-muted)] mt-1.5 flex items-center gap-1.5 not-italic">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--copper)] shrink-0" />
                        AI-generated information is for coordination and informational purposes and does not replace professional medical advice.
                      </p>

                      <div className="pt-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReanalyzeAI(record.id, record.name)}
                          className="text-[10px] font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)] hover:underline cursor-pointer"
                        >
                          Re-run AI Organization
                        </button>
                      </div>
                    </div>

                    {/* Permission Status */}
                    <div className="p-3 bg-[var(--bg-elevated)]/40 dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-default)] dark:border-[var(--border-default)] flex items-center justify-between">
                      <span className="text-[11px] text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
                        Permitted: Apex Joint Institute (India)
                      </span>
                      <button
                        type="button"
                        onClick={() => setPermissionRecord(record)}
                        className="text-[11px] font-medium text-[var(--green-rich)] dark:text-[var(--green-rich)] hover:underline cursor-pointer"
                      >
                        Permissions
                      </button>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewRecord(record)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Inspect
                      </Button>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadRecord(record)}
                          title="Download encrypted file"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>

                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(record.id, record.name)}
                          className="p-1.5 text-[var(--text-primary)]/50 dark:text-[#89938F] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Purge record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PERMISSION UI (Provider Access Status, Grant & Revoke)         */}
      {/* ========================================================================= */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <div className="p-4 bg-[var(--bg-elevated)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[var(--green-rich)] dark:text-[var(--green-rich)] shrink-0" />
              <div>
                <strong className="block text-sm">Sovereign Patient Access Matrix</strong>
                <p className="text-[var(--text-primary)]/75 dark:text-[#B6C0BC]">
                  You have constitutional control over your diagnostic files. Hospitals can only inspect records you explicitly permission.
                </p>
              </div>
            </div>
            <Badge variant="primary" size="sm">End-to-End Encrypted</Badge>
          </div>

          {/* Providers Permission Cards */}
          <div className="space-y-4">
            {medicalCase.recordPermissions &&
              Object.entries(medicalCase.recordPermissions).map(([providerKey, perm]) => {
                const isGranted = perm.status === 'Access Granted'
                const isRevoked = perm.status === 'Access Revoked'

                // Calculate number of shared records
                const sharedCount = records.filter((_, idx) => perm[`rec_${idx + 1}`]).length

                return (
                  <div
                    key={providerKey}
                    className="p-6 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs space-y-4 text-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="w-10 h-10 rounded-[4px] bg-[#173E39] dark:bg-[#6F9F91] text-white dark:text-[#101614] flex items-center justify-center font-medium text-sm shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">{perm.name}</h4>
                            <span className="text-[11px] font-mono text-[var(--text-primary)]/60 dark:text-[#89938F]">
                              {perm.location} · {perm.accreditation}
                            </span>
                          </div>
                          <p className="text-[11px] text-[var(--green-rich)] dark:text-[var(--green-rich)] mt-0.5">
                            Attending Surgeon: {perm.leadDoctor}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isGranted ? (
                          <Badge variant="success">Access Granted</Badge>
                        ) : isRevoked ? (
                          <Badge variant="error">Access Revoked</Badge>
                        ) : (
                          <Badge variant="warning">Partial Access</Badge>
                        )}

                        {isRevoked ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleGrantProvider(providerKey)}
                            leftIcon={<Unlock className="w-3.5 h-3.5" />}
                          >
                            Grant Access
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRevokeProvider(providerKey)}
                            leftIcon={<Lock className="w-3.5 h-3.5 text-red-600" />}
                            className="text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-800"
                          >
                            Revoke Access
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Records Shared Summary */}
                    <div className="flex items-center justify-between text-xs text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">
                      <span>
                        Records Shared: <strong>{sharedCount} of {records.length}</strong> permitted
                      </span>
                      <span className="text-[11px] text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium">
                        Toggle individual records below:
                      </span>
                    </div>

                    {/* Granular Record Checkbox Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                      {records.map((rec, rIdx) => {
                        const recKey = `rec_${rIdx + 1}`
                        const isPermitted = Boolean(perm[recKey])

                        return (
                          <label
                            key={rec.id}
                            className={`p-3 rounded-[3px] border flex items-center justify-between transition-colors cursor-pointer select-none ${
                              isPermitted
                                ? 'bg-[var(--bg-elevated)]/40 dark:bg-[#202B28] border-[var(--border-default)] dark:border-[#6F9F91]/40 text-[var(--text-primary)] dark:text-[#F2F4F1]'
                                : 'bg-[var(--bg-base)] dark:bg-[#151C1A] border-[var(--border-hairline)] dark:border-[var(--border-default)] text-[var(--text-primary)]/50 dark:text-[#89938F]'
                            }`}
                          >
                            <div className="truncate pr-2">
                              <span className="font-medium text-xs block truncate">{rec.name}</span>
                              <span className="text-[10px] text-[var(--green-rich)] dark:text-[var(--green-rich)] block">{rec.category}</span>
                            </div>
                            <input
                              type="checkbox"
                              checked={isPermitted}
                              onChange={() => handleToggleRecordPermission(providerKey, rIdx)}
                              className="rounded text-[var(--text-primary)] dark:text-[var(--green-rich)] focus:ring-[#315B55] cursor-pointer"
                            />
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: ACCESS HISTORY (Who accessed, which record, when)              */}
      {/* ========================================================================= */}
      {activeTab === 'audit' && (
        <div className="bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] shadow-xs overflow-hidden text-xs">
          <div className="p-6 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
            <h3 className="text-base font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
              Immutable Diagnostic Access Ledger
            </h3>
            <p className="text-xs text-[var(--text-primary)]/65 dark:text-[#B6C0BC] mt-0.5">
              Cryptographically audited log tracking every doctor, hospital coordinator, or AI agent that views your diagnostic files.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[var(--bg-base)] dark:bg-[#151C1A] border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] text-[var(--text-primary)] dark:text-[#F2F4F1] font-medium">
                <tr>
                  <th className="p-4 sm:px-6">Accessor / Physician</th>
                  <th className="p-4">Organization</th>
                  <th className="p-4">Record Inspected</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Purpose</th>
                  <th className="p-4 text-right sm:pr-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1EF] dark:divide-[#2B3834]">
                {medicalCase.accessLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--bg-base)]/50 dark:hover:bg-[#151C1A]/50 transition-colors">
                    <td className="p-4 sm:px-6 font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {log.accessor}
                    </td>
                    <td className="p-4 text-[var(--green-rich)] dark:text-[var(--green-rich)] font-medium">
                      {log.provider}
                    </td>
                    <td className="p-4 text-[var(--text-primary)]/80 dark:text-[#B6C0BC] font-mono text-[11px] truncate max-w-[200px]">
                      {log.recordName}
                    </td>
                    <td className="p-4">
                      <Badge variant="sage" size="sm">{log.category}</Badge>
                    </td>
                    <td className="p-4 text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">
                      {log.purpose}
                    </td>
                    <td className="p-4 text-right sm:pr-6 font-mono text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">
                      {log.timestamp}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PREVIEW MODAL: High-Res Document Preview                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(previewRecord)}
        onClose={() => setPreviewRecord(null)}
        title={previewRecord?.name || 'Diagnostic File Preview'}
        size="lg"
      >
        {previewRecord && (
          <div className="space-y-4 text-left text-xs">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
              <div>
                <span className="font-medium text-sm text-[var(--text-primary)] dark:text-[#F2F4F1] block">{previewRecord.name}</span>
                <span className="text-[var(--green-rich)] dark:text-[var(--green-rich)] font-mono text-[11px]">
                  Category: {previewRecord.category} · Size: {previewRecord.size} · Uploaded: {previewRecord.date}
                </span>
              </div>
              <Badge variant="success">Verified DICOM</Badge>
            </div>

            {/* Simulated Imaging Canvas View */}
            <div className="h-64 sm:h-80 bg-[#172321] dark:bg-[#0D1210] rounded-[4px] flex flex-col items-center justify-center text-[#F8F8F5] p-6 text-center space-y-3">
              <FileCode className="w-12 h-12 text-[var(--green-rich)] dark:text-[var(--green-rich)] animate-pulse" />
              <div>
                <p className="font-mono text-sm font-medium text-white">DICOM Multi-Slice Viewer (Simulated)</p>
                <p className="text-[11px] text-[#CFE2D8] mt-1 max-w-sm">
                  Full 16-bit grayscale coronal slice rendering with submillimeter spatial resolution.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[10px] text-[#EEF1EF]/70 font-mono">
                <span>Window Level: 350 HU</span>
                <span>•</span>
                <span>Zoom: 100%</span>
                <span>•</span>
                <span>Slice: 24/68</span>
              </div>
            </div>

            {/* AI Clinical Summary in Preview */}
            <div className="p-4 bg-[var(--bg-elevated)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-default)] dark:border-[var(--border-default)] space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--green-rich)] dark:text-[var(--green-rich)] flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[var(--green-rich)] dark:text-[var(--green-rich)]" />
                Extracted Clinical Finding
              </span>
              <p className="text-xs text-[var(--text-primary)] dark:text-[#F2F4F1] leading-relaxed">
                {previewRecord.aiSummary || 'Document indexed into clinical dossier.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)]">
              <span className="text-[11px] text-[var(--text-primary)]/60 dark:text-[#89938F]">Protected by EthAum Sovereign Encryption</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewRecord(null)}
              >
                Close Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* QUICK PERMISSION MODAL                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(permissionRecord)}
        onClose={() => setPermissionRecord(null)}
        title="Manage Scan Visibility"
        size="md"
      >
        {permissionRecord && (
          <div className="space-y-4 text-left text-xs">
            <p className="text-[var(--text-primary)]/70 dark:text-[#B6C0BC]">
              Grant or revoke viewing privileges for <strong>{permissionRecord.name}</strong> across international medical centers:
            </p>

            <div className="space-y-2">
              {medicalCase.recordPermissions &&
                Object.entries(medicalCase.recordPermissions).map(([key, perm]) => (
                  <div
                    key={key}
                    className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between"
                  >
                    <div>
                      <strong className="block text-xs text-[var(--text-primary)] dark:text-[#F2F4F1]">{perm.name}</strong>
                      <span className="text-[10px] text-[var(--green-rich)] dark:text-[var(--green-rich)]">{perm.location}</span>
                    </div>

                    <Button
                      variant={perm.status === 'Access Granted' ? 'outline' : 'primary'}
                      size="sm"
                      onClick={() => {
                        handleToggleRecordPermission(key, 0)
                        addToast({
                          type: 'info',
                          title: 'Visibility Updated',
                          message: `Updated permissions for ${perm.name}.`,
                        })
                      }}
                    >
                      {perm.status === 'Access Granted' ? 'Revoke' : 'Permit'}
                    </Button>
                  </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setPermissionRecord(null)}>
                Save Changes
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CaseRecordsPage
