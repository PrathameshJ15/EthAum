import React from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Plane,
  Calendar,
  Globe,
  FileCheck,
  Check,
  MapPin,
} from 'lucide-react'
import { Breadcrumb } from '../components'
import { DESTINATIONS_DATA } from '../data/destinationsData'
import { PROVIDERS_DATA } from '../data/providersData'
import { TREATMENTS_DATA } from '../data/treatmentsData'

export function DestinationDetailPage({ onCreateCase }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const destination = DESTINATIONS_DATA.find((d) => d.id === id) || DESTINATIONS_DATA[0]

  // Providers in this destination
  const matchedProviders = PROVIDERS_DATA.filter((p) =>
    p.country.toLowerCase().includes(destination.name.toLowerCase()) ||
    destination.providerIds?.includes(p.id)
  )

  // Popular treatments in this destination
  const matchedTreatments = TREATMENTS_DATA.filter((t) =>
    destination.popularTreatmentIds?.includes(t.id)
  )

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Destinations', href: '/destinations' },
          { label: destination.name, current: true },
        ]}
      />

      {/* Hero Header */}
      <div className="relative aspect-[21/9] min-h-[300px] w-full rounded-[4px] border border-[var(--border-default)] overflow-hidden">
        <img
          src={destination.heroImage}
          alt={destination.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(6,14,9,0.92) 100%)' }}
        />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
          <div>
            <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] uppercase tracking-[0.06em] mb-2 inline-block">
              {destination.jciHospitalsCount}+ JCI Centers
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light text-[#EDE5CE]">
              {destination.name}
            </h1>
            <p className="text-xs font-sans text-[var(--text-muted)] mt-1">
              {destination.capitalCities}
            </p>
          </div>

          <button
            onClick={() => onCreateCase ? onCreateCase() : navigate('/create-case')}
            className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors duration-150 rounded-[3px] px-6 py-2.5 text-xs font-medium font-sans tracking-[0.02em] shrink-0"
          >
            Create Medical Case
          </button>
        </div>
      </div>

      {/* Main Overview & Travel Logistics Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
            <h3 className="text-xl font-serif font-light text-[var(--text-primary)]">Destination Overview</h3>
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
              {destination.description}
            </p>
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
              {destination.headline}
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
            <h3 className="text-xl font-serif font-light text-[var(--text-primary)]">Clinical Specialties</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {destination.primarySpecialties.map((spec) => (
                <div key={spec} className="p-3 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-secondary)] flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): Logistics */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 sm:p-8 space-y-5">
          <h3 className="text-lg font-serif font-light text-[var(--text-primary)]">Travel & Medical Visa Logistics</h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Medical Visa Protocol
              </span>
              <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                {destination.travelInfo.visaPolicy}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Flight Times (Direct Routes)
              </span>
              <p className="text-[var(--text-secondary)] font-light">US: {destination.travelInfo.flightTimeUS}</p>
              <p className="text-[var(--text-secondary)] font-light mt-0.5">UK: {destination.travelInfo.flightTimeUK}</p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Language & Translation
              </span>
              <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                {destination.travelInfo.language}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Average Savings
              </span>
              <span className="text-sm font-normal text-[var(--copper)] tabular-nums">
                {destination.avgSavings} vs US Domestic Hospital Rates
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Verified Providers in Destination */}
      <section className="space-y-6">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Accredited Centers
          </p>
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            Partner Hospitals in {destination.name}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matchedProviders.map((provider) => (
            <div
              key={provider.id}
              onClick={() => navigate(`/providers/${provider.id}`)}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[4px] p-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-[16/9] overflow-hidden rounded-[4px] mb-4 bg-[var(--bg-base)]">
                  <img
                    src={provider.coverImage}
                    alt={provider.name}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-250 ease-out"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-sans text-[var(--text-muted)] uppercase tracking-[0.06em]">
                    {provider.city}
                  </span>
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)]">
                    {provider.accreditations[0]}
                  </span>
                </div>
                <h4 className="text-base font-medium text-[var(--text-primary)] font-sans mb-1.5 leading-snug">
                  {provider.name}
                </h4>
                <p className="text-xs font-light text-[var(--text-secondary)] font-sans line-clamp-2 leading-relaxed mb-4">
                  {provider.tagline}
                </p>
              </div>

              <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
                <span className="text-xs font-sans text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1">
                  View center <span>&rarr;</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default DestinationDetailPage
