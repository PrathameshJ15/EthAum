import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, X, ArrowRight } from 'lucide-react'
import { Breadcrumb, Button, StatusBadge } from '../components'
import { PROVIDERS_DATA } from '../data/providersData'
import { DESTINATIONS_DATA } from '../data/destinationsData'
import { providerService } from '../services/providerService'
import { useTranslation } from '../i18n'

export function ProvidersPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
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
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 text-left rtl:text-right">
      <Breadcrumb
        items={[
          { label: t('nav.marketplace', 'Marketplace'), href: '/' },
          { label: t('providers.title', 'Providers Directory'), current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--action)] mb-3">
          {t('providers.badge', 'Accredited Global Hospitals')}
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] max-w-2xl">
          {t('providers.heading', 'Verified Quaternary Healthcare Centers')}
        </h1>

        <p className="mt-3 text-base font-normal text-[var(--text-muted)] max-w-xl leading-relaxed">
          {t('providers.subtitle', 'Explore medical facilities credentialed under Joint Commission International (JCI) standards, featuring fellowship-trained surgical chiefs and dedicated international patient concierges.')}
        </p>
      </div>

      {/* Search & Filter Controls Surface */}
      <div className="p-5 bg-[var(--surface)] rounded-[var(--radius-lg,12px)] border border-[var(--border)] space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Box */}
          <div className="flex-1 flex items-center gap-2.5 px-3.5 py-2.5 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)] focus-within:border-[var(--action)] transition-colors">
            <Search className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              placeholder={t('providers.searchPlaceholder', 'Search hospitals or cities (e.g. Apex Joint, Bangkok, Istanbul)...')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder-[var(--text-muted)]/70"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Country Selector */}
          <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)]">
            <MapPin className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full bg-transparent text-xs text-[var(--text-heading)] font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--surface)]">
                {t('providers.filterCountry', 'All Countries')}
              </option>
              {DESTINATIONS_DATA.map((d) => (
                <option key={d.id} value={d.name} className="bg-[var(--surface)]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* JCI Checkbox Toggle */}
          <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)] text-xs text-[var(--text-heading)] font-semibold cursor-pointer select-none">
            <input
              type="checkbox"
              checked={onlyJci}
              onChange={(e) => setOnlyJci(e.target.checked)}
              className="rounded accent-[var(--action)]"
            />
            <span>{t('providers.jciOnly', 'JCI Accredited Only')}</span>
          </label>
        </div>

        {(search || selectedCountry !== 'all' || onlyJci) && (
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
            <span>{t('common.filtersActive', 'Filters active')}</span>
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-[var(--action-text)] hover:underline cursor-pointer"
            >
              {t('treatments.resetFilters', 'Reset Filters')}
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
            className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-[var(--radius-lg,12px)] p-6 transition-all duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="aspect-[16/9] overflow-hidden rounded-[var(--radius-md,8px)] mb-4 bg-[var(--surface-alt)] border border-[var(--border)]">
                <img
                  src={provider.coverImage}
                  alt={provider.name}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 ease-out dark:brightness-90"
                />
              </div>

              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">
                  {provider.city}, {provider.country}
                </span>
                <StatusBadge status="VERIFIED" customLabel={provider.accreditations[0]} size="sm" />
              </div>

              <h4 className="text-lg font-heading font-bold text-[var(--text-heading)] mb-2 leading-snug">
                {provider.name}
              </h4>

              <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed mb-4">
                {provider.overview}
              </p>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--action-text)] group-hover:underline inline-flex items-center gap-1">
                <span>{t('providers.viewProfile', 'View accredited center')}</span>
                <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {t('providers.established', 'Est.')} {provider.establishedYear}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProvidersPage
