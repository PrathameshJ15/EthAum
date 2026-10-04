import { Router } from 'express'
import {
  medicalRecordController,
  requestUploadUrlSchema,
  grantPermissionSchema,
  updatePermissionsSchema,
  analyzeRecordSchema,
  analyzeTextSchema,
} from '../controllers/medicalRecordController.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRecordAccess, requireRecordOwnership } from '../middleware/recordAuth.js'
import { validate } from '../middleware/validate.js'

export const medicalRecordRoutes = Router()

// List sovereign records
medicalRecordRoutes.get('/', requireAuth, medicalRecordController.listRecords)

// Request signed upload URL to private storage bucket
medicalRecordRoutes.post(
  '/upload-url',
  requireAuth,
  validate({ body: requestUploadUrlSchema }),
  medicalRecordController.requestUploadUrl
)

// Retrieve record metadata
medicalRecordRoutes.get('/:id', requireAuth, requireRecordAccess, medicalRecordController.getRecordById)

// Generate signed download URL for private medical file
medicalRecordRoutes.get(
  '/:id/download-url',
  requireAuth,
  requireRecordAccess,
  medicalRecordController.getDownloadUrl
)

// Patient grants explicit access to a provider (Patient Ownership required)
medicalRecordRoutes.post(
  '/:id/permissions',
  requireAuth,
  requireRecordOwnership,
  validate({ body: grantPermissionSchema }),
  medicalRecordController.grantPermission
)

// Patient revokes access from a provider (Patient Ownership required)
medicalRecordRoutes.delete(
  '/:id/permissions/:providerId',
  requireAuth,
  requireRecordOwnership,
  medicalRecordController.revokePermission
)

// Bulk update permissions (Patient Ownership required)
medicalRecordRoutes.patch(
  '/:id/permissions',
  requireAuth,
  requireRecordOwnership,
  validate({ body: updatePermissionsSchema }),
  medicalRecordController.updatePermissions
)

// Audit trail access logs (requires authorized record access)
medicalRecordRoutes.get(
  '/:id/access-logs',
  requireAuth,
  requireRecordAccess,
  medicalRecordController.getAccessLogs
)

// Direct text analysis with Groq AI Document Intelligence
medicalRecordRoutes.post(
  '/analyze-text',
  requireAuth,
  validate({ body: analyzeTextSchema }),
  medicalRecordController.analyzeDirectTextWithAi
)

// Analyze uploaded medical record with Groq AI Document Intelligence (Patient Ownership required)
medicalRecordRoutes.post(
  '/:id/analyze-ai',
  requireAuth,
  requireRecordOwnership,
  validate({ body: analyzeRecordSchema }),
  medicalRecordController.analyzeRecordWithAi
)
