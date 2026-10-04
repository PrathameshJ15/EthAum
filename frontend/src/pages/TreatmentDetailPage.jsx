import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Check,
  AlertTriangle,
  Clock,
  Building2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Breadcrumb } from '../components'
import { TREATMENTS_DATA } from '../data/treatmentsData'
import { PROVIDERS_DATA } from '../data/providersData'
import { DESTINATIONS_DATA } from '../data/destinationsData'
import { treatmentService } from '../services/treatmentService'

export function TreatmentDetailPage({ onCreateCase }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState(0)

  const [treatment, setTreatment] = useState(
    () => TREATMENTS_DATA.find((t) => t.id === id) || TREATMENTS_DATA[0]
  )

  useEffect(() => {
    let isMounted = true
    if (id) {
      treatmentService.getTreatmentById(id).then((data) => {
        if (isMounted && data) {
          setTreatment(data)
        }
      })
    }
    return () => {
      isMounted = false
    }
  }, [id])

  // Matched Providers
  const matchedProviders = PROVIDERS_DATA.filter((p) =>
    treatment.matchedProviderIds?.includes(p.id)
  )

  // Matched Destinations
  const matchedDestinations = DESTINATIONS_DATA.filter((d) =>
    treatment.topDestinationIds?.includes(d.id)
  )

  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-10 sm:py-16 space-y-12 text-left">
      <Breadcrumb
        items={[
          { label: 'Marketplace', href: '/' },
          { label: 'Treatments', href: '/treatments' },
          { label: treatment.name, current: true },
        ]}
      />

      {/* Clinical Disclaimer Banner */}
      <div className="p-4 rounded-[4px] bg-[var(--bg-card)] border border-[var(--border-default)] flex items-start gap-3 text-xs font-sans text-[var(--text-secondary)]">
        <AlertTriangle className="w-4 h-4 shrink-0 text-[var(--copper)] mt-0.5" />
        <p className="leading-relaxed">
          <span className="font-medium text-[var(--text-primary)]">Clinical Disclaimer: </span>
          EthAum provides administrative coordination, provider matching, and medical record indexing. The information below is for educational and travel planning purposes and does not replace individualized diagnostic or surgical evaluation by a licensed physician.
        </p>
      </div>

      {/* Hero Header Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Info (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)]">
              {treatment.category}
            </span>
            <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
              JCI Accredited Centers
            </span>
            <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-[3px] bg-[var(--bg-card)] border border-[var(--border-default)] text-[var(--text-secondary)]">
              Robotic Navigation
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-light text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1]">
            {treatment.name}
          </h1>

          <p className="text-sm sm:text-base font-light text-[var(--text-secondary)] font-sans leading-relaxed">
            {treatment.longDescription}
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)]">
              <span className="text-[10px] font-sans uppercase text-[var(--text-muted)] block">Hospital Stay</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-sans mt-0.5 block">
                {treatment.hospitalStayDays}
              </span>
            </div>
            <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)]">
              <span className="text-[10px] font-sans uppercase text-[var(--text-muted)] block">Recovery Window</span>
              <span className="text-sm font-medium text-[var(--text-primary)] font-sans mt-0.5 block">
                {treatment.recoveryTimeWeeks}
              </span>
            </div>
            <div className="p-4 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-sans uppercase text-[var(--text-muted)] block">Typical Savings</span>
              <span className="text-sm font-normal text-[var(--copper)] font-sans mt-0.5 block tabular-nums">
                ~{treatment.savingsPercentage}% vs USA
              </span>
            </div>
          </div>
        </div>

        {/* Pricing Card & CTA (5 Cols) */}
        <div className="lg:col-span-5 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] p-6 sm:p-8 space-y-6">
          <div className="space-y-1">
            <span className="text-[11px] font-sans text-[var(--text-muted)] uppercase tracking-wider block">
              Direct Package Estimate
            </span>
            <div className="text-3xl sm:text-4xl font-sans font-normal text-[var(--copper)] tabular-nums">
              ${treatment.startingPriceUSD.toLocaleString()} USD
            </div>
            <span className="text-xs font-sans text-[var(--text-secondary)] block">
              Save up to ${(treatment.usAvgPriceUSD - treatment.startingPriceUSD).toLocaleString()} USD compared to US hospital billing
            </span>
          </div>

          <div className="p-3 bg-[var(--bg-base)] rounded-[3px] border border-[var(--border-hairline)] space-y-2 text-xs font-sans">
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>US Private Hospital Cost:</span>
              <span className="line-through text-[var(--text-muted)]">${treatment.usAvgPriceUSD.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[var(--text-secondary)]">
              <span>UK Private Hospital Cost:</span>
              <span className="line-through text-[var(--text-muted)]">£{treatment.ukAvgPriceUSD.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs font-sans text-[var(--text-secondary)]">
            <p className="font-medium text-[var(--text-primary)]">Standard package coverage:</p>
            <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" /> Certified surgical team & anesthesia</p>
            <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" /> FDA/CE-marked prosthesis hardware</p>
            <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" /> Inpatient private room & companion bed</p>
            <p className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-[var(--green-rich)] shrink-0" /> Airport concierge & chauffeur transfers</p>
          </div>

          <button
            onClick={() => onCreateCase ? onCreateCase(treatment.id) : navigate('/create-case')}
            className="w-full bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] transition-colors duration-150 rounded-[3px] py-3 text-[13px] font-medium font-sans tracking-[0.02em]"
          >
            Start Medical Case
          </button>

          <p className="text-[11px] font-sans text-[var(--text-muted)] text-center">
            Upload your MRI/records once · Receive verified quotes within 24h
          </p>
        </div>
      </div>

      {/* Suitability & Indications */}
      <section className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-4">
        <h3 className="text-xl font-serif font-light text-[var(--text-primary)]">General Clinical Indications</h3>
        <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
          Patients traveling internationally for {treatment.name} commonly present with:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {treatment.suitableFor.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-[3px] bg-[var(--bg-base)] border border-[var(--border-hairline)] text-xs font-sans text-[var(--text-secondary)]">
              <Check className="w-4 h-4 text-[var(--green-rich)] shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Patient Journey Pathway */}
      <section className="space-y-6">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Clinical Pathway
          </p>
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            Patient Journey for {treatment.name}
          </h3>
        </div>

        <div className="p-6 sm:p-8 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)] space-y-6">
          {treatment.journeySteps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <span className="text-xs font-normal text-[var(--copper)] font-sans tabular-nums shrink-0 mt-0.5">
                0{idx + 1}
              </span>
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] font-sans">{step.title}</h4>
                <p className="text-xs font-light text-[var(--text-secondary)] font-sans mt-0.5 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Verified Hospitals for this Treatment */}
      <section className="space-y-6">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Matched Providers
          </p>
          <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
            Accredited Centers Performing This Procedure
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
                    {provider.city}, {provider.country}
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

      {/* Procedure FAQs */}
      {treatment.faqs && (
        <section className="space-y-6 pt-4 border-t border-[var(--border-hairline)]">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-2 flex items-center gap-2.5 font-sans">
              <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
              Procedure Questions
            </p>
            <h3 className="text-2xl font-serif font-light text-[var(--text-primary)]">
              Frequently Asked Clinical Questions
            </h3>
          </div>

          <div className="divide-y divide-[var(--border-default)]">
            {treatment.faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group"
                  >
                    <span className="text-base font-medium text-[var(--text-primary)] font-sans">
                      {faq.question}
                    </span>
                    <span className="text-[var(--text-muted)] shrink-0">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="mt-2 text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}

export default TreatmentDetailPage
