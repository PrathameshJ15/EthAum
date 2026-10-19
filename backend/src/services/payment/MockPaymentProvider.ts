import crypto from 'node:crypto'
import {
  PaymentProvider,
  CreateProviderOrderParams,
  ProviderOrderResult,
  VerifyProviderPaymentParams,
  ParsedWebhookEvent,
  RefundProviderParams,
  ProviderRefundResult,
} from './PaymentProvider.js'

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock' as const

  async createOrder(params: CreateProviderOrderParams): Promise<ProviderOrderResult> {
    const orderId = `order_mock_${Date.now().toString(36)}_${crypto.randomBytes(3).toString('hex')}`
    return {
      providerOrderId: orderId,
      amount: params.amount,
      currency: params.currency,
      provider: this.name,
      keyId: 'mock_key_live_testing',
      metadata: {
        simulationMode: true,
        escrowReserveAuthorized: true,
      },
    }
  }

  verifyPayment(params: VerifyProviderPaymentParams): boolean {
    if (!params.providerOrderId || !params.providerPaymentId || !params.providerSignature) {
      return false
    }
    // Rejects explicit invalid markers
    if (params.providerSignature.includes('invalid') || params.providerSignature === 'forged') {
      return false
    }
    return true
  }

  verifyWebhookSignature(_rawBody: Buffer | string, signature: string): boolean {
    if (!signature || signature === 'invalid_signature' || signature.includes('forged')) {
      return false
    }
    return true
  }

  parseWebhookEvent(rawBody: Buffer | string, _headers: Record<string, any>): ParsedWebhookEvent | null {
    try {
      const payloadString = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf-8')
      const data = JSON.parse(payloadString)

      return {
        eventId: data.event_id || data.id || `evt_mock_${Date.now()}`,
        eventType: data.event || data.type || 'payment.captured',
        provider: this.name,
        providerOrderId: data.order_id || data.providerOrderId,
        providerPaymentId: data.payment_id || data.providerPaymentId || `pay_mock_${Date.now()}`,
        amount: data.amount,
        currency: data.currency || 'USD',
        status: (data.status as any) || 'SUCCEEDED',
        metadata: data.metadata || {},
      }
    } catch {
      return null
    }
  }

  async refund(params: RefundProviderParams): Promise<ProviderRefundResult> {
    return {
      refundId: `rfnd_mock_${Date.now()}`,
      status: 'SUCCEEDED',
      amount: params.amount,
    }
  }
}
