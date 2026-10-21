import crypto from 'node:crypto'
import {
  PaymentRecord,
  PaymentStatus,
  PaymentPurpose,
  PaymentProviderName,
  CreateOrderInput,
  VerifyPaymentInput,
  PaymentWebhookEventRecord,
} from '../../types/index.js'
import { env } from '../../config/env.js'
import { isSupabaseConfigured, getSupabaseAdmin } from '../../config/supabase.js'
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/apiError.js'
import { caseService } from '../caseService.js'
import { bookingService } from '../bookingService.js'
import { journeyService } from '../journeyService.js'
import { PaymentProvider } from './PaymentProvider.js'
import { RazorpayProvider } from './RazorpayProvider.js'
import { StripeProvider } from './StripeProvider.js'
import { MockPaymentProvider } from './MockPaymentProvider.js'

// Canonical prices enforced by EthAum server (anti-tamper)
export const CANONICAL_PRICING: Record<PaymentPurpose, { amount: number; currency: string }> = {
  CONSULTATION_FEE: { amount: 150, currency: 'USD' },
  SECOND_OPINION: { amount: 150, currency: 'USD' },
  TREATMENT_DEPOSIT: { amount: 500, currency: 'USD' },
  HOSPITAL_ADMISSION: { amount: 500, currency: 'USD' },
}

// In-memory cache for reliable offline/test execution
const INITIAL_SEED: PaymentRecord = {
  id: 'pay-seed-1001',
  paymentId: 'PAY-ET-8492-9182',
  userId: 'usr-patient-1',
  patientId: 'pat-1',
  patientName: 'Eleanor Vance',
  caseId: 'ET-8492',
  bookingId: 'bk-1001',
  provider: 'mock',
  providerOrderId: 'order_mock_seed9182',
  providerPaymentId: 'pay_mock_seed9182',
  amount: 150,
  currency: 'USD',
  status: 'SUCCEEDED',
  purpose: 'CONSULTATION_FEE',
  refundStatus: 'NONE',
  refundedAmount: 0,
  receiptUrl: 'https://ethaum.health/receipts/PAY-ET-8492-9182',
  createdAt: '2026-10-02T12:05:00Z',
  updatedAt: '2026-10-02T12:05:00Z',
}

const PAYMENTS_CACHE: PaymentRecord[] = [{ ...INITIAL_SEED }]
const WEBHOOK_EVENTS_CACHE: PaymentWebhookEventRecord[] = []

export class PaymentService {
  private providers: Map<PaymentProviderName, PaymentProvider> = new Map()

  constructor() {
    this.providers.set('razorpay', new RazorpayProvider())
    this.providers.set('stripe', new StripeProvider())
    this.providers.set('mock', new MockPaymentProvider())
  }

  getProvider(name?: PaymentProviderName): PaymentProvider {
    const selectedName = name || (env.PAYMENT_PROVIDER as PaymentProviderName) || 'mock'
    const provider = this.providers.get(selectedName)
    if (!provider) {
      return this.providers.get('mock')!
    }
    return provider
  }

  getPublicConfig(): {
    enabledProvider: PaymentProviderName
    keyId?: string
    supportedCurrencies: string[]
    testMode: boolean
  } {
    const activeProvider = (env.PAYMENT_PROVIDER as PaymentProviderName) || 'mock'
    let keyId: string | undefined = undefined

    if (activeProvider === 'razorpay') {
      keyId = env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
    } else if (activeProvider === 'stripe') {
      keyId = env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'
    } else {
      keyId = 'mock_key_live_testing'
    }

    return {
      enabledProvider: activeProvider,
      keyId,
      supportedCurrencies: ['USD', 'INR', 'EUR', 'GBP', 'THB', 'AED'],
      testMode: env.NODE_ENV !== 'production' || activeProvider === 'mock',
    }
  }

