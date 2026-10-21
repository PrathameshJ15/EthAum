import { Router } from 'express'
import {
  paymentController,
  createOrderSchema,
  verifyPaymentSchema,
  refundPaymentSchema,
} from '../controllers/paymentController.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'

export const paymentRoutes = Router()

// Public Configuration (Safe public keys, active provider, supported currencies)
paymentRoutes.get('/config', paymentController.getConfig)

// Webhook ingestion (Public endpoint protected by HMAC-SHA256 signatures)
paymentRoutes.post('/webhook', paymentController.handleWebhook)
paymentRoutes.post('/webhook/:provider', paymentController.handleWebhook)

// Protected Payment Operations
paymentRoutes.get('/history', requireAuth, paymentController.listPayments)
paymentRoutes.get('/:id', requireAuth, paymentController.getPaymentById)

paymentRoutes.post(
  '/orders',
  requireAuth,
  validate({ body: createOrderSchema }),
  paymentController.createOrder
)

paymentRoutes.post(
  '/verify',
  requireAuth,
  validate({ body: verifyPaymentSchema }),
  paymentController.verifyPayment
)

paymentRoutes.post(
  '/:id/refund',
  requireAuth,
  validate({ body: refundPaymentSchema }),
  paymentController.refundPayment
)
