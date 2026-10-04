import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { medicalRecordService } from '../services/medicalRecordService.js'
import { storageService, SUPPORTED_RECORD_CATEGORIES } from '../services/storageService.js'
import { groqService } from '../services/groqService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../utils/apiError.js'
import { RecordCategory } from '../types/index.js'

export const requestUploadUrlSchema = z.object({
  caseId: z.string().min(1, 'Case ID is required'),
  fileName: z.string().min(1, 'File name is required'),
  category: z.enum([
    'MRI',
    'X-Ray',
    'CT',
    'Blood Reports',
    'Prescriptions',
    'Medical History',
    'Other',
    'CT Scan',
    'Blood Report',
    'Biopsy',
    'Clinical Notes',
  ] as [string, ...string[]]),
  type: z.string().optional().default('Clinical Imaging Document'),
  size: z.string().optional().default('Unknown'),
  sizeBytes: z.number().optional(),
})

export const grantPermissionSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
})

export const updatePermissionsSchema = z.object({
  providerIds: z.array(z.string()).min(0),
})

export const analyzeRecordSchema = z.object({
  documentText: z.string().optional(),
  caseContext: z.string().optional(),
})

export const analyzeTextSchema = z.object({
  documentName: z.string().min(1, 'Document name is required'),
  documentText: z.string().min(1, 'Document text is required'),
  declaredCategory: z.string().optional(),
  caseContext: z.string().optional(),
})

