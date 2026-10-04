import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Plane, Award } from 'lucide-react'
import { Breadcrumb } from '../components'
import { DESTINATIONS_DATA } from '../data/destinationsData'

export function DestinationsPage() {
  const navigate = useNavigate()

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Destinations Directory', current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-4 flex items-center gap-2.5 font-sans">
          <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          Global Healthcare Corridors
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-light text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] max-w-2xl">
          Leading Medical Tourism Hubs
        </h1>

        <p className="mt-4 text-sm sm:text-base font-light text-[var(--text-secondary)] font-sans max-w-xl leading-relaxed">
          Compare premier international healthcare destinations based on clinical accreditations, visa facilitation, direct flight accessibility, and quaternary surgical expertise.
        </p>
      </div>

      {/* Editorial Grid of Destination Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {DESTINATIONS_DATA.map((dest) => (
          <div
            key={dest.id}
            onClick={() => navigate(`/destinations/${dest.id}`)}
            className="bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[4px] p-6 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[4px] mb-6">
                <img
                  src={dest.heroImage}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-250 ease-out"
                />
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'linear-gradient(180deg, transparent 40%, rgba(6,14,9,0.9) 100%)' }}
                />
                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="text-2xl sm:text-3xl font-serif font-light text-[#EDE5CE]">
                    {dest.name}
                  </h3>
                  <span className="text-[11px] font-sans text-[var(--text-muted)] tracking-[0.06em]">
                    {dest.capitalCities}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-medium text-[var(--text-primary)] font-sans mb-2 leading-snug">
                {dest.headline}
              </h4>

              <p className="text-xs font-light text-[var(--text-secondary)] font-sans line-clamp-3 leading-relaxed mb-6">
                {dest.description}
              </p>

              <div className="p-3.5 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-2 text-xs font-sans mb-6">
                <div className="flex items-center justify-between text-[var(--text-secondary)]">
                  <span className="text-[var(--text-muted)]">Verified JCI Centers:</span>
                  <span className="text-[var(--text-primary)] font-medium">{dest.jciHospitalsCount}+ Hospitals</span>
                </div>
                <div className="flex items-center justify-between text-[var(--text-secondary)] border-t border-[var(--border-hairline)] pt-2">
                  <span className="text-[var(--text-muted)]">Visa Facilitation:</span>
                  <span className="text-[var(--text-secondary)] truncate max-w-[240px]">Medical e-Visa (48–72h)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs font-sans text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1">
                Explore destination <span>&rarr;</span>
              </span>
              <span className="text-[11px] font-sans text-[var(--copper)]">
                Average Savings {dest.avgSavings}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DestinationsPage
