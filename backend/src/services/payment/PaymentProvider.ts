import { PaymentProviderName, PaymentPurpose } from '../../types/index.js'

export interface CreateProviderOrderParams {
  paymentId: string
  caseId: string
  amount: number
  currency: string
  purpose: PaymentPurpose
  patientId: string
  patientName?: string
  receiptNote?: string
}

export interface ProviderOrderResult {
  providerOrderId: string
  amount: number
  currency: string
  provider: PaymentProviderName
  keyId?: string
  checkoutUrl?: string
  metadata?: Record<string, any>
}

export interface VerifyProviderPaymentParams {
  providerOrderId: string
  providerPaymentId: string
  providerSignature: string
}

export interface ParsedWebhookEvent {
  eventId: string
  eventType: string
  provider: PaymentProviderName
  providerOrderId?: string
  providerPaymentId?: string
  amount?: number
  currency?: string
  status: 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
  metadata?: Record<string, any>
}

export interface RefundProviderParams {
  providerPaymentId: string
  amount: number
  currency: string
  reason?: string
}

export interface ProviderRefundResult {
  refundId: string
  status: 'SUCCEEDED' | 'PENDING'
  amount: number
}

export interface PaymentProvider {
  readonly name: PaymentProviderName
  createOrder(params: CreateProviderOrderParams): Promise<ProviderOrderResult>
  verifyPayment(params: VerifyProviderPaymentParams): boolean
  verifyWebhookSignature(rawBody: Buffer | string, signature: string): boolean
  parseWebhookEvent(rawBody: Buffer | string, headers: Record<string, any>): ParsedWebhookEvent | null
  refund(params: RefundProviderParams): Promise<ProviderRefundResult>
}
