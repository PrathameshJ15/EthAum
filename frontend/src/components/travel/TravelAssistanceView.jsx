import React, { useState, useEffect } from 'react'
import {
  Plane,
  Calendar,
  MapPin,
  ExternalLink,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  Car,
  FileText,
  CheckSquare,
  Square,
  Save,
  Download,
  Info,
  BadgeAlert,
  ArrowRight,
} from 'lucide-react'
import { travelService } from '../../services/travelService'
import { useToast } from '../common/useToast'
import { Card, CardHeader, CardTitle, CardContent } from '../layout/Card'
import { Button } from '../common/Button'
import { Badge } from '../common/Badge'

export function TravelAssistanceView({ caseId = 'ET-8492', medicalCase }) {
  const { addToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [plan, setPlan] = useState(null)
  const [checklistFilter, setChecklistFilter] = useState('ALL')

  // Form states
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travelStatus, setTravelStatus] = useState('PLANNING')
  const [coordinationNotes, setCoordinationNotes] = useState('')

  // Flight details
  const [flightAirline, setFlightAirline] = useState('')
  const [flightNumber, setFlightNumber] = useState('')
  const [flightDepartureAirport, setFlightDepartureAirport] = useState('')
  const [flightArrivalAirport, setFlightArrivalAirport] = useState('')
  const [flightBookingRef, setFlightBookingRef] = useState('')

  // Accommodation details
  const [hotelName, setHotelName] = useState('')
  const [hotelAddress, setHotelAddress] = useState('')
  const [hotelCheckIn, setHotelCheckIn] = useState('')
  const [hotelCheckOut, setHotelCheckOut] = useState('')
  const [hotelBookingRef, setHotelBookingRef] = useState('')
  const [companionIncluded, setCompanionIncluded] = useState(true)

  // Ground transfer details
  const [transferType, setTransferType] = useState('HOSPITAL_VAN')
  const [wheelchairAccessible, setWheelchairAccessible] = useState(true)
  const [flightTracking, setFlightTracking] = useState(true)
  const [driverNotes, setDriverNotes] = useState('')

  const destinationKey = medicalCase?.destinationId || medicalCase?.destinationName || 'india'

  useEffect(() => {
    let isMounted = true
    const loadPlan = async () => {
      try {
        setLoading(true)
        const data = await travelService.getTravelPlan(caseId, destinationKey)
        if (isMounted && data) {
          setPlan(data)
          setDepartureDate(data.departureDate || '')
          setReturnDate(data.returnDate || '')
          setTravelStatus(data.travelStatus || 'PLANNING')
          setCoordinationNotes(data.coordinationNotes || '')

          if (data.flightDetails) {
            setFlightAirline(data.flightDetails.airline || '')
            setFlightNumber(data.flightDetails.flightNumber || '')
            setFlightDepartureAirport(data.flightDetails.departureAirport || '')
            setFlightArrivalAirport(data.flightDetails.arrivalAirport || '')
            setFlightBookingRef(data.flightDetails.bookingReference || '')
          }

          if (data.accommodationDetails) {
            setHotelName(data.accommodationDetails.facilityName || '')
            setHotelAddress(data.accommodationDetails.address || '')
            setHotelCheckIn(data.accommodationDetails.checkInDate || '')
            setHotelCheckOut(data.accommodationDetails.checkOutDate || '')
            setHotelBookingRef(data.accommodationDetails.bookingReference || '')
            setCompanionIncluded(data.accommodationDetails.companionIncluded !== false)
          }

          if (data.groundTransfer) {
            setTransferType(data.groundTransfer.transferType || 'HOSPITAL_VAN')
            setWheelchairAccessible(data.groundTransfer.wheelchairAccessible !== false)
            setFlightTracking(data.groundTransfer.flightTrackingEnabled !== false)
            setDriverNotes(data.groundTransfer.driverNotes || '')
          }
        }
      } catch (err) {
        console.error('[TravelAssistanceView] Failed to load travel plan:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadPlan()
    return () => {
      isMounted = false
    }
  }, [caseId, destinationKey])

  const handleToggleChecklist = async (itemId, currentVal) => {
    try {
      const nextVal = !currentVal
      // Optimistic update
      setPlan((prev) => ({
        ...prev,
        checklist: prev.checklist.map((item) =>
          item.id === itemId ? { ...item, completed: nextVal } : item
        ),
      }))

      await travelService.toggleChecklistItem(caseId, itemId, nextVal)
      addToast({
        type: 'success',
        title: nextVal ? 'Checklist Item Completed' : 'Item Marked Pending',
        message: 'Travel preparation status updated.',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update checklist item.',
      })
    }
  }

  const handleSaveTravelPlan = async () => {
    try {
      setSaving(true)
      const payload = {
        departureDate: departureDate || undefined,
        returnDate: returnDate || undefined,
        travelStatus,
        coordinationNotes,
        flightDetails: {
          airline: flightAirline,
          flightNumber: flightNumber,
          departureAirport: flightDepartureAirport,
          arrivalAirport: flightArrivalAirport,
          bookingReference: flightBookingRef,
        },
        accommodationDetails: {
          facilityName: hotelName,
          address: hotelAddress,
          checkInDate: hotelCheckIn,
          checkOutDate: hotelCheckOut,
          bookingReference: hotelBookingRef,
          companionIncluded,
          source: 'PATIENT_RECORDED',
        },
        groundTransfer: {
          transferType,
          wheelchairAccessible,
          flightTrackingEnabled: flightTracking,
          driverNotes,
          status: 'CONFIRMED',
        },
      }

      const updated = await travelService.updateTravelPlan(caseId, payload)
      setPlan(updated)
      addToast({
        type: 'success',
        title: 'Travel Plan Saved',
        message: 'Your travel schedule and logistics have been updated.',
      })
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not save travel updates.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-8 h-8 border-2 border-[var(--green-rich)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[var(--text-muted)] font-light">Loading travel planning & official visa resources...</p>
      </div>
    )
  }

  const visaInfo = plan?.visaInfo || travelService.getVisaInfo(destinationKey)
  const checklist = plan?.checklist || []
  const completedCount = checklist.filter((c) => c.completed).length
  const totalCount = checklist.length
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filteredChecklist = checklist.filter((item) => {
    if (checklistFilter === 'ALL') return true
    return item.category === checklistFilter
  })

  return (
    <div className="space-y-8 text-left">
      {/* 1. Header Overview & Travel Status */}
      <div className="bg-[var(--bg-card)] rounded-[6px] border border-[var(--border-default)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[var(--border-hairline)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[var(--green-soft)]/20 text-[var(--green-rich)]">
              <Plane className="w-3.5 h-3.5" />
              <span>International Medical Travel & Logistics</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-light text-[var(--text-primary)]">
              Travel Coordination: {plan?.destinationCity || 'New Delhi'}, {plan?.destinationCountry || 'India'}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] font-light">
              Case #{caseId} · Synchronized with hospital admission schedule
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-[var(--text-muted)] font-light">Travel Status:</span>
            <select
              value={travelStatus}
              onChange={(e) => setTravelStatus(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)] font-medium"
            >
              <option value="PLANNING">Planning Schedule</option>
              <option value="BOOKED">Travel Booked</option>
              <option value="IN_TRANSIT">In Transit (Flying)</option>
              <option value="ARRIVED">Arrived at Destination</option>
              <option value="POST_PROCEDURE_RECOVERY">Inpatient / Recovery</option>
              <option value="COMPLETED">Returned Home Safely</option>
            </select>
          </div>
        </div>

        {/* Travel Window Date Pickers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-light">
          <div className="space-y-1.5">
            <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
              Planned Departure Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
              Estimated Return Date
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
              Destination Country
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                readOnly
                value={plan?.destinationCountry || 'India'}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] cursor-not-allowed opacity-90"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
              Destination Hub
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                readOnly
                value={plan?.destinationCity || 'New Delhi'}
                className="w-full pl-9 pr-3 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] cursor-not-allowed opacity-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Official Government Visa Portal & Regulatory Notice Banner */}
      <div className="bg-[#FEF7EA] dark:bg-[#2b2210] rounded-[6px] border border-[#F3C267]/60 dark:border-[#B07D1E]/60 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#B07D1E] dark:text-[#F3C267] shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-[var(--text-primary)]">
              Official Visa Guidelines & Sovereign Legal Notice
            </h3>
            <p className="text-xs text-[var(--text-secondary)] font-light leading-relaxed">
              {visaInfo.disclaimer}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[#F3C267]/30 dark:border-[#B07D1E]/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-light">
          <div className="space-y-1.5 p-3.5 bg-white/70 dark:bg-black/20 rounded-[4px] border border-[var(--border-hairline)]">
            <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block font-medium">
              Applicable Visa Protocol
            </span>
            <p className="text-[var(--text-primary)] font-medium text-xs">
              {visaInfo.visaType}
            </p>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Estimated Processing Window: {visaInfo.processingTime}
            </p>
          </div>

          <div className="space-y-2 p-3.5 bg-white/70 dark:bg-black/20 rounded-[4px] border border-[var(--border-hairline)] flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-[var(--text-muted)] block font-medium">
                Official Consular Portal
              </span>
              <p className="text-[var(--text-primary)] font-medium text-xs">
                {visaInfo.portalName}
              </p>
            </div>
            <a
              href={visaInfo.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[var(--green-rich)] font-medium hover:underline pt-1"
            >
              <span>Visit Official Government Visa Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Key Prerequisites checklist overview */}
        <div className="pt-2 text-xs font-light">
          <span className="text-[11px] font-medium text-[var(--text-primary)] block mb-1.5">
            Key Prerequisites for {visaInfo.country}:
          </span>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-[var(--text-secondary)]">
            {visaInfo.keyRequirements.map((req, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 3. Travel Preparation Checklist */}
      <div className="bg-[var(--bg-card)] rounded-[6px] border border-[var(--border-default)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h3 className="text-base font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-[var(--green-rich)]" />
              Pre-Travel Preparation Checklist
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-light">
              Essential verification milestones prior to international departure
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-secondary)] font-medium">
              {completedCount} of {totalCount} completed ({percentComplete}%)
            </span>
            <div className="w-24 h-2 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--green-rich)] transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {['ALL', 'VISA', 'MEDICAL', 'PACKING', 'LOGISTICS'].map((cat) => (
            <button
              key={cat}
              onClick={() => setChecklistFilter(cat)}
              className={`px-3 py-1 rounded-full border text-xs transition-colors ${
                checklistFilter === cat
                  ? 'bg-[var(--green-rich)] text-[var(--text-inverse)] border-[var(--green-rich)] font-medium'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
              }`}
            >
              {cat === 'ALL' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {/* Checklist item list */}
        <div className="divide-y divide-[var(--border-hairline)] text-xs">
          {filteredChecklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklist(item.id, item.completed)}
              className="py-3 flex items-start gap-3 cursor-pointer group hover:bg-[var(--bg-base)]/50 -mx-2 px-2 rounded-[4px] transition-colors"
            >
              <button
                type="button"
                className="shrink-0 mt-0.5 focus:outline-none"
                aria-label={item.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {item.completed ? (
                  <CheckSquare className="w-4 h-4 text-[var(--green-rich)]" />
                ) : (
                  <Square className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                )}
              </button>

              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      item.completed
                        ? 'line-through text-[var(--text-muted)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {item.task}
                  </span>
                  {item.essential && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 font-medium">
                      Essential
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                    {item.category}
                  </span>
                </div>
                {item.notes && (
                  <p className="text-[11px] text-[var(--text-secondary)] font-light leading-relaxed">
                    {item.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Accommodation & Transportation Details */}
      <div className="bg-[var(--bg-card)] rounded-[6px] border border-[var(--border-default)] p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[var(--border-hairline)]">
          <div>
            <h3 className="text-base font-serif font-medium text-[var(--text-primary)] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[var(--green-rich)]" />
              Accommodation & Flight Information
            </h3>
            <p className="text-xs text-[var(--text-muted)] font-light">
              Optional records for coordinate pickup and companion stay
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-elevated)] border border-[var(--border-default)] text-[10px] text-[var(--text-muted)]">
            <Info className="w-3 h-3 text-[var(--text-muted)]" />
            <span>Patient-Recorded Details · Not Directly Booked by EthAum</span>
          </span>
        </div>

        {/* Flight Information */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-medium flex items-center gap-2">
            <Plane className="w-3.5 h-3.5 text-[var(--green-rich)]" />
            Flight / Arrival Itinerary
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light">
            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Airline Carrier
              </label>
              <input
                type="text"
                value={flightAirline}
                placeholder="e.g. Air India, Emirates, Qatar"
                onChange={(e) => setFlightAirline(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Flight Number
              </label>
              <input
                type="text"
                value={flightNumber}
                placeholder="e.g. AI 102 / EK 512"
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                PNR / Booking Reference
              </label>
              <input
                type="text"
                value={flightBookingRef}
                placeholder="e.g. AI-77894"
                onChange={(e) => setFlightBookingRef(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Departure Airport
              </label>
              <input
                type="text"
                value={flightDepartureAirport}
                placeholder="e.g. JFK New York"
                onChange={(e) => setFlightDepartureAirport(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Arrival Airport & Terminal
              </label>
              <input
                type="text"
                value={flightArrivalAirport}
                placeholder="e.g. DEL - Indira Gandhi International, Terminal 3"
                onChange={(e) => setFlightArrivalAirport(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>
          </div>
        </div>

        {/* Accommodation Details */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-hairline)]">
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-medium flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[var(--green-rich)]" />
            Accommodation / Recovery Residence
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Hotel or Recovery Facility Name
              </label>
              <input
                type="text"
                value={hotelName}
                placeholder="e.g. The Leela Palace New Delhi (Partner Hotel)"
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Hotel Booking Reference
              </label>
              <input
                type="text"
                value={hotelBookingRef}
                placeholder="e.g. LEELA-99120"
                onChange={(e) => setHotelBookingRef(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Facility Address & Neighborhood
              </label>
              <input
                type="text"
                value={hotelAddress}
                placeholder="e.g. Diplomatic Enclave, Chanakyapuri, New Delhi"
                onChange={(e) => setHotelAddress(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Check-in Date
              </label>
              <input
                type="date"
                value={hotelCheckIn}
                onChange={(e) => setHotelCheckIn(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Check-out Date
              </label>
              <input
                type="date"
                value={hotelCheckOut}
                onChange={(e) => setHotelCheckOut(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="companionIncluded"
                checked={companionIncluded}
                onChange={(e) => setCompanionIncluded(e.target.checked)}
                className="rounded border-[var(--border-default)] text-[var(--green-rich)] focus:ring-[var(--green-rich)]"
              />
              <label htmlFor="companionIncluded" className="text-xs text-[var(--text-secondary)] font-light cursor-pointer">
                Traveling companion accommodated in same suite
              </label>
            </div>
          </div>
        </div>

        {/* Airport Ground Transfer */}
        <div className="space-y-4 pt-4 border-t border-[var(--border-hairline)]">
          <h4 className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-medium flex items-center gap-2">
            <Car className="w-3.5 h-3.5 text-[var(--green-rich)]" />
            Airport Ground Transfer Coordination
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-light">
            <div className="space-y-1">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Transfer Arrangement
              </label>
              <select
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              >
                <option value="HOSPITAL_VAN">Hospital Chauffeur / Patient Van</option>
                <option value="PRIVATE_CAR">Private Executive Car</option>
                <option value="TAXI_RIDESHARE">Prepaid Airport Taxi / Uber</option>
                <option value="SELF_ARRANGED">Self-Arranged / Family Pickup</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="wheelchairAccessible"
                checked={wheelchairAccessible}
                onChange={(e) => setWheelchairAccessible(e.target.checked)}
                className="rounded border-[var(--border-default)] text-[var(--green-rich)] focus:ring-[var(--green-rich)]"
              />
              <label htmlFor="wheelchairAccessible" className="text-xs text-[var(--text-secondary)] font-light cursor-pointer">
                Wheelchair ramp / mobility vehicle required
              </label>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="flightTracking"
                checked={flightTracking}
                onChange={(e) => setFlightTracking(e.target.checked)}
                className="rounded border-[var(--border-default)] text-[var(--green-rich)] focus:ring-[var(--green-rich)]"
              />
              <label htmlFor="flightTracking" className="text-xs text-[var(--text-secondary)] font-light cursor-pointer">
                Enable automated flight delay tracking for driver
              </label>
            </div>

            <div className="space-y-1 sm:col-span-3">
              <label className="text-[11px] text-[var(--text-secondary)] font-medium block">
                Chauffeur Paging & Driver Instructions
              </label>
              <input
                type="text"
                value={driverNotes}
                placeholder="e.g. Driver to hold Apex Hospital / EthAum sign at Gate 4. Traveling with 2 large luggage bags."
                onChange={(e) => setDriverNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--green-rich)]"
              />
            </div>
          </div>
        </div>

        {/* Coordination Notes */}
        <div className="space-y-2 pt-4 border-t border-[var(--border-hairline)]">
          <label className="text-xs uppercase tracking-wider text-[var(--text-primary)] font-medium block">
            Special Coordination Notes for Hospital Care Desk
          </label>
          <textarea
            rows={3}
            value={coordinationNotes}
            onChange={(e) => setCoordinationNotes(e.target.value)}
            placeholder="Provide any dietary requirements, companion names, or specific travel coordination needs..."
            className="w-full p-3 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[4px] text-xs text-[var(--text-primary)] font-light focus:outline-none focus:border-[var(--green-rich)] leading-relaxed"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <Button
            variant="primary"
            onClick={handleSaveTravelPlan}
            disabled={saving}
            className="gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Logistics...' : 'Save Travel & Visa Logistics'}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TravelAssistanceView
