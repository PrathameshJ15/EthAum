import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Search, Clock, Building2, X, ArrowRight } from 'lucide-react'
import { Breadcrumb, Button, StatusBadge, Photo } from '../components'
import { TREATMENTS_DATA, TREATMENT_CATEGORIES } from '../data/treatmentsData'
import { DESTINATIONS_DATA } from '../data/destinationsData'
import { treatmentService } from '../services/treatmentService'

export function TreatmentsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialSearch = searchParams.get('search') || ''
  const initialCategory = searchParams.get('category') || 'All'
  const initialDestination = searchParams.get('destination') || 'all'

  const [treatmentsList, setTreatmentsList] = useState(TREATMENTS_DATA)
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(initialSearch)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDestination, setSelectedDestination] = useState(initialDestination)
  const [maxPrice, setMaxPrice] = useState(25000)

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    treatmentService
      .listTreatments()
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setTreatmentsList(data)
        }
      })
      .catch((err) => {
        console.warn('Treatments API fetch notice:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const filteredTreatments = useMemo(() => {
    return treatmentsList.filter((item) => {
      // Search query filter
      if (query.trim()) {
        const q = query.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesDesc = (item.shortDescription || item.description || '').toLowerCase().includes(q)
        const matchesCategory = item.category.toLowerCase().includes(q)
        if (!matchesName && !matchesDesc && !matchesCategory) return false
      }

      // Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false
      }

      // Destination filter
      if (selectedDestination !== 'all') {
        if (!item.topDestinationIds?.includes(selectedDestination)) return false
      }

      // Price filter
      if (item.startingPriceUSD > maxPrice) {
        return false
      }

      return true
    })
  }, [treatmentsList, query, selectedCategory, selectedDestination, maxPrice])

  const clearFilters = () => {
    setQuery('')
    setSelectedCategory('All')
    setSelectedDestination('all')
    setMaxPrice(25000)
    setSearchParams({})
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 sm:px-8 py-10 sm:py-16 space-y-10 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Treatments Directory', current: true },
        ]}
      />

      {/* Editorial Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--action)] mb-3">
          Clinical Catalog
        </p>

        <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] max-w-2xl">
          Find & Compare Surgical Procedures
        </h1>

        <p className="mt-3 text-base font-normal text-[var(--text-muted)] max-w-xl leading-relaxed">
          Transparent surgical procedures, recovery timelines, and direct institutional package estimates across verified quaternary medical centers.
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
              placeholder="Search procedures (e.g. Knee Replacement, CABG, IVF)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-[var(--text)] outline-none placeholder-[var(--text-muted)]/70"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-[var(--text-muted)] hover:text-[var(--text-heading)] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Destination Selector */}
          <div className="w-full md:w-56 flex items-center gap-2 px-3 py-2.5 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)]">
            <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">Hub:</span>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-transparent text-xs text-[var(--text-heading)] font-medium outline-none cursor-pointer"
            >
              <option value="all" className="bg-[var(--surface)]">All Countries</option>
              {DESTINATIONS_DATA.map((d) => (
                <option key={d.id} value={d.id} className="bg-[var(--surface)]">
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="w-full md:w-60 px-3.5 py-2 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)]">
            <div className="flex justify-between text-xs text-[var(--text-muted)] mb-1">
              <span>Max Starting Quote:</span>
              <span className="font-bold text-[var(--action-text)] tabular-nums">${maxPrice.toLocaleString()} USD</span>
            </div>
            <input
              type="range"
              min="2000"
              max="25000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--border-strong)] rounded-lg appearance-none cursor-pointer accent-[var(--action)]"
            />
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[var(--border)]">
          <span className="text-xs font-semibold text-[var(--text-muted)] mr-2 shrink-0">Category:</span>
          {TREATMENT_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm,6px)] text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[var(--action)] text-[var(--on-action)] font-semibold'
                  : 'bg-[var(--surface-alt)] text-[var(--text-muted)] hover:text-[var(--text-heading)] border border-[var(--border)]'
              }`}
            >
              {cat}
            </button>
          ))}

          {(query || selectedCategory !== 'All' || selectedDestination !== 'all' || maxPrice < 25000) && (
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-[var(--action-text)] hover:underline cursor-pointer shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
        <span>Showing <strong className="text-[var(--text-heading)] font-semibold">{filteredTreatments.length}</strong> verified procedures</span>
        <span>Institutional package rates</span>
      </div>

      {/* Treatment Cards Grid */}
      {filteredTreatments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTreatments.map((treatment) => (
            <div
              key={treatment.id}
              onClick={() => navigate(`/treatments/${treatment.id}`)}
              className="bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-[var(--radius-lg,12px)] p-6 transition-all duration-150 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="aspect-[3/2] overflow-hidden rounded-[var(--radius-md,8px)] mb-4 bg-[var(--surface-alt)] border border-[var(--border)]">
                  <img
                    src={treatment.image}
                    alt={treatment.name}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200 ease-out dark:brightness-90"
                  />
                </div>

                <div className="text-xs font-semibold text-[var(--action-text)] uppercase tracking-wide mb-1.5">
                  {treatment.category}
                </div>

                <h4 className="text-lg font-heading font-bold text-[var(--text-heading)] mb-2 leading-snug">
                  {treatment.name}
                </h4>

                <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed mb-4">
                  {treatment.shortDescription}
                </p>

                <div className="p-3 bg-[var(--surface-alt)] rounded-[var(--radius-md,8px)] border border-[var(--border)] mb-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                      Direct Estimate
                    </span>
                    <span className="text-sm font-heading font-bold text-[var(--action-text)] tabular-nums">
                      From ${(treatment.startingPriceUSD ?? 0).toLocaleString()} USD
                    </span>
                  </div>
                  <div className="text-right border-l border-[var(--border)] pl-3">
                    <span className="text-[10px] uppercase text-[var(--text-muted)] block">
                      US / UK Avg
                    </span>
                    <span className="text-xs text-[var(--text-muted)] line-through">
                      ${(treatment.usAvgPriceUSD ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--action)]" /> Stay: {treatment.hospitalStayDays || 'N/A'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[var(--action)]" /> {treatment.matchedProviderIds?.length ?? 0} Centers
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs font-semibold text-[var(--action-text)] group-hover:underline inline-flex items-center gap-1">
                  <span>Explore treatment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase">
                  {(treatment.topDestinationIds || []).join(', ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 bg-[var(--surface)] rounded-[var(--radius-lg,12px)] border border-[var(--border)] text-center space-y-4">
          <p className="text-base font-semibold text-[var(--text-heading)]">No procedures match your filter criteria</p>
          <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
            Try adjusting your search query, increasing your budget limit, or clearing filters.
          </p>
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  )
}

export default TreatmentsPage
