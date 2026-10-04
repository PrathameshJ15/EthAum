import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Check,
} from 'lucide-react'
import { Breadcrumb } from '../components'
import { PROVIDERS_DATA } from '../data/providersData'
import { providerService } from '../services/providerService'

export function ProviderDetailPage({ onCreateCase }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [provider, setProvider] = useState(
    () => PROVIDERS_DATA.find((p) => p.id === id) || PROVIDERS_DATA[0]
  )

  useEffect(() => {
    let isMounted = true
    if (id) {
      providerService.getProviderById(id).then((data) => {
        if (isMounted && data) {
          setProvider(data)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Providers', href: '/providers' },
          { label: provider.name, current: true },
        ]}
      />

      {/* Hero Header Card */}
      <div className="relative aspect-[21/9] min-h-[300px] w-full rounded-[4px] border border-[var(--border-default)] overflow-hidden">
        <img
          src={provider.coverImage}
          alt={provider.name}
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent 35%, rgba(6,14,9,0.92) 100%)' }}
        />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {provider.accreditations.map((acc) => (
                <span
                  key={acc}
                  className="text-[11px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)]"
                >
                  {acc}
                </span>
              ))}
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-light text-[#EDE5CE]">
              {provider.name}
            </h1>
            <p className="text-xs font-sans text-[var(--text-muted)] mt-1">
              {provider.city}, {provider.country} · Established {provider.establishedYear}
            </p>
          </div>

          <button
            onClick={() => onCreateCase ? onCreateCase() : navigate('/create-case')}
            className="bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors duration-150 rounded-[3px] px-6 py-2.5 text-xs font-medium font-sans tracking-[0.02em] shrink-0"
          >
            Request Institutional Quote
          </button>
        </div>
      </div>

      {/* Overview & Clinical Facilities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
            <h3 className="text-xl font-serif font-light text-[var(--text-primary)]">Institutional Overview</h3>
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
              {provider.overview}
            </p>
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
              {provider.tagline}
            </p>
          </div>

          <div className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
            <h3 className="text-xl font-serif font-light text-[var(--text-primary)]">Center Facilities & Care Amenities</h3>
            <div className="space-y-2.5">
              {provider.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs font-sans text-[var(--text-secondary)]">
                  <Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0 mt-0.5" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 Cols): International Patient Desk */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 sm:p-8 space-y-5">
          <h3 className="text-lg font-serif font-light text-[var(--text-primary)]">International Patient Concierge</h3>

          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Airport & Transit Service
              </span>
              <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                {provider.internationalSupport.airportConcierge}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Medical Visa (MED-V) Assistance
              </span>
              <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                {provider.internationalSupport.visaAssistance}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Translation & Interpretation
              </span>
              <p className="text-[var(--text-secondary)] font-light leading-relaxed">
                {provider.internationalSupport.translators}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)]">
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Languages Supported
              </span>
              <p className="text-[var(--text-secondary)] font-light">
                {provider.languages.join(', ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Senior Surgical Faculty */}
      <section className="space-y-6">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Specialist Faculty
          </p>
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            Chief Department Surgeons & Specialists
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {provider.doctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] p-6 flex flex-col sm:flex-row gap-5 items-start"
            >
              <div className="w-20 h-20 rounded-[3px] overflow-hidden bg-[var(--bg-base)] shrink-0">
                <img
                  src={doc.image}
                  alt={doc.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-medium text-[var(--text-primary)] font-sans">{doc.name}</h4>
                <div className="text-xs font-normal text-[var(--copper)] font-sans">{doc.title}</div>
                <div className="text-xs text-[var(--text-muted)] font-sans">{doc.specialty} · {doc.experienceYears} Years Practice</div>
                <p className="text-xs font-light text-[var(--text-secondary)] font-sans pt-1 leading-relaxed">
                  {doc.education}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProviderDetailPage
