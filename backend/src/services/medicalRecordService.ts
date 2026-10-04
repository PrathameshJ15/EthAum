import {
  MedicalRecord,
  RecordAccessLog,
  RecordPermission,
  RecordCategory,
} from '../types/index.js'
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js'

// In-memory demo records matching sovereign EthAum sample data
const MOCK_RECORDS: MedicalRecord[] = [
  {
    id: 'rec-1',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    name: 'Right_Knee_Coronal_MRI_HighRes.pdf',
    category: 'MRI',
    type: 'DICOM MRI Scan',
    size: '14.2 MB',
    storagePath: 'patients/pat-1/cases/ET-8492/mri_coronal.pdf',
    status: 'Verified',
    aiStatus: 'Organized',
    aiSummary: 'Grade IV medial joint space collapse, intact cruciate ligaments.',
    permissions: ['apex-joint-delhi', 'horizon-bangkok'],
    createdAt: '2026-09-12T10:00:00Z',
    updatedAt: '2026-09-12T10:00:00Z',
  },
  {
    id: 'rec-2',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    name: 'Weight_Bearing_Bilateral_XRay_AP.jpg',
    category: 'X-Ray',
    type: 'Full Leg Radiograph',
    size: '3.8 MB',
    storagePath: 'patients/pat-1/cases/ET-8492/xray_ap.jpg',
    status: 'Verified',
    aiStatus: 'Organized',
    aiSummary: 'Severe varus deformity (7° mechanical axis deviation).',
    permissions: ['apex-joint-delhi', 'horizon-bangkok'],
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-14T11:00:00Z',
  },
  {
    id: 'rec-3',
    caseId: 'ET-8492',
    patientId: 'pat-1',
    name: 'Knee_3D_Robotic_CT_Reconstruction.dcm',
    category: 'CT Scan',
    type: '3D Volume Rendering',
    size: '22.4 MB',
    storagePath: 'patients/pat-1/cases/ET-8492/ct_3d.dcm',
    status: 'Verified',
    aiStatus: 'Organized',
    aiSummary: 'Subchondral bone mineral density mapping complete for robotic cuts.',
    permissions: ['apex-joint-delhi'],
    createdAt: '2026-09-15T12:00:00Z',
    updatedAt: '2026-09-15T12:00:00Z',
  },
]

const MOCK_PERMISSIONS: RecordPermission[] = [
  {
    id: 'perm-1',
    recordId: 'rec-1',
    providerId: 'apex-joint-delhi',
    grantedBy: 'pat-1',
    grantedAt: '2026-09-12T10:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'perm-2',
    recordId: 'rec-1',
    providerId: 'horizon-bangkok',
    grantedBy: 'pat-1',
    grantedAt: '2026-09-12T10:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'perm-3',
    recordId: 'rec-2',
    providerId: 'apex-joint-delhi',
    grantedBy: 'pat-1',
    grantedAt: '2026-09-14T11:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'perm-4',
    recordId: 'rec-2',
    providerId: 'horizon-bangkok',
    grantedBy: 'pat-1',
    grantedAt: '2026-09-14T11:00:00Z',
    status: 'ACTIVE',
  },
  {
    id: 'perm-5',
    recordId: 'rec-3',
    providerId: 'apex-joint-delhi',
    grantedBy: 'pat-1',
    grantedAt: '2026-09-15T12:00:00Z',
    status: 'ACTIVE',
  },
]

const MOCK_ACCESS_LOGS: RecordAccessLog[] = []

