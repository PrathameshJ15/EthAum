import React, { useState } from 'react'
import {
  Calendar,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Lock,
  CreditCard,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'

import { Modal, Button, useToast, Badge } from '../index'
import { bookingService } from '../../services/bookingService'

export function TreatmentBookingModal({
  isOpen,
  onClose,
  caseData,
  onSuccess,
}) {
  const { addToast } = useToast()

  const [admissionDate, setAdmissionDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 21)
    return d.toISOString().split('T')[0]
  })
  const [estimatedStayDays, setEstimatedStayDays] = useState(10)
  const [packagePrice, setPackagePrice] = useState(
    caseData?.budgetMin || 6500
  )
  const [companionNotes, setCompanionNotes] = useState(
    caseData?.patientNotes || 'Traveling with spouse, requires companion accommodation.'
  )
  const [selectedRequirements, setSelectedRequirements] = useState([
    'Airport Chauffeur Transfer',
    'Private Executive Recovery Suite',
  ])
  const [mockHolderName, setMockHolderName] = useState(caseData?.patientName || 'Eleanor Vance')
  const [submitting, setSubmitting] = useState(false)

  const toggleRequirement = (req) => {
    setSelectedRequirements((prev) =>
      prev.includes(req) ? prev.filter((r) => r !== req) : [...prev, req]
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const payload = {
        admissionDate,
        packagePrice: Number(packagePrice),
        currency: caseData?.currency || 'USD',
        depositAmount: 500,
        estimatedStayDays: Number(estimatedStayDays),
        providerId: caseData?.selectedProviderId || 'apex-joint-delhi',
        providerName: caseData?.selectedProviderName || 'Apex Orthopedic & Robotic Joint Institute',
        doctorId: caseData?.selectedDoctorId || 'dr-vikram-oberoi',
        doctorName: caseData?.selectedDoctorName || 'Dr. Vikram Oberoi, MS, FRCS',
        treatmentId: caseData?.treatmentId || 'procedure',
        treatmentName: caseData?.treatmentName || 'Specialized Procedure',
        companionNotes,
        specialRequirements: selectedRequirements,
        mockPayment: {
          method: 'SOVEREIGN_MOCK_ESCROW',
          holderName: mockHolderName,
          last4: '4242',
        },
      }

      const res = await bookingService.bookTreatmentForCase(caseData.id, payload)

      addToast({
        type: 'success',
        title: 'Treatment Admission Confirmed',
        message: `Case #${caseData.id} officially booked for ${admissionDate}. Mock escrow deposit authorized.`,
      })

      onSuccess?.(res?.data || res)
      onClose?.()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Booking Failed',
        message: err.message || 'Unable to confirm treatment booking.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Treatment & Hospital Admission"
      description={`Proceed with official clinical booking following surgical consultation for Case #${caseData?.id}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-left">
        {/* Post-Consultation Banner */}
        <div className="p-3 bg-[#EBF5EE] border border-[#CFEADB] rounded-[4px] text-[var(--green-rich)] flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong className="block text-xs">Consultation Completed & Cleared</strong>
            <span className="text-[11px] opacity-90 block mt-0.5">
              Your clinical imaging has been reviewed by the surgical team. You are cleared to proceed with hospital admission reservation.
            </span>
          </div>
        </div>

        {/* Procedure & Center Details */}
        <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-hairline)]">
            <div>
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--text-muted)] block">
                Target Procedure
              </span>
              <strong className="text-sm font-medium text-[var(--text-primary)] block">
                {caseData?.treatmentName}
              </strong>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-[10px] uppercase font-medium tracking-wider text-[var(--text-muted)] block">
                Package Estimate
              </span>
              <strong className="text-base font-serif text-[var(--green-rich)] block">
                ${Number(packagePrice).toLocaleString()} {caseData?.currency || 'USD'}
              </strong>
            </div>
          </div>

          <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>
              Accredited Hospital: <strong>{caseData?.selectedProviderName || 'Apex Orthopedic & Robotic Joint Institute'}</strong> ({caseData?.destinationName || 'New Delhi, India'})
            </span>
          </div>
        </div>

        {/* Scheduled Admission Date & Stay Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Scheduled Admission Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={admissionDate}
              onChange={(e) => setAdmissionDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              Estimated Inpatient Stay (Days)
            </label>
            <input
              type="number"
              required
              min={1}
              value={estimatedStayDays}
              onChange={(e) => setEstimatedStayDays(Number(e.target.value))}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
          </div>
        </div>

        {/* Companion & Travel Accommodations */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Accompanying Traveler & Companion Notes
          </label>
          <textarea
            rows={2}
            value={companionNotes}
            onChange={(e) => setCompanionNotes(e.target.value)}
            placeholder="e.g. Traveling with spouse, requires companion double suite, wheelchair assist upon arrival..."
            className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
          />
        </div>

        {/* Special Inclusions & Amenities */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Special In-Hospital Accommodations
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Airport Chauffeur Transfer',
              'Private Executive Recovery Suite',
              'Companion In-Room Bed',
              'Dedicated Medical Interpreter',
            ].map((amenity) => {
              const isChecked = selectedRequirements.includes(amenity)
              return (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 p-2.5 rounded-[4px] border cursor-pointer transition-all ${
                    isChecked
                      ? 'border-[var(--green-rich)] bg-[#EBF5EE] text-[var(--text-primary)]'
                      : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleRequirement(amenity)}
                    className="rounded text-[var(--green-rich)] focus:ring-[var(--green-rich)]"
                  />
                  <span className="text-xs">{amenity}</span>
                </label>
              )
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MOCK ESCROW PAYMENT PLACEHOLDER (NO REAL PAYMENT GATEWAY)                 */}
        {/* ========================================================================= */}
        <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-[var(--green-rich)]" />
              <strong className="text-xs font-medium text-[var(--text-primary)]">
                Mock Sovereign Escrow Reserve
              </strong>
            </div>
            <span className="text-[10px] font-mono text-[var(--green-rich)] bg-[#EBF5EE] px-2 py-0.5 rounded-[4px]">
              Simulated Hold · Deposit $500 USD
            </span>
          </div>

          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-[4px] text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Placeholder Payment Mode:</strong>
              <p className="mt-0.5 text-[10px]">
                No real credit card transaction or payment gateway is invoked. This simulation authorizes a mock deposit reservation to confirm your clinical booking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={mockHolderName}
                onChange={(e) => setMockHolderName(e.target.value)}
                className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] text-xs focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                Mock Card Number
              </label>
              <div className="px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] text-xs font-mono text-[var(--text-secondary)]">
                •••• •••• •••• 4242
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[var(--border-hairline)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            icon={<Lock className="w-3.5 h-3.5" />}
          >
            Authorize Mock Escrow & Book Treatment (BOOKED)
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TreatmentBookingModal
