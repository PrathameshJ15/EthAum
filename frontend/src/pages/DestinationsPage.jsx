import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Building2, CheckCircle2 } from 'lucide-react'
import { Breadcrumb, StatusBadge } from '../components'
import { DESTINATIONS_DATA } from '../data/destinationsData'

export function DestinationsPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Destinations Directory', current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--action)] mb-3">
          Global Healthcare Corridors
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] max-w-2xl">
          Leading Medical Tourism Hubs
        </h1>

        <p className="mt-3 text-base font-normal text-[var(--text-muted)] max-w-xl leading-relaxed">
          Compare premier international healthcare destinations based on clinical accreditations, visa facilitation, direct flight accessibility, and quaternary surgical expertise.
        </p>
      </div>

      {/* Editorial Grid of Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {DESTINATIONS_DATA.map((dest) => (
          <div
            key={dest.id}
            onClick={() => navigate(`/destinations/${dest.id}`)}
            className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-[var(--radius-lg,12px)] p-6 sm:p-7 transition-all duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-md,8px)] mb-6 border border-[var(--border)] bg-[var(--surface-alt)]">
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 ease-out dark:brightness-90"
                />
                <div className="absolute top-3 right-3">
                  <StatusBadge status="VERIFIED" customLabel="JCI Accredited Hub" size="sm" />
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-heading font-bold text-[var(--text-heading)]">
                  {dest.name}
                </h3>
                <span className="text-xs font-semibold text-[var(--text-muted)]">
                  {dest.capitalCities}
                </span>
              </div>

              <h4 className="text-sm font-semibold text-[var(--text-heading)] mb-2 leading-snug">
                {dest.headline}
              </h4>

              <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed mb-6">
                {dest.description}
              </p>

              <div className="p-4 bg-[var(--surface-alt)] rounded-[var(--radius-md,8px)] border border-[var(--border)] space-y-2 text-xs mb-6">
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>Verified Accredited Centers:</span>
                  <span className="text-[var(--text-heading)] font-semibold">{dest.jciHospitalsCount}+ Quaternary Hospitals</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)] border-t border-[var(--border)] pt-2">
                  <span>Visa Facilitation:</span>
                  <span className="text-[var(--text-heading)] font-medium">Medical e-Visa (48–72h)</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--action-text)] group-hover:underline inline-flex items-center gap-1">
                <span>Explore destination corridor</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <span className="text-xs font-bold text-[var(--action-text)]">
                Average Savings: {dest.avgSavings}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DestinationsPage