  async createPaymentOrder(
    input: CreateOrderInput,
    user: { id: string; role: string; patientId?: string; name?: string }
  ): Promise<{ payment: PaymentRecord; order: any }> {
    // 1. Verify Case exists
    const medicalCase = await caseService.getCaseById(input.caseId)
    if (!medicalCase) {
      throw new NotFoundError(`Medical case #${input.caseId} not found`)
    }

    // 2. Authorize patient
    const patientId = medicalCase.patientId
    if (user.role === 'patient' && user.patientId && user.patientId !== patientId && user.id !== patientId) {
      throw new ForbiddenError('You are not authorized to create payments for this medical case')
    }

    // 3. Determine authoritative pricing (server-side only)
    const pricingRule = CANONICAL_PRICING[input.purpose]
    if (!pricingRule) {
      throw new ValidationError(`Unsupported payment purpose: '${input.purpose}'`)
    }

    let authoritativeAmount = pricingRule.amount
    let authoritativeCurrency = medicalCase.currency || pricingRule.currency

    // If associated with a confirmed booking deposit
    if (input.purpose === 'TREATMENT_DEPOSIT' && medicalCase.bookingDetails?.depositAmount) {
      authoritativeAmount = medicalCase.bookingDetails.depositAmount
    }

    // 4. Check for existing successful payment for this purpose to prevent duplicate charges
    const existingSuccessful = PAYMENTS_CACHE.find((p) => {
      if (p.caseId !== input.caseId || p.status !== 'SUCCEEDED' || p.purpose !== input.purpose) {
        return false
      }
      if (input.appointmentId && p.appointmentId) {
        return p.appointmentId === input.appointmentId
      }
      if (input.bookingId && p.bookingId) {
        return p.bookingId === input.bookingId
      }
      if (input.purpose === 'TREATMENT_DEPOSIT' && medicalCase.bookingDetails?.paymentStatus === 'CONFIRMED') {
        return true
      }
      return false
    })

    if (existingSuccessful) {
      throw new ValidationError(
        `A confirmed payment (${existingSuccessful.paymentId}) already exists for this case and purpose.`
      )
    }

    // 5. Select active payment provider
    const provider = this.getProvider()

    // 6. Generate internal EthAum payment reference
    const paymentId = `PAY-${medicalCase.id}-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

    // 7. Request order creation from provider
    const orderResult = await provider.createOrder({
      paymentId,
      caseId: medicalCase.id,
      amount: authoritativeAmount,
      currency: authoritativeCurrency,
      purpose: input.purpose,
      patientId,
      patientName: user.name || medicalCase.patientName,
      receiptNote: input.customNotes,
    })

    // 8. Create internal PaymentRecord
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      paymentId,
      userId: user.id,
      patientId,
      patientName: user.name || medicalCase.patientName,
      caseId: medicalCase.id,
      bookingId: input.bookingId || medicalCase.bookingDetails?.id,
      appointmentId: input.appointmentId,
      provider: provider.name,
      providerOrderId: orderResult.providerOrderId,
      amount: authoritativeAmount,
      currency: authoritativeCurrency,
      status: 'PENDING',
      purpose: input.purpose,
      idempotencyKey: input.idempotencyKey,
      refundStatus: 'NONE',
      refundedAmount: 0,
      metadata: {
        ...orderResult.metadata,
        notes: input.customNotes,
        treatmentName: medicalCase.treatmentName,
        hospitalName: medicalCase.selectedProviderName,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    PAYMENTS_CACHE.unshift(newPayment)

    // Sync to Supabase if configured
    if (isSupabaseConfigured()) {
      try {
        await getSupabaseAdmin().from('payments').insert({
          payment_id: newPayment.paymentId,
          user_id: user.id.startsWith('usr-') ? null : user.id,
          patient_id: newPayment.patientId,
          patient_name: newPayment.patientName,
          case_id: newPayment.caseId,
          booking_id: newPayment.bookingId,
          appointment_id: newPayment.appointmentId,
          provider: newPayment.provider,
          provider_order_id: newPayment.providerOrderId,
          amount: newPayment.amount,
          currency: newPayment.currency,
          status: newPayment.status,
          purpose: newPayment.purpose,
          idempotency_key: newPayment.idempotencyKey,
          metadata: newPayment.metadata,
        })
      } catch (err) {
        console.warn('[paymentService] Supabase payment insert fallback to memory:', err)
      }
    }

    return {
      payment: newPayment,
      order: orderResult,
    }
  }

  async verifyPayment(
    input: VerifyPaymentInput,
    user: { id: string; role: string; patientId?: string }
  ): Promise<PaymentRecord> {
    // 1. Locate payment record
    const payment = PAYMENTS_CACHE.find(
      (p) => p.paymentId === input.paymentId || p.providerOrderId === input.providerOrderId
    )

    if (!payment) {
      throw new NotFoundError(`Payment record not found for verification`)
    }

    // 2. Authorize
    if (user.role === 'patient' && user.patientId && user.patientId !== payment.patientId && user.id !== payment.patientId) {
      throw new ForbiddenError('You are not authorized to verify this payment')
    }

    // If already verified
    if (payment.status === 'SUCCEEDED') {
      return payment
    }

    // 3. Cryptographic signature check
    const provider = this.getProvider(payment.provider)
    const isValid = provider.verifyPayment({
      providerOrderId: input.providerOrderId,
      providerPaymentId: input.providerPaymentId,
      providerSignature: input.providerSignature,
    })

    if (!isValid) {
      payment.status = 'FAILED'
      payment.failureReason = 'Cryptographic signature verification failed'
      payment.updatedAt = new Date().toISOString()
      throw new ValidationError('Payment signature verification failed. Transaction rejected.')
    }

    // 4. Mark successful
    payment.status = 'SUCCEEDED'
    payment.providerPaymentId = input.providerPaymentId
    payment.receiptUrl = `https://ethaum.health/receipts/${payment.paymentId}`
    payment.updatedAt = new Date().toISOString()

    // 5. Update associated Booking and Case workflow
    await this.applyPaymentSuccessTransitions(payment)

    return payment
  }