export const medicalRecordService = {
  async getRecordById(id: string): Promise<MedicalRecord | null> {
    if (isSupabaseConfigured()) {
      try {
        const { data: record, error } = await supabaseAdmin
          .from('medical_records')
          .select('*')
          .eq('id', id)
          .single()

        if (!error && record) {
          // Fetch active permissions
          const { data: perms } = await supabaseAdmin
            .from('record_permissions')
            .select('provider_id')
            .eq('record_id', id)
            .eq('status', 'ACTIVE')

          const activeProviders = perms ? perms.map((p: any) => p.provider_id) : []

          return {
            id: record.id,
            caseId: record.case_id,
            patientId: record.patient_id,
            name: record.name,
            category: record.category,
            type: record.type,
            size: record.size,
            sizeBytes: record.size_bytes,
            storagePath: record.storage_path,
            status: record.status,
            aiStatus: record.ai_status,
            aiSummary: record.ai_summary,
            permissions: activeProviders,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
          }
        }
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase query fallback: ${err.message}`)
      }
    }

    const record = MOCK_RECORDS.find((r) => r.id === id)
    if (!record) return null

    // Ensure permissions array is synchronized with MOCK_PERMISSIONS
    const activePerms = MOCK_PERMISSIONS.filter(
      (p) => p.recordId === id && p.status === 'ACTIVE'
    ).map((p) => p.providerId)

    return {
      ...record,
      permissions: Array.from(new Set([...record.permissions, ...activePerms])),
    }
  },

  async listRecordsByCase(caseId: string): Promise<MedicalRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('medical_records')
          .select('*')
          .eq('case_id', caseId)

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            caseId: r.case_id,
            patientId: r.patient_id,
            name: r.name,
            category: r.category,
            type: r.type,
            size: r.size,
            sizeBytes: r.size_bytes,
            storagePath: r.storage_path,
            status: r.status,
            aiStatus: r.ai_status,
            aiSummary: r.ai_summary,
            permissions: [],
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase list fallback: ${err.message}`)
      }
    }

    const caseRecords = MOCK_RECORDS.filter((r) => r.caseId === caseId)
    return caseRecords.map((record) => {
      const activePerms = MOCK_PERMISSIONS.filter(
        (p) => p.recordId === record.id && p.status === 'ACTIVE'
      ).map((p) => p.providerId)
      return {
        ...record,
        permissions: Array.from(new Set([...(record.permissions || []), ...activePerms])),
      }
    })
  },

  async listRecordsSharedWithProvider(providerId: string): Promise<MedicalRecord[]> {
    const authorizedRecords: MedicalRecord[] = []
    for (const record of MOCK_RECORDS) {
      const isAuth = await this.hasActivePermission(record.id, providerId)
      if (isAuth) {
        const activePerms = MOCK_PERMISSIONS.filter(
          (p) => p.recordId === record.id && p.status === 'ACTIVE'
        ).map((p) => p.providerId)
        authorizedRecords.push({
          ...record,
          permissions: Array.from(new Set([...(record.permissions || []), ...activePerms])),
        })
      }
    }
    return authorizedRecords
  },

  async listRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('medical_records')
          .select('*')
          .eq('patient_id', patientId)

        if (!error && data) {
          return data.map((r: any) => ({
            id: r.id,
            caseId: r.case_id,
            patientId: r.patient_id,
            name: r.name,
            category: r.category,
            type: r.type,
            size: r.size,
            sizeBytes: r.size_bytes,
            storagePath: r.storage_path,
            status: r.status,
            aiStatus: r.ai_status,
            aiSummary: r.ai_summary,
            permissions: [],
            createdAt: r.created_at,
            updatedAt: r.updated_at,
          }))
        }
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase list fallback: ${err.message}`)
      }
    }

    return MOCK_RECORDS.filter((r) => r.patientId === patientId)
  },

  /**
   * Checks whether a provider has active viewing authorization for a record.
   */
  async hasActivePermission(recordId: string, providerId: string): Promise<boolean> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('record_permissions')
          .select('id')
          .eq('record_id', recordId)
          .eq('provider_id', providerId)
          .eq('status', 'ACTIVE')
          .single()

        if (!error && data) return true
      } catch {
        // Fallback to in-memory check
      }
    }

    const perm = MOCK_PERMISSIONS.find(
      (p) => p.recordId === recordId && p.providerId === providerId && p.status === 'ACTIVE'
    )
    if (perm) return true

    const record = MOCK_RECORDS.find((r) => r.id === recordId)
    return Boolean(record?.permissions.includes(providerId))
  },

  /**
   * Patient grants explicit access to a provider.
   */
  async grantPermission(
    recordId: string,
    providerId: string,
    grantedBy: string
  ): Promise<RecordPermission | null> {
    const record = await this.getRecordById(recordId)
    if (!record) return null

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('record_permissions').upsert({
          record_id: recordId,
          provider_id: providerId,
          granted_by: grantedBy,
          status: 'ACTIVE',
          granted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase permission upsert error: ${err.message}`)
      }
    }

    // In-memory update
    let perm = MOCK_PERMISSIONS.find(
      (p) => p.recordId === recordId && p.providerId === providerId
    )
    if (perm) {
      perm.status = 'ACTIVE'
      perm.grantedAt = new Date().toISOString()
    } else {
      perm = {
        id: `perm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        recordId,
        providerId,
        grantedBy,
        grantedAt: new Date().toISOString(),
        status: 'ACTIVE',
      }
      MOCK_PERMISSIONS.push(perm)
    }

    const mockRec = MOCK_RECORDS.find((r) => r.id === recordId)
    if (mockRec && !mockRec.permissions.includes(providerId)) {
      mockRec.permissions.push(providerId)
      mockRec.updatedAt = new Date().toISOString()
    }

    await this.logAccess({
      recordId,
      accessedBy: grantedBy,
      accessRole: 'patient',
      action: 'SHARE_GRANTED',
      details: { providerId },
      timestamp: new Date().toISOString(),
    })

    return perm
  },

  /**
   * Patient revokes access from a specific provider.
   */
  async revokePermission(
    recordId: string,
    providerId: string,
    revokedBy: string
  ): Promise<boolean> {
    const record = await this.getRecordById(recordId)
    if (!record) return false

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from('record_permissions')
          .update({
            status: 'REVOKED',
            updated_at: new Date().toISOString(),
          })
          .eq('record_id', recordId)
          .eq('provider_id', providerId)
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase revoke error: ${err.message}`)
      }
    }

    // In-memory update
    const perm = MOCK_PERMISSIONS.find(
      (p) => p.recordId === recordId && p.providerId === providerId
    )
    if (perm) {
      perm.status = 'REVOKED'
    }

    const mockRec = MOCK_RECORDS.find((r) => r.id === recordId)
    if (mockRec) {
      mockRec.permissions = mockRec.permissions.filter((p) => p !== providerId)
      mockRec.updatedAt = new Date().toISOString()
    }

    await this.logAccess({
      recordId,
      accessedBy: revokedBy,
      accessRole: 'patient',
      action: 'SHARE_REVOKED',
      details: { providerId },
      timestamp: new Date().toISOString(),
    })

    return true
  },

  /**
   * Bulk update permissions (for backwards compatibility)
   */
  async updatePermissions(
    recordId: string,
    providerIds: string[],
    grantedBy: string
  ): Promise<MedicalRecord | null> {
    const record = MOCK_RECORDS.find((r) => r.id === recordId)
    if (!record) return null

    record.permissions = providerIds
    record.updatedAt = new Date().toISOString()

    // Synchronize MOCK_PERMISSIONS
    for (const pid of providerIds) {
      await this.grantPermission(recordId, pid, grantedBy)
    }

    return record
  },

  /**
   * Register a newly uploaded medical record.
   */
  async createRecord(payload: {
    caseId: string
    patientId: string
    name: string
    category: RecordCategory
    type: string
    size: string
    storagePath: string
    sizeBytes?: number
  }): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId: payload.caseId,
      patientId: payload.patientId,
      name: payload.name,
      category: payload.category,
      type: payload.type,
      size: payload.size,
      sizeBytes: payload.sizeBytes,
      storagePath: payload.storagePath,
      status: 'Pending',
      aiStatus: 'Processing',
      permissions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('medical_records').insert({
          id: newRecord.id,
          case_id: newRecord.caseId,
          patient_id: newRecord.patientId,
          name: newRecord.name,
          category: newRecord.category,
          type: newRecord.type,
          size: newRecord.size,
          size_bytes: newRecord.sizeBytes,
          storage_path: newRecord.storagePath,
          status: newRecord.status,
          ai_status: newRecord.aiStatus,
          created_at: newRecord.createdAt,
          updated_at: newRecord.updatedAt,
        })
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase insert fallback: ${err.message}`)
      }
    }

    MOCK_RECORDS.push(newRecord)

    await this.logAccess({
      recordId: newRecord.id,
      accessedBy: payload.patientId,
      accessRole: 'patient',
      action: 'UPLOAD',
      details: { name: payload.name, category: payload.category },
      timestamp: new Date().toISOString(),
    })

    return newRecord
  },

  /**
   * Append an immutable access log.
   */
  async logAccess(log: Omit<RecordAccessLog, 'id'> & { id?: string }): Promise<void> {
    const entry: RecordAccessLog = {
      id: log.id || `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...log,
    }

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin.from('record_access_logs').insert({
          id: entry.id,
          record_id: entry.recordId,
          accessed_by: entry.accessedBy,
          access_role: entry.accessRole,
          action: entry.action,
          ip_address: entry.ipAddress,
          user_agent: entry.userAgent,
          details: entry.details || {},
          timestamp: entry.timestamp,
        })
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase logAccess fallback: ${err.message}`)
      }
    }

    MOCK_ACCESS_LOGS.push(entry)
  },

  /**
   * Retrieve all audit logs for a record.
   */
  async getAccessLogs(recordId: string): Promise<RecordAccessLog[]> {
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabaseAdmin
          .from('record_access_logs')
          .select('*')
          .eq('record_id', recordId)
          .order('timestamp', { ascending: false })

        if (!error && data) {
          return data.map((d: any) => ({
            id: d.id,
            recordId: d.record_id,
            accessedBy: d.accessed_by,
            accessRole: d.access_role,
            action: d.action,
            ipAddress: d.ip_address,
            userAgent: d.user_agent,
            details: d.details,
            timestamp: d.timestamp,
          }))
        }
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase getAccessLogs fallback: ${err.message}`)
      }
    }

    return MOCK_ACCESS_LOGS.filter((l) => l.recordId === recordId)
  },

  /**
   * Updates record with validated AI Document Intelligence extraction.
   */
  async updateAiAnalysis(
    recordId: string,
    aiAnalysis: Record<string, any>
  ): Promise<MedicalRecord | null> {
    const record = await this.getRecordById(recordId)
    if (!record) return null

    const summary = aiAnalysis.summary || 'Document organized by AI'
    const docType = aiAnalysis.documentType || record.category

    if (isSupabaseConfigured()) {
      try {
        await supabaseAdmin
          .from('medical_records')
          .update({
            ai_status: 'Organized',
            ai_summary: summary,
            ai_metadata: aiAnalysis,
            category: docType,
            updated_at: new Date().toISOString(),
          })
          .eq('id', recordId)
      } catch (err: any) {
        console.warn(`[medicalRecordService] Supabase AI analysis update fallback: ${err.message}`)
      }
    }

    const inMemoryRec = MOCK_RECORDS.find((r) => r.id === recordId)
    if (inMemoryRec) {
      inMemoryRec.aiStatus = 'Organized'
      inMemoryRec.aiSummary = summary
      inMemoryRec.aiMetadata = aiAnalysis
      inMemoryRec.category = docType as RecordCategory
      inMemoryRec.updatedAt = new Date().toISOString()
      return inMemoryRec
    }

    record.aiStatus = 'Organized'
    record.aiSummary = summary
    record.aiMetadata = aiAnalysis
    record.category = docType as RecordCategory
    record.updatedAt = new Date().toISOString()
    return record
  },
}
