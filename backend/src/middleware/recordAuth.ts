import { Request, Response, NextFunction } from 'express'
import { ForbiddenError, NotFoundError, UnauthorizedError } from '../utils/apiError.js'
import { medicalRecordService } from '../services/medicalRecordService.js'

/**
 * Object-Level Authorization Middleware for Medical Records
 * Enforces:
 * 1. Patient may ONLY access their own records
 * 2. Provider may ONLY access records explicitly shared with their provider ID
 * 3. Admin access is controlled and logged for auditability
 */
export async function requireRecordAccess(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user
    if (!user) {
      throw new UnauthorizedError('Authentication required to access medical records')
    }

    const recordId = (req.params.recordId || req.params.id) as string
    if (!recordId) {
      throw new NotFoundError('Medical record ID must be specified')
    }

    const record = await medicalRecordService.getRecordById(recordId)
    if (!record) {
      throw new NotFoundError(`Medical record with ID '${recordId}' does not exist`)
    }

    const userRole = (user.role || '').toLowerCase()

    // 1. Patient Access Check
    if (userRole === 'patient') {
      const isOwner =
        record.patientId === user.id ||
        (user.patientId && record.patientId === user.patientId)

      if (!isOwner) {
        throw new ForbiddenError(
          'Access denied: You are only authorized to view your own sovereign medical records'
        )
      }
    }

    // 2. Provider Access Check
    if (userRole === 'provider') {
      const providerId = user.providerId || user.id
      const isExplicitlyAuthorized = await medicalRecordService.hasActivePermission(
        recordId,
        providerId
      )

      if (!isExplicitlyAuthorized) {
        throw new ForbiddenError(
          'Access denied: This medical record has not been shared with your hospital or clinical panel'
        )
      }
    }

    // 3. Admin Access Audit
    if (userRole === 'admin') {
      await medicalRecordService.logAccess({
        recordId,
        accessedBy: user.id,
        accessRole: 'admin',
        action: 'VIEW',
        ipAddress: req.ip,
        timestamp: new Date().toISOString(),
      })
    }

    // Attach verified record to request for downstream handlers
    ;(req as any).medicalRecord = record

    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Object-Level Authorization Middleware for Medical Record Ownership
 * Enforces the core rule:
 * Patient owns and controls access to records.
 * Only the patient who owns the record (or admin) can:
 * - Grant permissions
 * - Revoke permissions
 * - Update permissions
 * - View full access audit logs
 * - Trigger AI processing on the record
 *
 * Providers (even with active viewing permission) CANNOT modify permissions or manage records.
 */
export async function requireRecordOwnership(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user
    if (!user) {
      throw new UnauthorizedError('Authentication required to manage medical records')
    }

    const recordId = (req.params.recordId || req.params.id) as string
    if (!recordId) {
      throw new NotFoundError('Medical record ID must be specified')
    }

    const record = await medicalRecordService.getRecordById(recordId)
    if (!record) {
      throw new NotFoundError(`Medical record with ID '${recordId}' does not exist`)
    }

    const userRole = (user.role || '').toLowerCase()

    if (userRole === 'admin') {
      ;(req as any).medicalRecord = record
      return next()
    }

    if (userRole === 'patient') {
      const isOwner =
        record.patientId === user.id ||
        (user.patientId && record.patientId === user.patientId)

      if (!isOwner) {
        throw new ForbiddenError(
          'Access denied: You only have ownership rights over your own sovereign medical records'
        )
      }

      ;(req as any).medicalRecord = record
      return next()
    }

    // Providers or other roles cannot own or control permissions
    throw new ForbiddenError(
      'Access denied: Only the patient owner has permission to control access to this medical record'
    )
  } catch (err) {
    next(err)
  }
}
