import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Search, MapPin, X } from 'lucide-react'
import { Breadcrumb } from '../components'
import { PROVIDERS_DATA } from '../data/providersData'
import { DESTINATIONS_DATA } from '../data/destinationsData'
import { providerService } from '../services/providerService'

export function ProvidersPage() {
  const navigate = useNavigate()
  const [providersList, setProvidersList] = useState(PROVIDERS_DATA)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('all')
  const [onlyJci, setOnlyJci] = useState(false)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    providerService
      .listProviders()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProvidersList(data)
        }
      })
      .catch((err) => {
        console.warn('Providers API fetch notice:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredProviders = useMemo(() => {
    return providersList.filter((p) => {
      // Search query
      if (search.trim()) {
        const q = search.toLowerCase()
        const matchesName = p.name.toLowerCase().includes(q)
        const matchesCity = p.city.toLowerCase().includes(q)
        const matchesTagline = (p.tagline || p.overview || '').toLowerCase().includes(q)
        if (!matchesName && !matchesCity && !matchesTagline) return false
      }

      // Country filter
      if (selectedCountry !== 'all' && p.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false
      }

      // JCI filter
      if (onlyJci && !p.accreditations?.some((a) => a.includes('JCI'))) {
        return false
      }

      return true
    })
  }, [providersList, search, selectedCountry, onlyJci])

  const clearFilters = () => {
    setSearch('')
    setSelectedCountry('all')
    setOnlyJci(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Providers Directory', current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-4 flex items-center gap-2.5 font-sans">
          <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          Accredited Global Hospitals
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[48px] font-serif font-light text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] max-w-2xl">
          Verified Quaternary Healthcare Centers
        </h1>

        <p className="mt-4 text-sm sm:text-base font-light text-[var(--text-secondary)] font-sans max-w-xl leading-relaxed">
          Explore medical facilities credentialed under Joint Commission International (JCI) standards, featuring fellowship-trained surgical chiefs and dedicated international patient concierges.
        </p>
      </div>

      {/* Search & Filter Controls Surface */}
      <div className="p-4 sm:p-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2.5 px-3 py-2 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-hairline)] focus-within:border-[var(--border-default)] transition-colors">
            <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder="Search hospitals or cities (e.g. Apex Joint, Bangkok, Istanbul)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none font-sans font-light placeholder-[var(--text-muted)]"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Country Selector */}
          <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-hairline)]">
            <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-transparent text-xs font-sans text-[var(--text-secondary)] outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--bg-card)]">All Countries</option>
              {DESTINATIONS_DATA.map((d) => (
                <option key={d.id} value={d.name} className="bg-[var(--bg-card)]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* JCI Checkbox Toggle */}
          <label className="flex items-center gap-2 px-3 py-2 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-secondary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyJci}
              onChange={(e) => setOnlyJci(e.target.checked)}
              className="rounded accent-[var(--green-rich)]"
            />
            <span>JCI Accredited Only</span>
          </label>
        </div>

        {(search || selectedCountry !== 'all' || onlyJci) && (
          <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)] pt-2 border-t border-[var(--border-hairline)]">
            <span>Filters active</span>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[var(--copper)] hover:underline cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Provider Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProviders.map((provider) => (
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
                  {provider.city}, {provider.country}
                </span>
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)]">
                  {provider.accreditations[0]}
                </span>
              </div>

              <h4 className="text-lg font-medium text-[var(--text-primary)] font-sans mb-2 leading-snug">
                {provider.name}
              </h4>

              <p className="text-xs font-light text-[var(--text-secondary)] font-sans line-clamp-3 leading-relaxed mb-4">
                {provider.overview}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border-hairline)] flex items-center justify-between">
              <span className="text-xs font-sans text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1">
                View center <span>&rarr;</span>
              </span>
              <span className="text-[11px] font-sans text-[var(--text-muted)]">
                Est. {provider.establishedYear}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProvidersPage
