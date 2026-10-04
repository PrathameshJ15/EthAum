import React, { useState, useEffect } from 'react'
import {
  Calendar,
  Clock,
  User,
  Building2,
  Stethoscope,
  Video,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react'

import { Modal, Button, useToast, Badge } from '../index'
import { providerService } from '../../services/providerService'
import { doctorService } from '../../services/doctorService'
import { appointmentService } from '../../services/appointmentService'

export function ConsultationBookingModal({
  isOpen,
  onClose,
  caseId = 'ET-8492',
  defaultProviderId = 'apex-joint-delhi',
  defaultDoctorId = 'dr-vikram-oberoi',
  onSuccess,
}) {
  const { addToast } = useToast()

  // Form State
  const [providers, setProviders] = useState([])
  const [selectedProviderId, setSelectedProviderId] = useState(defaultProviderId)
  const [doctors, setDoctors] = useState([])
  const [selectedDoctorId, setSelectedDoctorId] = useState(defaultDoctorId)
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().split('T')[0]
  })
  const [availableSlots, setAvailableSlots] = useState([
    '09:00 AM',
    '10:30 AM',
    '11:45 AM',
    '02:00 PM',
    '03:30 PM',
    '05:00 PM',
  ])
  const [selectedSlot, setSelectedSlot] = useState('10:30 AM')
  const [consultationType, setConsultationType] = useState('consultation') // 'consultation' | 'follow-up'
  const [consultationFormat, setConsultationFormat] = useState('Telemedicine')
  const [notes, setNotes] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // 1. Load Providers
  useEffect(() => {
    providerService.listProviders().then((res) => {
      const list = res?.data || res || []
      setProviders(list)
    })
  }, [])

  // 2. Load Doctors for Selected Provider
  useEffect(() => {
    if (!selectedProviderId) return
    doctorService.listDoctors({ providerId: selectedProviderId }).then((res) => {
      const list = res?.data || res || []
      setDoctors(list)
      if (list.length > 0 && !list.some((d) => d.id === selectedDoctorId)) {
        setSelectedDoctorId(list[0].id)
      }
    })
  }, [selectedProviderId])

  // 3. Load Available Slots for Doctor & Date
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return
    setLoadingSlots(true)
    appointmentService
      .getAvailableSlots(selectedDoctorId, selectedDate)
      .then((res) => {
        const slots = res?.data?.availableSlots || res?.availableSlots || [
          '09:00 AM',
          '10:30 AM',
          '02:00 PM',
          '03:30 PM',
        ]
        setAvailableSlots(slots)
        if (slots.length > 0 && !slots.includes(selectedSlot)) {
          setSelectedSlot(slots[0])
        }
      })
      .catch(() => {
        setAvailableSlots(['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM'])
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDoctorId, selectedDate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedSlot) {
      addToast({
        type: 'error',
        title: 'Select a Slot',
        message: 'Please choose an available appointment slot time.',
      })
      return
    }

    setSubmitting(true)
    try {
      const selectedDoc = doctors.find((d) => d.id === selectedDoctorId)
      const selectedProv = providers.find((p) => p.id === selectedProviderId)

      const payload = {
        caseId,
        providerId: selectedProviderId,
        providerName: selectedProv?.name || 'Partner Hospital',
        doctorId: selectedDoctorId,
        doctorName: selectedDoc?.name || 'Clinical Specialist',
        specialty: selectedDoc?.specialty || 'Surgeon Specialist',
        consultationType,
        type: consultationFormat,
        dateTime: `${selectedDate}T${selectedSlot.includes('PM') ? '14:30:00Z' : '10:30:00Z'}`,
        slotTime: selectedSlot,
        notes,
        status: 'REQUESTED',
      }

      const res = await appointmentService.createAppointment(payload)
      addToast({
        type: 'success',
        title: 'Consultation Requested',
        message: `Your ${consultationType === 'follow-up' ? 'follow-up' : 'pre-surgical'} consultation has been requested. Status: REQUESTED.`,
      })

      onSuccess?.(res?.data || res)
      onClose?.()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: err.message || 'Could not schedule consultation. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Surgeon Tele-Consultation"
      description={`Schedule a direct clinical session with an accredited specialist for Case #${caseId}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 text-xs text-left">
        {/* Security Banner */}
        <div className="p-3 bg-[#EBF5EE] border border-[#CFEADB] rounded-[4px] text-[var(--green-rich)] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="text-[11px] font-medium">
            Sovereign Encrypted Video · HIPAA-compliant clinical tele-health room
          </span>
        </div>

        {/* STEP 1: Select Consultation Type */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Consultation Purpose
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setConsultationType('consultation')}
              className={`p-3 rounded-[4px] border text-left transition-all ${
                consultationType === 'consultation'
                  ? 'border-[var(--green-rich)] bg-[#EBF5EE] text-[var(--text-primary)] ring-1 ring-[var(--green-rich)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <strong className="text-xs block text-[var(--text-primary)] font-medium">
                Initial Consultation
              </strong>
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                Pre-operative scan review & surgical feasibility
              </span>
            </button>

            <button
              type="button"
              onClick={() => setConsultationType('follow-up')}
              className={`p-3 rounded-[4px] border text-left transition-all ${
                consultationType === 'follow-up'
                  ? 'border-[var(--green-rich)] bg-[#EBF5EE] text-[var(--text-primary)] ring-1 ring-[var(--green-rich)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
              }`}
            >
              <strong className="text-xs block text-[var(--text-primary)] font-medium">
                Follow-Up Consultation
              </strong>
              <span className="text-[11px] text-[var(--text-muted)] block mt-0.5">
                Post-procedure review or recovery reassessment
              </span>
            </button>
          </div>
        </div>

        {/* STEP 2: Select Provider */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            1. Select Accredited Hospital
          </label>
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city}, {p.country})
              </option>
            ))}
          </select>
        </div>

        {/* STEP 3: Select Doctor */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            2. Select Clinical Specialist
          </label>
          {doctors.length === 0 ? (
            <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[4px] text-xs text-[var(--text-muted)]">
              Loading surgeons for selected hospital...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {doctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3 rounded-[4px] border text-left transition-all flex items-start gap-3 ${
                      isSelected
                        ? 'border-[var(--green-rich)] bg-[#EBF5EE] ring-1 ring-[var(--green-rich)]'
                        : 'border-[var(--border-default)] bg-[var(--bg-base)] hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden shrink-0">
                      {doc.image ? (
                        <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-medium text-[var(--green-rich)]">
                          {doc.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <strong className="text-xs text-[var(--text-primary)] font-medium block truncate">
                        {doc.name}
                      </strong>
                      <span className="text-[11px] text-[var(--text-muted)] block truncate">
                        {doc.title || doc.specialty}
                      </span>
                      <span className="text-[10px] text-[var(--green-rich)] font-medium block mt-0.5">
                        {doc.experienceYears}+ years experience
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* STEP 4: Select Date & Available Slot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
              3. Consultation Date
            </label>
            <input
              type="date"
              required
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] flex items-center justify-between">
              <span>Available Slot</span>
              {loadingSlots && <span className="text-[10px] text-[var(--text-muted)]">Checking...</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableSlots.map((slot) => {
                const isSelected = selectedSlot === slot
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 px-2 text-center rounded-[4px] text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-[var(--green-rich)] text-white'
                        : 'bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-card)]'
                    }`}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* STEP 5: Notes & Questions */}
        <div className="space-y-2">
          <label className="block text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)]">
            Clinical Topics / Specific Questions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Review coronal MRI, discuss implant materials, anesthesia options..."
            className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] focus:outline-none focus:border-[var(--green-rich)] text-xs"
          />
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
            icon={<Video className="w-3.5 h-3.5" />}
          >
            Request Consultation (REQUESTED)
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ConsultationBookingModal