export const medicalRecordController = {
  async listRecords(req: Request, res: Response, next: NextFunction) {
    try {
      const caseId = req.query.caseId as string

      // Security enforcement for Providers
      if (req.user?.role === 'provider') {
        const providerId = req.user.providerId || req.user.id
        if (caseId) {
          const records = await medicalRecordService.listRecordsByCase(caseId)
          const authorizedRecords = records.filter(
            (r) => r.permissions && r.permissions.includes(providerId)
          )
          return sendSuccess(res, authorizedRecords)
        } else {
          const records = await medicalRecordService.listRecordsSharedWithProvider(providerId)
          return sendSuccess(res, records)
        }
      }

      if (caseId) {
        const records = await medicalRecordService.listRecordsByCase(caseId)
        if (req.user?.role === 'patient') {
          const patientId = req.user.patientId || req.user.id
          const authorized = records.filter((r) => r.patientId === patientId)
          return sendSuccess(res, authorized)
        }
        return sendSuccess(res, records)
      }

      const patientId = req.user?.patientId || req.user?.id
      if (!patientId) {
        throw new UnauthorizedError()
      }
      const records = await medicalRecordService.listRecordsByPatient(patientId)
      return sendSuccess(res, records)
    } catch (err) {
      next(err)
    }
  },

  async getRecordById(req: Request, res: Response, next: NextFunction) {
    try {
      const record =
        (req as any).medicalRecord ||
        (await medicalRecordService.getRecordById(req.params.id as string))

      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      // Log access audit trail
      if (req.user) {
        await medicalRecordService.logAccess({
          recordId: record.id,
          accessedBy: req.user.id,
          accessRole: req.user.role,
          action: 'VIEW',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
        })
      }

      return sendSuccess(res, record)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Generates a signed upload URL to the private medical-records bucket.
   * Only authorized patients (for their own case) or admins may request upload URLs.
   */
  async requestUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to upload medical records')
      }

      const { caseId, fileName, category, type, size, sizeBytes } = req.body
      const patientId = req.user.patientId || req.user.id

      // Verify that patient owns the case if user is patient
      if (req.user.role === 'patient') {
        const { caseService } = await import('../services/caseService.js')
        const c = await caseService.getCaseById(caseId)
        if (c && c.patientId !== patientId) {
          throw new ForbiddenError('Access denied: You can only upload medical records to your own cases')
        }
      }

      // Generate secure signed upload URL
      const signedUpload = await storageService.createSignedUploadUrl(
        patientId,
        caseId,
        fileName,
        category as RecordCategory
      )

      // Register preliminary medical record metadata
      const newRecord = await medicalRecordService.createRecord({
        caseId,
        patientId,
        name: fileName,
        category: category as RecordCategory,
        type,
        size,
        sizeBytes,
        storagePath: signedUpload.storagePath,
      })

      // Log access audit entry for upload
      await medicalRecordService.logAccess({
        recordId: newRecord.id,
        accessedBy: req.user.id,
        accessRole: req.user.role,
        action: 'UPLOAD',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString(),
      })

      return sendSuccess(
        res,
        {
          uploadUrl: signedUpload.uploadUrl,
          storagePath: signedUpload.storagePath,
          bucket: signedUpload.bucket,
          expiresIn: signedUpload.expiresIn,
          record: newRecord,
        },
        'Secure upload URL generated successfully',
        201
      )
    } catch (err) {
      next(err)
    }
  },

  /**
   * Generates a signed download URL for an authorized viewer.
   */
  async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const record =
        (req as any).medicalRecord ||
        (await medicalRecordService.getRecordById(req.params.id as string))

      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      if (!record.storagePath) {
        throw new NotFoundError('File storage path not found for this medical record')
      }

      const expiresInSeconds = 3600 // 1 hour
      const signedDownload = await storageService.createSignedDownloadUrl(
        record.storagePath,
        expiresInSeconds
      )

      // Audit download action
      if (req.user) {
        await medicalRecordService.logAccess({
          recordId: record.id,
          accessedBy: req.user.id,
          accessRole: req.user.role,
          action: 'DOWNLOAD',
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          timestamp: new Date().toISOString(),
        })
      }

      return sendSuccess(res, signedDownload, 'Signed download URL generated')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Patient grants access to a hospital provider.
   */
  async grantPermission(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const record = (req as any).medicalRecord || (await medicalRecordService.getRecordById(recordId))
      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      if (req.user?.role === 'patient') {
        const patientId = req.user.patientId || req.user.id
        if (record.patientId !== patientId) {
          throw new ForbiddenError('Access denied: Only the record owner can grant access permissions')
        }
      } else if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Only the patient owner can grant access permissions')
      }

      const { providerId } = req.body
      const patientId = req.user?.patientId || req.user?.id || 'pat-1'

      const perm = await medicalRecordService.grantPermission(recordId, providerId, patientId)
      if (!perm) {
        throw new NotFoundError('Medical record not found')
      }

      return sendSuccess(res, perm, `Access granted to provider '${providerId}'`, 201)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Patient revokes access from a hospital provider.
   */
  async revokePermission(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const record = (req as any).medicalRecord || (await medicalRecordService.getRecordById(recordId))
      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      if (req.user?.role === 'patient') {
        const patientId = req.user.patientId || req.user.id
        if (record.patientId !== patientId) {
          throw new ForbiddenError('Access denied: Only the record owner can revoke access permissions')
        }
      } else if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Only the patient owner can revoke access permissions')
      }

      const providerId = req.params.providerId as string
      const patientId = req.user?.patientId || req.user?.id || 'pat-1'

      const success = await medicalRecordService.revokePermission(recordId, providerId, patientId)
      if (!success) {
        throw new NotFoundError('Medical record or permission not found')
      }

      return sendSuccess(res, { recordId, providerId, status: 'REVOKED' }, `Access revoked from provider '${providerId}'`)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Bulk update permissions (for backwards compatibility).
   */
  async updatePermissions(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const record = (req as any).medicalRecord || (await medicalRecordService.getRecordById(recordId))
      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      if (req.user?.role === 'patient') {
        const patientId = req.user.patientId || req.user.id
        if (record.patientId !== patientId) {
          throw new ForbiddenError('Access denied: Only the record owner can update sharing permissions')
        }
      } else if (req.user?.role !== 'admin') {
        throw new ForbiddenError('Access denied: Only the patient owner can update sharing permissions')
      }

      const { providerIds } = req.body
      const patientId = req.user?.patientId || req.user?.id || 'pat-1'
      const updated = await medicalRecordService.updatePermissions(
        recordId,
        providerIds,
        patientId
      )
      if (!updated) {
        throw new NotFoundError('Medical record not found')
      }
      return sendSuccess(res, updated, 'Record sharing permissions updated successfully')
    } catch (err) {
      next(err)
    }
  },

  async getAccessLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const record = (req as any).medicalRecord || (await medicalRecordService.getRecordById(recordId))
      if (!record) {
        throw new NotFoundError('Medical record not found')
      }

      // requireRecordAccess has already validated object-level authorization.
      // Defensively verify for patient role
      if (req.user?.role === 'patient') {
        const patientId = req.user.patientId || req.user.id
        if (record.patientId !== patientId) {
          throw new ForbiddenError('Access denied: You can only view audit logs for your own records')
        }
      }

      const logs = await medicalRecordService.getAccessLogs(recordId)
      return sendSuccess(res, logs)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Process an existing medical record with Groq AI Document Intelligence.
   */
  async analyzeRecordWithAi(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const record = await medicalRecordService.getRecordById(recordId)
      if (!record) {
        throw new NotFoundError(`Medical record #${recordId} not found`)
      }

      const { documentText, caseContext } = req.body || {}

      // Call centralized Groq service (never direct from controller to Groq SDK)
      const aiResult = await groqService.analyzeDocument({
        documentName: record.name,
        documentText,
        declaredCategory: record.category,
        caseContext,
      })

      // Save validated AI metadata to database / record store
      const updatedRecord = await medicalRecordService.updateAiAnalysis(record.id, aiResult)

      return sendSuccess(
        res,
        {
          record: updatedRecord,
          analysis: aiResult,
        },
        'Medical record successfully analyzed by Groq AI Document Intelligence'
      )
    } catch (err) {
      next(err)
    }
  },

  /**
   * Direct text analysis for clinical notes or document previews.
   */
  async analyzeDirectTextWithAi(req: Request, res: Response, next: NextFunction) {
    try {
      const { documentName, documentText, declaredCategory, caseContext } = req.body

      const aiResult = await groqService.analyzeDocument({
        documentName,
        documentText,
        declaredCategory,
        caseContext,
      })

      return sendSuccess(
        res,
        aiResult,
        'Document content successfully analyzed by Groq AI Document Intelligence'
      )
    } catch (err) {
      next(err)
    }
  },

  async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const recordId = req.params.id as string
      const logs = await medicalRecordService.getAccessLogs(recordId)
      return sendSuccess(res, logs, 'Record access audit logs retrieved successfully')
    } catch (err) {
      next(err)
    }
  },
}
