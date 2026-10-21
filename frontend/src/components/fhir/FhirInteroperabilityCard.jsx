import React, { useState, useEffect } from 'react'
import {
  FileCode,
  Share2,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  RefreshCw,
  ShieldCheck,
  Layers,
  Activity,
  FileText,
  Check,
  Copy,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Button,
  useToast,
} from '../index.js'
import fhirService from '../../services/fhirService.js'

export function FhirInteroperabilityCard({ caseId }) {
  const { addToast } = useToast()

  const [activeSubTab, setActiveSubTab] = useState('export') // 'export' | 'import' | 'ledger'
  const [isLoadingPreview, setIsLoadingPreview] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [previewData, setPreviewData] = useState(null)
  const [showJsonPreviewModal, setShowJsonPreviewModal] = useState(false)

  // Import State
  const [importJsonText, setImportJsonText] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState(null)
  const [stagedImport, setStagedImport] = useState(null)
  const [isConfirming, setIsConfirming] = useState(false)

  // Operations Ledger State
  const [operations, setOperations] = useState([])
  const [isLoadingOps, setIsLoadingOps] = useState(false)

  // Load preview data
  const loadPreview = async () => {
    setIsLoadingPreview(true)
    try {
      const res = await fhirService.previewExport(caseId)
      const data = res?.data || res
      setPreviewData(data)
    } catch (err) {
      console.warn('[FhirCard] Error loading preview:', err)
      addToast({
        type: 'error',
        title: 'FHIR Export Preview Failed',
        message: err.response?.data?.error?.message || err.message,
      })
    } finally {
      setIsLoadingPreview(false)
    }
  }

  // Load operations ledger
  const loadOperations = async () => {
    setIsLoadingOps(true)
    try {
      const res = await fhirService.getOperationsHistory(caseId)
      const list = res?.data || res || []
      setOperations(Array.isArray(list) ? list : [])
    } catch (err) {
      console.warn('[FhirCard] Error loading operations:', err)
    } finally {
      setIsLoadingOps(false)
    }
  }

  useEffect(() => {
    if (caseId) {
      loadPreview()
      loadOperations()
    }
  }, [caseId])

  // Handle Download FHIR Bundle
  const handleDownloadBundle = async () => {
    setIsExporting(true)
    try {
      await fhirService.exportBundle(caseId, true)
      addToast({
        type: 'success',
        title: 'FHIR R4 Bundle Downloaded',
        message: `Case #${caseId} clinical records exported in standard HL7 FHIR R4 JSON.`,
      })
      await loadOperations()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: err.response?.data?.error?.message || err.message,
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Load Eleanor Vance synthetic demo bundle
  const handleLoadSampleBundle = async () => {
    try {
      const res = await fhirService.getSyntheticSampleBundle()
      const bundle = res?.data || res
      setImportJsonText(JSON.stringify(bundle, null, 2))
      addToast({
        type: 'info',
        title: 'Synthetic Bundle Loaded',
        message: 'Loaded sample HL7 FHIR R4 clinical records (Eleanor Vance).',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Failed to Load Sample',
        message: err.message,
      })
    }
  }

  // Validate and Stage Import
  const handleStageImport = async () => {
    if (!importJsonText.trim()) {
      addToast({
        type: 'warning',
        title: 'Empty Payload',
        message: 'Please paste or load a valid FHIR R4 JSON Bundle.',
      })
      return
    }

    setIsValidating(true)
    setValidationResult(null)
    try {
      let parsedJson
      try {
        parsedJson = JSON.parse(importJsonText)
      } catch (jsonErr) {
        setValidationResult({
          valid: false,
          errors: [{ path: 'json', message: `Invalid JSON syntax: ${jsonErr.message}` }],
        })
        return
      }

      // Call Backend Staging Workflow
      const res = await fhirService.stageImport(caseId, parsedJson)
      const staged = res?.data || res
      setStagedImport(staged)
      setValidationResult(staged.validationResult || { valid: true, errors: [] })
      addToast({
        type: 'success',
        title: 'FHIR Bundle Staged',
        message: `Staged ${staged.resourceCount || staged.resources?.length} resources for clinical review.`,
      })
      await loadOperations()
    } catch (err) {
      const errData = err.response?.data?.data || err.response?.data
      if (errData?.errors) {
        setValidationResult(errData)
      } else {
        addToast({
          type: 'error',
          title: 'Staging Failed',
          message: err.response?.data?.error?.message || err.message,
        })
      }
    } finally {
      setIsValidating(false)
    }
  }

  // Confirm Staged Import
  const handleConfirmImport = async () => {
    if (!stagedImport?.stagingId) return

    setIsConfirming(true)
    try {
      const res = await fhirService.confirmImport(caseId, stagedImport.stagingId)
      const data = res?.data || res
      addToast({
        type: 'success',
        title: 'FHIR Import Merged',
        message: `${data.importedRecords?.length || 0} medical records integrated into sovereign case vault.`,
      })
      setStagedImport(null)
      setImportJsonText('')
      setValidationResult(null)
      await loadPreview()
      await loadOperations()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Confirmation Failed',
        message: err.response?.data?.error?.message || err.message,
      })
    } finally {
      setIsConfirming(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    addToast({
      type: 'info',
      title: 'Copied to Clipboard',
      message: 'JSON payload copied.',
    })
  }

  const resourceCounts = previewData?.resourceCounts || {}

  return (
    <div className="space-y-6 text-left">
      {/* Prototype Notice Banner */}
      <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--copper)]/30 dark:border-[var(--copper)]/40 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-[var(--copper)] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
              HL7 FHIR® Release 4 (R4) Interoperability Prototype
            </span>
            <Badge variant="copper" size="sm">
              v4.0.1
            </Badge>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            EthAum implements standard HL7 FHIR resource models (<code>Patient</code>, <code>Condition</code>,{' '}
            <code>Observation</code>, <code>DiagnosticReport</code>, <code>DocumentReference</code>, <code>Encounter</code>)
            enabling seamless cross-border hospital EHR portability.
          </p>
          <p className="text-[10px] text-[var(--text-muted)] italic">
            <strong>Disclaimer:</strong> This is an interoperability prototype conforming to FHIR R4 schema. External
            hospital integration requires mutual organizational mTLS certificate configuration and authorized EHR API credentials.
          </p>
        </div>
      </div>

      {/* Main FHIR Card */}
      <Card className="border border-[var(--border-default)] dark:border-[var(--border-default)] bg-[var(--bg-card)]">
        <CardHeader className="border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[var(--green-rich)]" />
                <CardTitle className="text-base font-medium">Health Records Interoperability</CardTitle>
                <Badge variant="primary" size="sm">FHIR R4</Badge>
              </div>
              <CardDescription className="text-xs mt-1">
                Export case records as a verifiable HL7 FHIR Bundle or ingest hospital EHR bundles with duplicate detection.
              </CardDescription>
            </div>

            {/* Sub-tab Switcher */}
            <div className="flex items-center bg-[var(--bg-base)] dark:bg-[#151C1A] p-1 rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => setActiveSubTab('export')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'export'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] dark:text-[#F2F4F1] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Bundle</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('import')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'import'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] dark:text-[#F2F4F1] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Ingest & Validate</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubTab('ledger')}
                className={`px-3 py-1.5 text-xs font-medium rounded-[3px] transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeSubTab === 'ledger'
                    ? 'bg-[var(--bg-card)] text-[var(--text-primary)] dark:text-[#F2F4F1] shadow-xs'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Audit Ledger ({operations.length})</span>
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* TAB 1: EXPORT BUNDLE */}
          {activeSubTab === 'export' && (
            <div className="space-y-6">
              {/* Summary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Patient</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.Patient || 1}
                    </span>
                    <Badge variant="outline" size="sm">Subject</Badge>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Condition</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.Condition || 1}
                    </span>
                    <Badge variant="outline" size="sm">Diagnosis</Badge>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Observation</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.Observation || 1}
                    </span>
                    <Badge variant="outline" size="sm">Clinical</Badge>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">DocReference</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.DocumentReference || 0}
                    </span>
                    <Badge variant="outline" size="sm">Files</Badge>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">DiagReport</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.DiagnosticReport || 0}
                    </span>
                    <Badge variant="outline" size="sm">Studies</Badge>
                  </div>
                </div>

                <div className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <span className="text-[10px] uppercase font-mono text-[var(--text-muted)] block">Encounter</span>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)] dark:text-[#F2F4F1]">
                      {resourceCounts.Encounter || 0}
                    </span>
                    <Badge variant="outline" size="sm">Consults</Badge>
                  </div>
                </div>
              </div>

              {/* Resource Mapping Breakdown */}
              <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium text-[var(--text-primary)] dark:text-[#F2F4F1] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[var(--green-rich)]" />
                    <span>Dossier Mapping Specification (EthAum Schema → HL7 FHIR R4)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[var(--text-muted)]">application/fhir+json</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-[var(--text-secondary)]">
                  <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1">
                    <strong className="text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                      Patient Demographics & Medical Case
                    </strong>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Maps patient name, destination country, and identifiers to standard <code>Patient</code> resource.
                      Target treatment mapped to <code>Condition</code> (active, encounter-diagnosis).
                    </p>
                  </div>

                  <div className="p-2.5 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] space-y-1">
                    <strong className="text-[var(--text-primary)] dark:text-[#F2F4F1] block">
                      Diagnostic Imaging & Lab Studies
                    </strong>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      PDF, JPG, DICOM scans converted to <code>DocumentReference</code> with secure storage URLs and
                      clinical summaries mapped to <code>DiagnosticReport</code> (RAD / LAB).
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Clock className="w-3.5 h-3.5 text-[var(--green-rich)]" />
                  <span>
                    Ready for institutional export ({previewData?.bundle?.entry?.length || 0} resources mapped)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJsonPreviewModal(true)}
                    leftIcon={<Eye className="w-3.5 h-3.5" />}
                    disabled={!previewData?.bundle}
                  >
                    Preview FHIR JSON
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDownloadBundle}
                    loading={isExporting}
                    leftIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Download FHIR R4 Bundle
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INGEST & VALIDATE */}
          {activeSubTab === 'import' && (
            <div className="space-y-5 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    Import External Hospital EHR Records
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    Paste an HL7 FHIR R4 Bundle or single clinical resource. Records will be validated and staged for
                    review before merging.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleLoadSampleBundle}
                  leftIcon={<Sparkles className="w-3 h-3 text-[var(--copper)]" />}
                >
                  Load Synthetic Preset (Eleanor Vance)
                </Button>
              </div>

              <div>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder={`{\n  "resourceType": "Bundle",\n  "type": "collection",\n  "entry": [ ... ]\n}`}
                  rows={8}
                  className="w-full p-3 font-mono text-[11px] bg-[var(--bg-base)] dark:bg-[#151C1A] text-[var(--text-primary)] dark:text-[#F2F4F1] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[4px] outline-none focus:border-[#315B55] dark:focus:border-[#6F9F91]"
                />
              </div>

              {/* Validation Feedback */}
              {validationResult && (
                <div
                  className={`p-3.5 rounded-[4px] border ${
                    validationResult.valid
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                      : 'bg-red-500/10 border-red-500/30 text-red-800 dark:text-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    {validationResult.valid ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>HL7 FHIR R4 Validation Succeeded</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                        <span>Validation Discrepancies Found ({validationResult.errors?.length || 0})</span>
                      </>
                    )}
                  </div>

                  {validationResult.errors?.length > 0 && (
                    <ul className="mt-2 list-disc list-inside space-y-1 text-[11px]">
                      {validationResult.errors.map((err, i) => (
                        <li key={i}>
                          <span className="font-mono text-[10px]">{err.path}:</span> {err.message}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Staged Review Card (when staged) */}
              {stagedImport && (
                <div className="p-4 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--copper)]/40 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                    <div className="flex items-center gap-2">
                      <Badge variant="copper" size="sm">
                        STAGED: PENDING_REVIEW
                      </Badge>
                      <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                        Staging ID: {stagedImport.stagingId}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      {stagedImport.resourceCount} Resources Detected
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] text-[var(--text-secondary)] font-medium">
                      Candidate Records for Integration:
                    </p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {stagedImport.resources?.map((r, i) => (
                        <div
                          key={i}
                          className="p-2 bg-[var(--bg-card)] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between text-[11px]"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Badge variant="outline" size="xs">
                              {r.resourceType}
                            </Badge>
                            <span className="truncate font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                              {r.title}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {r.isDuplicate ? (
                              <Badge variant="warning" size="xs" className="flex items-center gap-1">
                                <AlertTriangle className="w-2.5 h-2.5" /> Duplicate (Will Skip)
                              </Badge>
                            ) : (
                              <Badge variant="success" size="xs" className="flex items-center gap-1">
                                <Check className="w-2.5 h-2.5" /> Ready
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[10px] text-[var(--text-muted)]">
                      Duplicate records are automatically skipped to prevent record contamination.
                    </p>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmImport}
                      loading={isConfirming}
                      leftIcon={<Check className="w-3.5 h-3.5" />}
                    >
                      Confirm & Merge into Vault
                    </Button>
                  </div>
                </div>
              )}

              {/* Stage Button if not yet staged */}
              {!stagedImport && (
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleStageImport}
                    loading={isValidating}
                    leftIcon={<UploadCloud className="w-3.5 h-3.5" />}
                  >
                    Validate & Stage for Clinical Review
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIT LEDGER */}
          {activeSubTab === 'ledger' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                    FHIR Operations & Audit Trail
                  </h4>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Immutable history of all HL7 FHIR export, staging, and import confirmation actions.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="xs"
                  onClick={loadOperations}
                  loading={isLoadingOps}
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                >
                  Refresh
                </Button>
              </div>

              {operations.length === 0 ? (
                <div className="p-8 text-center bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[4px] border border-[var(--border-hairline)] dark:border-[var(--border-default)]">
                  <Activity className="w-6 h-6 mx-auto text-[var(--text-muted)] mb-2" />
                  <p className="text-xs text-[var(--text-muted)]">No FHIR operations recorded yet for this case.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {operations.map((op, idx) => (
                    <div
                      key={op.id || idx}
                      className="p-3 bg-[var(--bg-base)] dark:bg-[#151C1A] rounded-[3px] border border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              op.operation === 'EXPORT'
                                ? 'primary'
                                : op.operation === 'IMPORT_CONFIRM'
                                ? 'success'
                                : 'copper'
                            }
                            size="xs"
                          >
                            {op.operation}
                          </Badge>
                          <span className="font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                            {op.details || `Operation ${op.operation}`}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Actor: {op.actorRole} ({op.actorId}) · {op.resourceCount} Resources
                        </p>
                      </div>

                      <span className="text-[10px] font-mono text-[var(--text-muted)] shrink-0">
                        {new Date(op.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* JSON Preview Modal */}
      {showJsonPreviewModal && previewData?.bundle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] dark:border-[var(--border-default)] rounded-[6px] shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[var(--green-rich)]" />
                <h3 className="text-sm font-medium text-[var(--text-primary)] dark:text-[#F2F4F1]">
                  HL7 FHIR R4 Bundle JSON Preview (Case #{caseId})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonPreviewModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 rounded cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-[11px] bg-[var(--bg-base)] dark:bg-[#151C1A]">
              <pre className="text-[var(--text-primary)] dark:text-[#F2F4F1] whitespace-pre-wrap">
                {JSON.stringify(previewData.bundle, null, 2)}
              </pre>
            </div>

            <div className="p-3 border-t border-[var(--border-hairline)] dark:border-[var(--border-default)] flex items-center justify-between">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">
                application/fhir+json · {previewData.bundle.entry?.length || 0} Entries
              </span>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => copyToClipboard(JSON.stringify(previewData.bundle, null, 2))}
                  leftIcon={<Copy className="w-3 h-3" />}
                >
                  Copy JSON
                </Button>
                <Button variant="primary" size="xs" onClick={() => setShowJsonPreviewModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FhirInteroperabilityCard