  async applyPaymentSuccessTransitions(payment: PaymentRecord): Promise<void> {
    try {
      const medicalCase = await caseService.getCaseById(payment.caseId)
      if (medicalCase) {
        // If treatment deposit or admission, confirm booking
        if (payment.purpose === 'TREATMENT_DEPOSIT' || payment.purpose === 'HOSPITAL_ADMISSION') {
          if (medicalCase.bookingDetails) {
            medicalCase.bookingDetails.paymentStatus = 'CONFIRMED'
            medicalCase.bookingDetails.status = 'CONFIRMED'
          }
          medicalCase.status = 'BOOKED' as any
          medicalCase.journeyStage = 'Booked'
          medicalCase.updatedAt = new Date().toISOString()

          // Add Journey Event
          await journeyService.addJourneyEvent({
            caseId: medicalCase.id,
            stage: 'Booked',
            title: 'Escrow Payment Confirmed',
            description: `Payment of $${payment.amount} ${payment.currency} verified via ${payment.provider.toUpperCase()} (Ref: ${payment.paymentId}). Escrow confirmed for hospital admission.`,
            actorRole: 'patient',
            timestamp: new Date().toISOString(),
          })
        } else if (payment.purpose === 'CONSULTATION_FEE') {
          await journeyService.addJourneyEvent({
            caseId: medicalCase.id,
            stage: 'Reviewing',
            title: 'Consultation Fee Secured',
            description: `Pre-surgical video consultation fee of $${payment.amount} ${payment.currency} verified (Ref: ${payment.paymentId}). Clinical review confirmed.`,
            actorRole: 'patient',
            timestamp: new Date().toISOString(),
          })
        }
      }
    } catch (err) {
      console.warn('[paymentService] Non-fatal state transition error:', err)
    }
  }

  async handleWebhook(
    providerName: PaymentProviderName,
    rawBody: Buffer | string,
    signatureHeader: string,
    headers: Record<string, any>
  ): Promise<{ processed: boolean; idempotent: boolean; eventId?: string }> {
    const provider = this.getProvider(providerName)

    // 1. Signature Verification
    const isValidSignature = provider.verifyWebhookSignature(rawBody, signatureHeader)
    if (!isValidSignature) {
      throw new ValidationError('Invalid webhook cryptographic signature')
    }

    // 2. Parse Event
    const event = provider.parseWebhookEvent(rawBody, headers)
    if (!event) {
      throw new ValidationError('Unable to parse webhook payload')
    }

    // 3. Idempotency Check
    const existingEvent = WEBHOOK_EVENTS_CACHE.find(
      (e) => e.eventId === event.eventId && e.provider === providerName
    )

    if (existingEvent) {
      return {
        processed: true,
        idempotent: true,
        eventId: event.eventId,
      }
    }

    // 4. Process Payment Transition
    if (event.providerOrderId || event.providerPaymentId) {
      const payment = PAYMENTS_CACHE.find(
        (p) =>
          (event.providerOrderId && p.providerOrderId === event.providerOrderId) ||
          (event.providerPaymentId && p.providerPaymentId === event.providerPaymentId)
      )

      if (payment) {
        if (event.status === 'SUCCEEDED' && payment.status !== 'SUCCEEDED') {
          payment.status = 'SUCCEEDED'
          payment.providerPaymentId = event.providerPaymentId || payment.providerPaymentId
          payment.updatedAt = new Date().toISOString()
          await this.applyPaymentSuccessTransitions(payment)
        } else if (event.status === 'FAILED') {
          payment.status = 'FAILED'
          payment.failureReason = `Webhook reported failure event: ${event.eventType}`
          payment.updatedAt = new Date().toISOString()
        } else if (event.status === 'REFUNDED') {
          payment.status = 'REFUNDED'
          payment.refundStatus = 'FULL'
          payment.refundedAmount = payment.amount
          payment.updatedAt = new Date().toISOString()
        }
      }
    }

    // 5. Record Webhook Event for Idempotency
    const webhookRecord: PaymentWebhookEventRecord = {
      id: `wh-${Date.now()}`,
      eventId: event.eventId,
      provider: providerName,
      eventType: event.eventType,
      payload: event as any,
      status: 'PROCESSED',
      processedAt: new Date().toISOString(),
    }
    WEBHOOK_EVENTS_CACHE.push(webhookRecord)

    return {
      processed: true,
      idempotent: false,
      eventId: event.eventId,
    }
  }

