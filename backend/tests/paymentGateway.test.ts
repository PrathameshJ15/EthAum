import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'
import { paymentService, CANONICAL_PRICING } from '../src/services/payment/paymentService.js'
import { RazorpayProvider } from '../src/services/payment/RazorpayProvider.js'
import { StripeProvider } from '../src/services/payment/StripeProvider.js'

describe('Phase 30: Sovereign Real Payment Gateway Integration', () => {
  const patientAuthHeader = 'Bearer patient-token'
  const secondPatientAuthHeader = 'Bearer second-patient-token'
  const providerAuthHeader = 'Bearer provider-token'
  const adminAuthHeader = 'Bearer admin-token'

  beforeEach(() => {
    paymentService._resetState()
  })

  // 1. Public Configuration Endpoint
  describe('1. Payment Gateway Configuration & Public Metadata', () => {
    it('returns enabled payment provider, supported currencies, and test mode without exposing secrets', async () => {
      const res = await request(app).get('/api/v1/payments/config')

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.enabledProvider).toBeDefined()
      expect(res.body.data.supportedCurrencies).toContain('USD')
      expect(res.body.data.supportedCurrencies).toContain('INR')
      expect(res.body.data.keyId).toBeDefined()
      // Strict security: ensure no secret keys leaked
      expect(res.body.data.keySecret).toBeUndefined()
      expect(res.body.data.secretKey).toBeUndefined()
      expect(res.body.data.webhookSecret).toBeUndefined()
    })
  })

  // 2. Payment Order Creation & Server Price Authority
  describe('2. Payment Order Creation & Anti-Tamper Security', () => {
    it('creates a payment order for an authorized patient with server-authoritative amount ($500 for deposit)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
          customNotes: 'Pre-admission robotic surgery escrow reservation',
        })

      expect(res.status).toBe(201)
      expect(res.body.success).toBe(true)
      expect(res.body.data.payment).toBeDefined()
      expect(res.body.data.payment.paymentId).toMatch(/^PAY-ET-8492-/)
      expect(res.body.data.payment.amount).toBe(500)
      expect(res.body.data.payment.currency).toBe('USD')
      expect(res.body.data.payment.status).toBe('PENDING')
      expect(res.body.data.order.providerOrderId).toBeDefined()
    })

    it('rejects order creation when patient attempts to manipulate the amount (client price-tamper)', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
          amount: 1, // Tampered client price!
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(JSON.stringify(res.body.error)).toContain('Security violation')
    })

    it('rejects unauthenticated requests to create payment orders with 401', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
        })

      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
    })

    it('rejects order creation for non-existent case with 404', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-NONEXISTENT-9999',
          purpose: 'TREATMENT_DEPOSIT',
        })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })

    it('creates consultation fee order with canonical $150 USD charge', async () => {
      const res = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'CONSULTATION_FEE',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.payment.amount).toBe(CANONICAL_PRICING.CONSULTATION_FEE.amount)
      expect(res.body.data.payment.purpose).toBe('CONSULTATION_FEE')
    })
  })

  // 3. Cryptographic Signature Verification
  describe('3. Cryptographic Signature Verification & State Transitions', () => {
    it('successfully verifies payment with a valid provider signature and transitions booking to CONFIRMED', async () => {
      // Step A: Create order
      const orderRes = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
        })

      const payment = orderRes.body.data.payment
      const order = orderRes.body.data.order

      // Step B: Verify with valid signature
      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', patientAuthHeader)
        .send({
          paymentId: payment.paymentId,
          providerOrderId: order.providerOrderId,
          providerPaymentId: `pay_mock_${Date.now()}`,
          providerSignature: `mock_sig_valid_${Date.now()}`,
        })

      expect(verifyRes.status).toBe(200)
      expect(verifyRes.body.success).toBe(true)
      expect(verifyRes.body.data.status).toBe('SUCCEEDED')
      expect(verifyRes.body.data.receiptUrl).toBeDefined()

      // Step C: Verify related case reflects booked state
      const caseRes = await request(app)
        .get('/api/v1/cases/ET-8492')
        .set('Authorization', patientAuthHeader)

      expect(caseRes.body.data.status).toBe('BOOKED')
      expect(caseRes.body.data.journeyStage).toBe('Booked')
    })

    it('rejects forged/tampered cryptographic signature with 400', async () => {
      const orderRes = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
        })

      const payment = orderRes.body.data.payment
      const order = orderRes.body.data.order

      const verifyRes = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', patientAuthHeader)
        .send({
          paymentId: payment.paymentId,
          providerOrderId: order.providerOrderId,
          providerPaymentId: 'pay_tampered_123',
          providerSignature: 'forged_invalid_signature',
        })

      expect(verifyRes.status).toBe(400)
      expect(verifyRes.body.success).toBe(false)
      expect(verifyRes.body.error.message).toContain('signature verification failed')
    })

    it('rejects verification for non-existent payment with 404', async () => {
      const res = await request(app)
        .post('/api/v1/payments/verify')
        .set('Authorization', patientAuthHeader)
        .send({
          paymentId: 'PAY-NONEXISTENT',
          providerOrderId: 'order_123',
          providerPaymentId: 'pay_123',
          providerSignature: 'sig_123',
        })

      expect(res.status).toBe(404)
      expect(res.body.success).toBe(false)
    })
  })

  // 4. Provider-Specific Cryptographic Verification (Razorpay & Stripe)
  describe('4. Real Gateway Provider HMAC Verification Logic', () => {
    it('verifies valid Razorpay HMAC-SHA256 signature and rejects mismatched secret', () => {
      const rzp = new RazorpayProvider({
        keyId: 'rzp_test_sample',
        keySecret: 'secret_key_12345',
        webhookSecret: 'wh_secret_abcde',
      })

      const orderId = 'order_DA28374'
      const paymentId = 'pay_918237'
      const validSig = rzp.generateTestSignature(orderId, paymentId)

      expect(
        rzp.verifyPayment({
          providerOrderId: orderId,
          providerPaymentId: paymentId,
          providerSignature: validSig,
        })
      ).toBe(true)

      // Tampered paymentId
      expect(
        rzp.verifyPayment({
          providerOrderId: orderId,
          providerPaymentId: 'pay_TAMPERED',
          providerSignature: validSig,
        })
      ).toBe(false)
    })

    it('verifies valid Stripe timestamped signature header and rejects expired timestamp', () => {
      const stripe = new StripeProvider({
        publishableKey: 'pk_test_sample',
        secretKey: 'sk_test_sample',
        webhookSecret: 'whsec_sample_secret',
      })

      const payload = JSON.stringify({ id: 'evt_test_1', type: 'payment_intent.succeeded' })
      const validHeader = stripe.generateTestWebhookHeader(payload)

      expect(stripe.verifyWebhookSignature(payload, validHeader)).toBe(true)

      // Expired signature (> 300 seconds ago)
      const expiredTimestamp = Math.floor(Date.now() / 1000) - 600
      const expiredHeader = `t=${expiredTimestamp},v1=fake_signature`
      expect(stripe.verifyWebhookSignature(payload, expiredHeader)).toBe(false)
    })
  })

  // 5. Webhooks & Idempotency
  describe('5. Webhook Ingestion & Replay / Idempotency Protection', () => {
    it('rejects webhooks with missing signature header with 400', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .send({
          event_id: 'evt_101',
          event: 'payment.captured',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Missing payment provider cryptographic signature')
    })

    it('rejects webhooks with invalid cryptographic signature', async () => {
      const res = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-mock-signature', 'invalid_signature')
        .send({
          event_id: 'evt_102',
          event: 'payment.captured',
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Invalid webhook cryptographic signature')
    })

    it('processes valid webhook event and handles duplicate delivery idempotently', async () => {
      // Step A: Create pending order
      const orderRes = await request(app)
        .post('/api/v1/payments/orders')
        .set('Authorization', patientAuthHeader)
        .send({
          caseId: 'ET-8492',
          purpose: 'TREATMENT_DEPOSIT',
        })

      const order = orderRes.body.data.order
      const payment = orderRes.body.data.payment

      const webhookPayload = {
        event_id: `evt_idemp_${Date.now()}`,
        event: 'payment.captured',
        order_id: order.providerOrderId,
        payment_id: `pay_webhook_${Date.now()}`,
        amount: 500,
        currency: 'USD',
        status: 'SUCCEEDED',
      }

      // Step B: First delivery (processed)
      const firstRes = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-mock-signature', 'mock_valid_signature_123')
        .send(webhookPayload)

      expect(firstRes.status).toBe(200)
      expect(firstRes.body.success).toBe(true)
      expect(firstRes.body.data.processed).toBe(true)
      expect(firstRes.body.data.idempotent).toBe(false)

      // Verify payment was marked SUCCEEDED
      const getRes = await request(app)
        .get(`/api/v1/payments/${payment.id}`)
        .set('Authorization', patientAuthHeader)

      expect(getRes.body.data.status).toBe('SUCCEEDED')

      // Step C: Second duplicate delivery (idempotently ignored without duplicate side effects)
      const duplicateRes = await request(app)
        .post('/api/v1/payments/webhook')
        .set('x-mock-signature', 'mock_valid_signature_123')
        .send(webhookPayload)

      expect(duplicateRes.status).toBe(200)
      expect(duplicateRes.body.success).toBe(true)
      expect(duplicateRes.body.data.idempotent).toBe(true)
      expect(duplicateRes.body.data.processed).toBe(true)
    })
  })

  // 6. Payment History & Authorization Boundaries
  describe('6. Payment History & Multi-Tenant Authorization', () => {
    it('allows patient to inspect their own payment history', async () => {
      const res = await request(app)
        .get('/api/v1/payments/history')
        .set('Authorization', patientAuthHeader)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].patientId).toBe('pat-1')
    })

    it('rejects unauthenticated requests to payment history with 401', async () => {
      const res = await request(app).get('/api/v1/payments/history')
      expect(res.status).toBe(401)
    })

    it('allows accessing payments scoped to a specific case via /cases/:id/payments', async () => {
      const res = await request(app)
        .get('/api/v1/cases/ET-8492/payments')
        .set('Authorization', patientAuthHeader)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
      expect(res.body.data[0].caseId).toBe('ET-8492')
    })

    it('allows administrator to view all payments across cases', async () => {
      const res = await request(app)
        .get('/api/v1/payments/history')
        .set('Authorization', adminAuthHeader)

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(Array.isArray(res.body.data)).toBe(true)
    })
  })

  // 7. Refund Processing & Bounds
  describe('7. Refund Operations & Security Controls', () => {
    it('allows administrator to process a full refund on a succeeded payment', async () => {
      const res = await request(app)
        .post('/api/v1/payments/pay-seed-1001/refund')
        .set('Authorization', adminAuthHeader)
        .send({
          amount: 150,
          reason: 'Patient rescheduled admission date upon clinical request',
        })

      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('REFUNDED')
      expect(res.body.data.refundStatus).toBe('FULL')
      expect(res.body.data.refundedAmount).toBe(150)
    })

    it('rejects refund request when amount exceeds remaining payment balance', async () => {
      const res = await request(app)
        .post('/api/v1/payments/pay-seed-1001/refund')
        .set('Authorization', adminAuthHeader)
        .send({
          amount: 999999, // Exceeds balance!
        })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.error.message).toContain('Refund amount exceeds remaining refundable balance')
    })

    it('rejects patient attempts to self-initiate refunds with 403 Forbidden', async () => {
      const res = await request(app)
        .post('/api/v1/payments/pay-seed-1001/refund')
        .set('Authorization', patientAuthHeader)
        .send({
          amount: 150,
        })

      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
    })
  })
})
