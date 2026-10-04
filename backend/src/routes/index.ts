import { Router } from 'express'
import { healthRoutes } from './healthRoutes.js'
import { authRoutes } from './authRoutes.js'
import { userRoutes } from './userRoutes.js'
import { patientRoutes } from './patientRoutes.js'
import { providerRoutes } from './providerRoutes.js'
import { doctorRoutes } from './doctorRoutes.js'
import { treatmentRoutes } from './treatmentRoutes.js'
import { caseRoutes } from './caseRoutes.js'
import { medicalRecordRoutes } from './medicalRecordRoutes.js'
import { quoteRoutes } from './quoteRoutes.js'
import { appointmentRoutes } from './appointmentRoutes.js'
import { messagingRoutes } from './messagingRoutes.js'
import { journeyRoutes } from './journeyRoutes.js'
import { notificationRoutes } from './notificationRoutes.js'
import { bookingRoutes } from './bookingRoutes.js'
import { aftercareRoutes } from './aftercareRoutes.js'

import { requireAuth, requireAdmin } from '../middleware/auth.js'
import { sendSuccess } from '../utils/apiResponse.js'

export const apiRouter = Router()

// Health check endpoint
apiRouter.use('/health', healthRoutes)

// Domain endpoints
apiRouter.use('/auth', authRoutes)
apiRouter.use('/users', userRoutes)
apiRouter.use('/patients', patientRoutes)
apiRouter.use('/providers', providerRoutes)
apiRouter.use('/doctors', doctorRoutes)
apiRouter.use('/treatments', treatmentRoutes)
apiRouter.use('/cases', caseRoutes)
apiRouter.use('/medical-records', medicalRecordRoutes)
apiRouter.use('/quotes', quoteRoutes)
apiRouter.use('/appointments', appointmentRoutes)
apiRouter.use('/bookings', bookingRoutes)
apiRouter.use('/messages', messagingRoutes)
apiRouter.use('/journey', journeyRoutes)
apiRouter.use('/aftercare', aftercareRoutes)
apiRouter.use('/notifications', notificationRoutes)

// Admin compliance & audit endpoint
apiRouter.get('/admin/audit-ledger', requireAuth, requireAdmin, (_req, res) => {
  return sendSuccess(res, { status: 'secure', auditEntries: [] }, 'Admin sovereign audit ledger')
})