  async listPayments(user: { id: string; role: string; patientId?: string }, filters?: { caseId?: string }): Promise<PaymentRecord[]> {
    let result = [...PAYMENTS_CACHE]

    if (filters?.caseId) {
      result = result.filter((p) => p.caseId === filters.caseId)
    }

    if (user.role === 'patient') {
      const targetPatientId = user.patientId || user.id
      result = result.filter((p) => p.patientId === targetPatientId || p.userId === user.id)
    }

    return result
  }

  async getPaymentById(id: string, user: { id: string; role: string; patientId?: string }): Promise<PaymentRecord> {
    const payment = PAYMENTS_CACHE.find((p) => p.id === id || p.paymentId === id)
    if (!payment) {
      throw new NotFoundError(`Payment record '${id}' not found`)
    }

    if (user.role === 'patient') {
      const targetPatientId = user.patientId || user.id
      if (payment.patientId !== targetPatientId && payment.userId !== user.id) {
        throw new ForbiddenError('You are not authorized to view this payment record')
      }
    }

    return payment
  }

  async refundPayment(
    paymentId: string,
    amount: number | undefined,
    reason: string | undefined,
    user: { id: string; role: string }
  ): Promise<PaymentRecord> {
    if (user.role !== 'admin' && user.role !== 'provider') {
      throw new ForbiddenError('Only administrators or medical coordinators can initiate refunds')
    }

    const payment = PAYMENTS_CACHE.find((p) => p.id === paymentId || p.paymentId === paymentId)
    if (!payment) {
      throw new NotFoundError(`Payment '${paymentId}' not found`)
    }

    if (payment.status !== 'SUCCEEDED') {
      throw new ValidationError(`Cannot refund payment in status '${payment.status}'`)
    }

    const refundAmount = amount !== undefined ? amount : payment.amount - payment.refundedAmount
    if (refundAmount <= 0) {
      throw new ValidationError('Refund amount must be greater than zero')
    }

    if (payment.refundedAmount + refundAmount > payment.amount) {
      throw new ValidationError(
        `Refund amount exceeds remaining refundable balance of $${payment.amount - payment.refundedAmount} ${payment.currency}`
      )
    }

    const provider = this.getProvider(payment.provider)
    await provider.refund({
      providerPaymentId: payment.providerPaymentId || payment.providerOrderId || payment.paymentId,
      amount: refundAmount,
      currency: payment.currency,
      reason,
    })

    payment.refundedAmount += refundAmount
    if (payment.refundedAmount >= payment.amount) {
      payment.status = 'REFUNDED'
      payment.refundStatus = 'FULL'
    } else {
      payment.refundStatus = 'PARTIAL'
    }
    payment.updatedAt = new Date().toISOString()

    return payment
  }

  // Method for test fixtures to reset or configure state
  _resetState(): void {
    PAYMENTS_CACHE.splice(0, PAYMENTS_CACHE.length, { ...INITIAL_SEED })
    WEBHOOK_EVENTS_CACHE.length = 0
  }
}

export const paymentService = new PaymentService()
