import { Request, Response, NextFunction } from 'express'
import { fhirService } from '../services/fhirService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { UnauthorizedError, ValidationError } from '../utils/apiError.js'

export const fhirController = {
  /**
   * Validates any FHIR R4 resource or Bundle without requiring case context.
   */
  async validate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = fhirService.validateResourceOrBundle(req.body)
      if (!result.valid) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'FHIR R4 validation failed with schema discrepancies',
            details: result.errors,
          },
          data: result,
        })
      }
      return sendSuccess(res, result, 'FHIR R4 validation completed')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Previews FHIR export for an authorized case.
   */
  async previewExport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to preview FHIR export')
      }
      const preview = await fhirService.previewCaseFhirExport(req.params.id as string, req.user)
      return sendSuccess(res, preview, 'FHIR R4 case export preview generated')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Exports an authorized MedicalCase as an HL7 FHIR R4 Bundle.
   */
  async exportBundle(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to export FHIR records')
      }
      const bundle = await fhirService.exportCaseAsFhirBundle(req.params.id as string, req.user)

      res.setHeader('Content-Type', 'application/fhir+json')
      if (req.query.download === 'true') {
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="ethaum-case-${req.params.id as string}-fhir-r4.json"`
        )
      }

      return res.status(200).json(bundle)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Stages an incoming FHIR Bundle for review before merging into case records.
   */
  async stageImport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to stage FHIR records')
      }
      const staged = await fhirService.stageFhirBundleImport(req.params.id as string, req.body, req.user)
      return sendSuccess(res, staged, 'FHIR R4 Bundle staged for clinical review', 201)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Confirms an authorized staged import, merging non-duplicate medical records.
   */
  async confirmImport(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to confirm import')
      }
      const stagingId = req.body?.stagingId
      if (!stagingId) {
        throw new ValidationError('Field `stagingId` is required to confirm an import.')
      }
      const result = await fhirService.confirmStagedImport(req.params.id as string, stagingId, req.user)
      return sendSuccess(res, result, result.message)
    } catch (err) {
      next(err)
    }
  },

  /**
   * Retrieves audit ledger of FHIR operations.
   */
  async getOperations(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required to view FHIR operations')
      }
      const ops = fhirService.getOperationsHistory(req.params.id as string)
      return sendSuccess(res, ops, 'FHIR operations history retrieved')
    } catch (err) {
      next(err)
    }
  },

  /**
   * Generates synthetic sample FHIR R4 Bundle for client-side testing.
   */
  async getSyntheticSample(_req: Request, res: Response, next: NextFunction) {
    try {
      const sample = fhirService.getSyntheticSampleBundle()
      return sendSuccess(res, sample, 'Synthetic sample HL7 FHIR R4 Bundle retrieved')
    } catch (err) {
      next(err)
    }
  },
}
