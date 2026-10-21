import React, { useState, useEffect } from 'react'
import {
  ShieldCheck,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileText,
  Loader2,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Modal } from '../layout/Modal'
import { paymentService } from '../../services/paymentService'
import { useToast } from '../common/useToast'

export function PaymentCheckoutModal({
  isOpen,
  onClose,
  caseData,
  purpose = 'TREATMENT_DEPOSIT',
  bookingId,
  appointmentId,
  onSuccess,
}) {
  const { addToast } = useToast()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [succeededPayment, setSucceededPayment] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  useEffect(() => {
    if (isOpen) {
      paymentService.getConfig().then(setConfig).catch(() => {})
      setSucceededPayment(null)
      setErrorMessage(null)
    }
  }, [isOpen])

  const purposeLabels = {
    TREATMENT_DEPOSIT: 'Hospital Admission Escrow Deposit',
    HOSPITAL_ADMISSION: 'Inpatient Surgical Admission Deposit',
    CONSULTATION_FEE: 'Pre-Surgical Video Consultation Fee',
    SECOND_OPINION: 'Multidisciplinary Tumor/Surgical Second Opinion',
  }

  const defaultAmounts = {
    TREATMENT_DEPOSIT: caseData?.bookingDetails?.depositAmount || 500,
    HOSPITAL_ADMISSION: 500,
    CONSULTATION_FEE: 150,
    SECOND_OPINION: 150,
  }

  const expectedAmount = defaultAmounts[purpose] || 500
  const currency = caseData?.currency || 'USD'

  const handleInitiatePayment = async () => {
    setLoading(true)
    setErrorMessage(null)

    try {
      // 1. Create payment order on server (server authority)
      const res = await paymentService.createPaymentOrder({
        caseId: caseData.id,
        purpose,
        bookingId: bookingId || caseData?.bookingDetails?.id,
        appointmentId,
      })

      const payment = res.payment
      const order = res.order

      // 2. Gateway execution
      if (order.provider === 'razorpay' && window.Razorpay) {
        await executeRazorpayCheckout(payment, order)
      } else if (order.provider === 'stripe' && order.checkoutUrl && !order.checkoutUrl.includes('placeholder')) {
        window.location.href = order.checkoutUrl
      } else {
        // Mock Sandbox execution with cryptographic server verification
        await executeSandboxCheckout(payment, order)
      }
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Payment initiation failed'
      setErrorMessage(msg)
      addToast({
        type: 'error',
        title: 'Payment Error',
        message: msg,
      })
    } finally {
      setLoading(false)
    }
  }

  const executeSandboxCheckout = async (payment, order) => {
    setVerifying(true)
    try {
      // Simulates real card network authorization delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const verifyRes = await paymentService.verifyPayment({
        paymentId: payment.paymentId,
        providerOrderId: order.providerOrderId,
        providerPaymentId: `pay_mock_${Date.now()}`,
        providerSignature: `mock_sig_valid_${Date.now()}`,
      })

      setSucceededPayment(verifyRes)
      addToast({
        type: 'success',
        title: 'Payment Confirmed',
        message: `Escrow hold of $${payment.amount} ${payment.currency} authorized for Case #${caseData.id}.`,
      })
      onSuccess?.(verifyRes)
    } catch (err) {
      const msg = err.response?.data?.error?.message || err.message || 'Payment verification failed'
      setErrorMessage(msg)
    } finally {
      setVerifying(false)
    }
  }

  const executeRazorpayCheckout = async (payment, order) => {
    await paymentService.loadScript('https://checkout.razorpay.com/v1/checkout.js')

    const options = {
      key: order.keyId,
      amount: order.metadata?.amountInSubunits || payment.amount * 100,
      currency: payment.currency,
      name: 'EthAum Healthcare',
      description: purposeLabels[purpose] || 'Medical Case Payment',
      order_id: order.providerOrderId,
      handler: async (response) => {
        setVerifying(true)
        try {
          const verified = await paymentService.verifyPayment({
            paymentId: payment.paymentId,
            providerOrderId: response.razorpay_order_id,
            providerPaymentId: response.razorpay_payment_id,
            providerSignature: response.razorpay_signature,
          })

          setSucceededPayment(verified)
          addToast({
            type: 'success',
            title: 'Payment Verified',
            message: `Payment authorized. Ref: ${verified.paymentId}`,
          })
          onSuccess?.(verified)
        } catch (err) {
          const msg = err.response?.data?.error?.message || err.message || 'Signature verification failed'
          setErrorMessage(msg)
        } finally {
          setVerifying(false)
        }
      },
      prefill: {
        name: caseData?.patientName || '',
      },
      theme: {
        color: '#134E3F',
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Healthcare Escrow Checkout"
      description="Patient-protected medical deposit and consultation fee processing"
      size="md"
    >
      <div className="space-y-5 text-xs text-left">
        {/* State A: Payment Confirmed Receipt View */}
        {succeededPayment ? (
          <div className="p-6 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] space-y-4 text-center">
            <div className="w-12 h-12 bg-[#EBF5EE] border border-[#CFEADB] rounded-full flex items-center justify-center mx-auto text-[var(--green-rich)]">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--green-rich)]">
                Escrow Reserve Authorized
              </span>
              <h3 className="font-serif text-lg text-[var(--text-primary)]">
                Payment Confirmed
              </h3>
              <p className="text-[11px] text-[var(--text-secondary)]">
                Your medical case workflow has been updated and your clinical reservation is secured.
              </p>
            </div>

            <div className="p-3 bg-[var(--bg-elevated)]/60 border border-[var(--border-hairline)] rounded-[4px] text-left space-y-2 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">Payment Reference:</span>
                <strong className="text-[var(--text-primary)]">{succeededPayment.paymentId}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">Amount Secured:</span>
                <strong className="text-[var(--green-rich)]">${succeededPayment.amount} {succeededPayment.currency}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">Status:</span>
                <span className="text-[var(--green-rich)] font-sans font-medium uppercase text-[10px] bg-[#EBF5EE] px-1.5 py-0.5 rounded-[3px]">
                  {succeededPayment.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--text-muted)] font-sans">Gateway Provider:</span>
                <span className="text-[var(--text-secondary)] font-sans uppercase text-[10px]">
                  {succeededPayment.provider}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-[var(--green-rich)] hover:bg-[var(--green-rich)]/90 text-white font-medium rounded-[4px] text-xs transition-colors"
            >
              Continue to Case Dashboard
            </button>
          </div>
        ) : (
          /* State B: Active Checkout Details View */
          <>
            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-[4px] text-red-800 dark:text-red-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <div>
                  <strong className="block text-xs">Transaction Incomplete</strong>
                  <span className="text-[11px] opacity-90">{errorMessage}</span>
                </div>
              </div>
            )}

            {/* Itemized Charge Overview */}
            <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-hairline)]">
                <div>
                  <span className="text-[10px] uppercase font-sans tracking-wider text-[var(--text-muted)] block">
                    Purpose of Payment
                  </span>
                  <strong className="text-xs text-[var(--text-primary)]">
                    {purposeLabels[purpose] || purpose}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-sans tracking-wider text-[var(--text-muted)] block">
                    Amount
                  </span>
                  <strong className="text-base font-serif text-[var(--green-rich)]">
                    ${expectedAmount.toLocaleString()} {currency}
                  </strong>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Medical Case: <strong>#{caseData?.id}</strong> ({caseData?.treatmentName})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <span>Hospital: <strong>{caseData?.selectedProviderName || 'Accredited Healthcare Partner'}</strong></span>
                </div>
              </div>
            </div>

            {/* Escrow Regulatory Disclaimer */}
            <div className="p-3.5 bg-[#EBF5EE] dark:bg-[var(--bg-elevated)] border border-[#CFEADB] dark:border-[var(--border-hairline)] rounded-[4px] flex items-start gap-2.5 text-[var(--text-secondary)]">
              <ShieldCheck className="w-4 h-4 text-[var(--green-rich)] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="text-xs text-[var(--green-rich)] block">
                  Sovereign Escrow Protection Guarantee
                </strong>
                <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                  Funds are secured in escrow until your physical check-in at the hospital. If clinical eligibility is not verified, your deposit remains refundable in accordance with medical coordination policy.
                </p>
              </div>
            </div>

            {/* Active Provider Indicator */}
            <div className="flex items-center justify-between px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] text-[11px]">
              <span className="text-[var(--text-muted)] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[var(--green-rich)]" />
                Encrypted Gateway:
              </span>
              <span className="font-mono uppercase text-[10px] text-[var(--text-primary)] bg-[var(--bg-elevated)] px-2 py-0.5 rounded border border-[var(--border-hairline)]">
                {config?.enabledProvider === 'mock' ? 'Sovereign Test Sandbox' : config?.enabledProvider || 'Escrow Gateway'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || verifying}
                className="flex-1 py-2 px-3 bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-[4px] text-xs font-medium transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleInitiatePayment}
                disabled={loading || verifying}
                className="flex-[2] py-2 px-4 bg-[var(--green-rich)] hover:bg-[var(--green-rich)]/90 disabled:opacity-50 text-white rounded-[4px] text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Signature...</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Order...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Authorize Escrow (${expectedAmount} {currency})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}

export default PaymentCheckoutModal
