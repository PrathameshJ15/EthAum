import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export function HomePage({ onCreateCase }) {
  const navigate = useNavigate()

  // Timeline Active Step State in "How EthAum Coordinates Your Care"
  const [activeJourneyStep, setActiveJourneyStep] = useState(1) // Step 02: Create Medical Case

  // Active Tab in Medical Case Preview Mockup
  const [activeCaseTab, setActiveCaseTab] = useState('overview')

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0)

  // 6 Journey Steps matching reference
  const journeySteps = [
    {
      number: '01',
      name: 'Discover',
      description: 'Browse treatments and destinations matched to your condition.',
    },
    {
      number: '02',
      name: 'Create Medical Case',
      description: 'Open your secure Medical Case — your central healthcare record.',
    },
    {
      number: '03',
      name: 'Upload Records',
      description: 'Upload diagnoses, scans, and reports. EthAum organizes and verifies them for every provider.',
    },
    {
      number: '04',
      name: 'AI Coordination',
      description: 'EthAum matches your records to appropriate accredited providers globally.',
    },
    {
      number: '05',
      name: 'Compare Quotes',
      description: 'Receive transparent quotes. Compare inclusions and pricing side by side.',
    },
    {
      number: '06',
      name: 'Treatment & Aftercare',
      description: 'Travel with confidence. Aftercare is coordinated through your Medical Case.',
    },
  ]

  // Direct Institutional Quotes comparison data matching reference
  const quoteComparisonCards = [
    {
      provider: 'Fortis Memorial Research Institute',
      city: 'Gurgaon, India',
      accreditation: 'NABH',
      price: '$3,100',
      priceNote: 'USD · all-inclusive',
      inclusions: [
        'Pre-surgical consultation',
        '5-night hospital stay',
        'Post-operative care',
      ],
      isRecommended: false,
    },
    {
      provider: 'Bumrungrad International Hospital',
      city: 'Bangkok, Thailand',
      accreditation: 'JCI Accredited',
      price: '$4,200',
      priceNote: 'USD · all-inclusive',
      inclusions: [
        'Pre-surgical consultation',
        '7-night hospital stay',
        'Cardiac rehabilitation included',
        '24-month aftercare coordination',
      ],
      isRecommended: true,
    },
    {
      provider: 'Anadolu Medical Center',
      city: 'Istanbul, Turkey',
      accreditation: 'JCI Accredited',
      price: '$5,800',
      priceNote: 'USD · all-inclusive',
      inclusions: [
        'Pre-surgical consultation',
        '6-night hospital stay',
        'Post-operative care',
      ],
      isRecommended: false,
    },
  ]

  // FAQ List matching reference
  const faqItems = [
    {
      q: 'What exactly is a Medical Case?',
      a: 'A Medical Case is your secure, verified healthcare record on EthAum. It stores your diagnoses, scans, and reports in one place, and shares them directly with matched providers — so you never have to re-explain your history.',
    },
    {
      q: 'How does EthAum verify providers?',
      a: 'All providers on EthAum hold internationally recognized accreditations — JCI, NABH, or equivalent. Our team reviews credentials, patient outcomes, and facility standards before any provider joins the platform.',
    },
    {
      q: 'Is my medical data secure?',
      a: 'Your records are encrypted end-to-end and shared only with providers you explicitly authorize. EthAum is HIPAA-compliant and GDPR-compliant. You retain complete ownership of your data at all times.',
    },
    {
      q: 'Does EthAum charge patients to use the platform?',
      a: 'Creating a Medical Case and receiving quotes is free for patients. EthAum earns a coordination fee from providers only when a treatment is confirmed. You will never pay to explore your options.',
    },
  ]

  return (
    <div className="w-full bg-[var(--bg-canvas)] text-[var(--text-secondary)] selection:bg-[var(--green-rich)] selection:text-[var(--text-inverse)] transition-colors duration-200">
      {/* ==================================================
          1. HERO SECTION (With Signature Arched Portal)
          ================================================== */}
      <section className="relative pt-[70px] sm:pt-[90px] lg:pt-[120px] pb-[60px] lg:pb-[90px] bg-[var(--bg-base)] border-b border-[var(--border-hairline)] overflow-hidden transition-colors duration-200">
        {/* Subtle Square Grid Background */}
        <div className="absolute inset-0 bg-grid-ethaum pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7">
              {/* Eyebrow line */}
              <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-5 flex items-center gap-2.5 font-sans">
                <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
                International Healthcare Platform
              </p>

              {/* H1 headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-[72px] xl:text-[80px] font-serif font-light text-[var(--text-primary)] leading-[1.04] tracking-[-0.03em] max-w-[620px]">
                World-class healthcare,<br className="hidden sm:inline" /> without borders.
              </h1>

              {/* Body paragraph */}
              <p className="mt-6 text-[15px] sm:text-base font-light text-[var(--text-secondary)] leading-[1.75] max-w-[460px] font-sans">
                EthAum coordinates your complete care journey — verified providers, organized records, and transparent pricing across 47 countries.
              </p>

              {/* CTA row */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
                  className="btn-primary-cta"
                >
                  Create Medical Case
                </button>
                <Link
                  to="/treatments"
                  className="text-[13px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5 py-2.5 px-3"
                >
                  Explore treatments →
                </Link>
              </div>

              {/* Trust bar */}
              <div className="mt-12 pt-6 border-t border-[var(--border-hairline)] flex flex-wrap items-center gap-3.5 text-xs font-sans text-[var(--text-muted)]">
                <span>12,000+ verified treatments</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-rich)] shrink-0 hidden sm:inline-block" />
                <span className="hidden sm:inline-block">JCI-accredited centers</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-rich)] shrink-0 hidden md:inline-block" />
                <span className="hidden md:inline-block">47 countries</span>
              </div>
            </div>

            {/* Right Signature Arch Portal Visual (Matches Reference Screenshots) */}
            <div className="hidden lg:flex lg:col-span-5 justify-center lg:justify-end items-center relative">
              <div className="w-[310px] xl:w-[350px] h-[430px] xl:h-[470px] relative">
                {/* Soft ambient green lighting */}
                <div className="absolute inset-0 -top-8 rounded-t-full bg-[var(--green-rich)]/15 blur-3xl pointer-events-none" />

                {/* Arch portal */}
                <div className="hero-portal-arch relative flex flex-col justify-end p-7 border border-[var(--border-default)]">
                  {/* Concentric inner arches */}
                  <div className="absolute inset-3 rounded-t-full border border-white/10 pointer-events-none" />
                  <div className="absolute inset-7 rounded-t-full border border-white/5 pointer-events-none" />

                  {/* Glass card floating inside arch */}
                  <div className="relative z-10 bg-[var(--bg-canvas)]/90 backdrop-blur-md border border-[var(--border-hairline)] p-4 rounded-[4px] shadow-sm">
                    <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--green-rich)] font-sans font-medium mb-1">
                      Global Care Network
                    </div>
                    <div className="text-sm font-serif text-[var(--text-primary)]">
                      47 Countries · 12,000+ Treatments
                    </div>
                    <div className="text-[11px] font-sans text-[var(--text-muted)] mt-1">
                      Single Unified Medical Case
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          2. POPULAR CROSS-BORDER TREATMENTS (Asymmetric Layout)
          ================================================== */}
      <section className="py-20 lg:py-24 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
              <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
              Popular Cross-Border Treatments
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1]">
              Treatments patients travel the world for.
            </h2>
          </div>
          <Link
            to="/treatments"
            className="text-[13px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            View all treatments →
          </Link>
        </div>

        {/* Asymmetric Bento Grid matching reference */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Featured Card (Left - 7 cols) */}
          <div className="lg:col-span-7 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[4px] p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 group">
            <div>
              {/* Image Container with subtle emerald tint */}
              <div className="aspect-[16/10] w-full overflow-hidden rounded-[3px] mb-6 relative bg-[var(--bg-base)]">
                <img
                  src="https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1200&q=80"
                  alt="Cardiac Bypass Surgery"
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-[var(--bg-canvas)]/90 backdrop-blur-xs border border-[var(--border-hairline)] px-2.5 py-1 rounded-[3px] text-[10px] uppercase font-sans tracking-[0.08em] text-[var(--green-rich)] font-medium">
                  JCI Accredited
                </div>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-normal text-[var(--text-primary)] tracking-[-0.02em] mb-2.5">
                Cardiac Bypass Surgery
              </h3>

              <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed mb-6">
                Internationally accredited cardiac care — with coordinated records, specialist consultation, and structured aftercare in Bangkok's leading facilities.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[var(--border-hairline)]">
              <div className="text-sm font-sans font-normal text-[var(--copper)] tabular-nums">
                From $4,200 USD
              </div>
              <Link
                to="/treatments/cardiac-bypass"
                className="text-[13px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors inline-flex items-center gap-1"
              >
                Explore treatment →
              </Link>
            </div>
          </div>

          {/* Stacked Cards (Right - 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Top Right Card: Hip Replacement */}
            <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[4px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 group">
              <div>
                <div className="aspect-[16/8] w-full overflow-hidden rounded-[3px] mb-4 bg-[var(--bg-base)]">
                  <img
                    src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80"
                    alt="Hip Replacement"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <h4 className="text-lg font-medium text-[var(--text-primary)] font-sans mb-1">
                  Hip Replacement
                </h4>
                <div className="text-xs text-[var(--text-muted)] font-sans mb-3">
                  Orthopaedics · Germany
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
                <div className="text-xs font-sans text-[var(--copper)] tabular-nums">
                  From $8,500 USD
                </div>
                <Link
                  to="/treatments/knee-replacement"
                  className="text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors"
                >
                  Explore treatment →
                </Link>
              </div>
            </div>

            {/* Bottom Right Card: Full Dental Implants */}
            <div className="flex-1 bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--border-strong)] rounded-[4px] p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 group">
              <div>
                <div className="aspect-[16/8] w-full overflow-hidden rounded-[3px] mb-4 bg-[var(--bg-base)]">
                  <img
                    src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80"
                    alt="Full Dental Implants"
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <h4 className="text-lg font-medium text-[var(--text-primary)] font-sans mb-1">
                  Full Dental Implants
                </h4>
                <div className="text-xs text-[var(--text-muted)] font-sans mb-3">
                  Dental · Turkey
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[var(--border-hairline)]">
                <div className="text-xs font-sans text-[var(--copper)] tabular-nums">
                  From $1,800 USD
                </div>
                <Link
                  to="/treatments/dental-implants-all-on-4"
                  className="text-xs font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:underline transition-colors"
                >
                  Explore treatment →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. LEADING MEDICAL TOURISM HUBS (Destinations)
          ================================================== */}
      <section className="py-20 lg:py-24 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 border-t border-[var(--border-hairline)] text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
              <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
              Leading Medical Tourism Hubs
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1]">
              Where patients choose to receive their care.
            </h2>
          </div>
          <Link
            to="/destinations"
            className="text-[13px] font-sans text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            All destinations →
          </Link>
        </div>

        {/* 3 Destinations: Thailand, Turkey, India */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Thailand */}
          <Link
            to="/destinations/thailand"
            className="group relative min-h-[300px] sm:min-h-[340px] rounded-[4px] overflow-hidden border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1508009603885-50cf7c579365?auto=format&fit=crop&w=800&q=80"
              alt="Thailand"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/50 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-normal text-[var(--text-primary)] mb-1">
                Thailand
              </h3>
              <p className="text-xs font-sans text-[var(--text-muted)] tracking-[0.04em]">
                68 verified centers · JCI Accredited
              </p>
            </div>
          </Link>

          {/* Turkey */}
          <Link
            to="/destinations/turkey"
            className="group relative min-h-[300px] sm:min-h-[340px] rounded-[4px] overflow-hidden border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=800&q=80"
              alt="Turkey"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/50 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-normal text-[var(--text-primary)] mb-1">
                Turkey
              </h3>
              <p className="text-xs font-sans text-[var(--text-muted)] tracking-[0.04em]">
                42 verified centers
              </p>
            </div>
          </Link>

          {/* India */}
          <Link
            to="/destinations/india"
            className="group relative min-h-[300px] sm:min-h-[340px] rounded-[4px] overflow-hidden border border-[var(--border-default)] hover:border-[var(--border-strong)] transition-all duration-200 flex flex-col justify-end p-6"
          >
            <img
              src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80"
              alt="India"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-canvas)] via-[var(--bg-canvas)]/50 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <h3 className="text-2xl font-serif font-normal text-[var(--text-primary)] mb-1">
                India
              </h3>
              <p className="text-xs font-sans text-[var(--text-muted)] tracking-[0.04em]">
                91 verified centers
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ==================================================
          4. HOW ETHAUM COORDINATES YOUR CARE (Journey & Mockup)
          ================================================== */}
      <section className="py-20 lg:py-24 bg-[var(--bg-base)] border-t border-b border-[var(--border-hairline)] transition-colors duration-200 text-left">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            How EthAum Coordinates Your Care
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-12">
            Your journey, step by step.
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: 6 Journey Steps */}
            <div className="lg:col-span-5 relative pl-6">
              {/* Vertical connector line */}
              <div className="absolute left-[7px] top-2 bottom-6 w-[1px] bg-[var(--border-default)]" />

              <div className="space-y-6">
                {journeySteps.map((step, idx) => {
                  const isActive = activeJourneyStep === idx
                  return (
                    <div
                      key={step.number}
                      onClick={() => setActiveJourneyStep(idx)}
                      className={`relative cursor-pointer transition-all duration-200 rounded-[3px] py-2 px-3 ${
                        isActive
                          ? 'border-l-2 border-[var(--green-rich)] bg-[var(--bg-elevated)] pl-4 -ml-4'
                          : 'hover:bg-[var(--bg-card)]/40'
                      }`}
                    >
                      <div className="text-[11px] font-normal text-[var(--copper)] font-sans tracking-[0.1em] mb-1">
                        {step.number}
                      </div>

                      <div className="text-base font-medium text-[var(--text-primary)] font-sans mb-1">
                        {step.name}
                      </div>

                      <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column: Realistic Medical Case Mockup Card */}
            <div className="hidden lg:block lg:col-span-7 sticky top-28">
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] p-6 sm:p-7">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)] mb-5">
                  <div className="flex items-center gap-3">
                    <span className="text-xs uppercase font-sans tracking-[0.08em] text-[var(--text-muted)]">
                      Medical Case #MC-2024-0891
                    </span>
                    <span className="px-2 py-0.5 rounded-[3px] bg-[var(--green-rich)]/15 border border-[var(--green-rich)]/30 text-[var(--green-rich)] text-[10px] font-medium font-sans">
                      Active
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-6 border-b border-[var(--border-hairline)] mb-5 text-xs font-sans">
                  {['overview', 'records', 'quotes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveCaseTab(tab)}
                      className={`pb-2.5 capitalize cursor-pointer transition-colors ${
                        activeCaseTab === tab
                          ? 'text-[var(--text-primary)] font-medium border-b-2 border-[var(--green-rich)]'
                          : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Case Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-5 text-xs font-sans">
                  <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px]">
                    <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.06em]">Patient</div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] mt-0.5">Priya Mehta</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px]">
                    <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.06em]">Treatment</div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] mt-0.5">Cardiac Consultation</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px]">
                    <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.06em]">Stage</div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] mt-0.5">Records Uploaded</div>
                  </div>
                  <div className="p-3 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px]">
                    <div className="text-[10px] uppercase text-[var(--text-muted)] tracking-[0.06em]">Quotes received</div>
                    <div className="text-[13px] font-medium text-[var(--text-primary)] mt-0.5">3 providers</div>
                  </div>
                </div>

                {/* Journey Progress */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-xs font-sans text-[var(--text-muted)] mb-2">
                    <span>Journey Progress</span>
                    <span className="text-[var(--green-rich)] font-medium">Stage 3 of 6</span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--bg-base)] rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--green-rich)] rounded-full w-[50%]" />
                  </div>
                </div>

                {/* Medical Records Table */}
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-[var(--text-muted)] font-sans mb-3">
                    Medical Records
                  </div>
                  <div className="border border-[var(--border-hairline)] rounded-[3px] divide-y divide-[var(--border-hairline)] bg-[var(--bg-base)] text-xs font-sans">
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] text-[10px] font-mono">
                          PDF
                        </span>
                        <span className="text-[var(--text-primary)]">Cardiology_Report_2024.pdf</span>
                      </div>
                      <span className="text-[var(--text-muted)]">12 Mar</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] text-[10px] font-mono">
                          IMG
                        </span>
                        <span className="text-[var(--text-primary)]">ECG_scan_latest.jpg</span>
                      </div>
                      <span className="text-[var(--text-muted)]">08 Mar</span>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded-[2px] bg-[var(--copper-pale)] border border-[var(--copper-border)] text-[var(--copper)] text-[10px] font-mono">
                          PDF
                        </span>
                        <span className="text-[var(--text-primary)]">Blood_work_panel.pdf</span>
                      </div>
                      <span className="text-[var(--text-muted)]">01 Mar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          5. THE MEDICAL CASE (The patient's journey, organized in one place)
          ================================================== */}
      <section className="relative py-24 lg:py-28 bg-[var(--bg-canvas)] border-b border-[var(--border-hairline)] overflow-hidden text-left">
        {/* Faint Square Grid Background */}
        <div className="absolute inset-0 bg-grid-ethaum pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5">
              <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
                <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
                The Medical Case
              </p>

              <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-light text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-6">
                The patient's journey, organized in one place.
              </h2>

              <p className="text-sm sm:text-base font-light text-[var(--text-secondary)] font-sans leading-relaxed mb-8">
                EthAum's Medical Case gives every patient a secure, verified record of their complete cross-border care journey — from first diagnosis to final aftercare.
              </p>

              {/* 4 Dash Items */}
              <div className="space-y-3 font-sans text-sm text-[var(--text-primary)] mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-[var(--copper)] font-mono">&mdash;</span>
                  <span>Secure, verified medical records</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--copper)] font-mono">&mdash;</span>
                  <span>Multi-provider quote comparison</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--copper)] font-mono">&mdash;</span>
                  <span>AI-assisted provider coordination</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[var(--copper)] font-mono">&mdash;</span>
                  <span>Structured aftercare management</span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
                  className="btn-primary-cta"
                >
                  Create Medical Case
                </button>
              </div>
            </div>

            {/* Right Column (7 cols): Matched Providers Preview Card */}
            <div className="lg:col-span-7">
              <div className="bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px] p-6 sm:p-8">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border-hairline)] mb-6">
                  <h4 className="text-base font-medium text-[var(--text-primary)] font-sans">
                    Matched Providers — Cardiac Bypass
                  </h4>
                  <span className="text-xs font-sans text-[var(--green-rich)]">
                    3 Verified Matches
                  </span>
                </div>

                <div className="space-y-4 font-sans">
                  {/* Provider 1: Bumrungrad */}
                  <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        Bumrungrad International Hospital
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Bangkok, Thailand · JCI Accredited
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-medium text-[var(--copper)] tabular-nums">$4,200</div>
                      <div className="text-[10px] text-[var(--text-muted)]">USD</div>
                    </div>
                  </div>

                  {/* Provider 2: Anadolu */}
                  <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        Anadolu Medical Center
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Istanbul, Turkey · JCI Accredited
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-medium text-[var(--copper)] tabular-nums">$5,800</div>
                      <div className="text-[10px] text-[var(--text-muted)]">USD</div>
                    </div>
                  </div>

                  {/* Provider 3: Fortis */}
                  <div className="p-4 bg-[var(--bg-base)] border border-[var(--border-hairline)] rounded-[3px] flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-[var(--text-primary)]">
                        Fortis Memorial Research Institute
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-0.5">
                        Gurgaon, India · NABH
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-medium text-[var(--copper)] tabular-nums">$3,100</div>
                      <div className="text-[10px] text-[var(--text-muted)]">USD</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Below Section: 3 Horizontal Feature Pills */}
          <div className="mt-14 pt-8 border-t border-[var(--border-hairline)] flex flex-wrap items-center justify-center gap-4">
            <div className="text-[13px] font-sans text-[var(--text-secondary)] border border-[var(--border-default)] px-5 py-2 rounded-[3px] bg-[var(--bg-card)]">
              Secure Records
            </div>
            <div className="text-[13px] font-sans text-[var(--text-secondary)] border border-[var(--border-default)] px-5 py-2 rounded-[3px] bg-[var(--bg-card)]">
              Provider Comparison
            </div>
            <div className="text-[13px] font-sans text-[var(--text-secondary)] border border-[var(--border-default)] px-5 py-2 rounded-[3px] bg-[var(--bg-card)]">
              Aftercare Support
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. QUOTE COMPARISON (See what treatment actually costs)
          ================================================== */}
      <section className="py-20 lg:py-24 bg-[var(--bg-base)] border-t border-b border-[var(--border-hairline)] transition-colors duration-200 text-left">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Quote Comparison
          </p>

          <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-3">
            See what treatment actually costs.
          </h2>

          <p className="text-sm font-light text-[var(--text-secondary)] font-sans max-w-xl mb-12">
            Transparent pricing from three accredited providers for cardiac bypass surgery.
          </p>

          {/* 3 Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {quoteComparisonCards.map((card, idx) => (
              <div
                key={idx}
                className={`bg-[var(--bg-card)] border rounded-[4px] p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                  card.isRecommended
                    ? 'border-[var(--green-rich)] relative shadow-xs'
                    : 'border-[var(--border-default)]'
                }`}
              >
                <div>
                  {card.isRecommended && (
                    <div className="mb-4 inline-block px-2.5 py-0.5 rounded-[2px] bg-[var(--green-rich)]/15 border border-[var(--green-rich)]/30 text-[var(--green-rich)] text-[10px] font-medium font-sans uppercase tracking-[0.08em]">
                      Recommended
                    </div>
                  )}

                  <h3 className="text-lg font-medium text-[var(--text-primary)] font-sans mb-1">
                    {card.provider}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-sans mb-6">
                    {card.city} · {card.accreditation}
                  </p>

                  <div className="mb-6">
                    <div className="text-3xl sm:text-4xl font-serif text-[var(--copper)] tabular-nums mb-1 font-normal">
                      {card.price}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] font-sans font-light">
                      {card.priceNote}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[var(--border-hairline)] space-y-2.5 mb-8">
                    {card.inclusions.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs font-sans font-light text-[var(--text-secondary)]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--green-rich)] shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
                    className={`w-full py-2.5 px-4 text-xs font-sans rounded-[3px] transition-colors cursor-pointer text-center ${
                      card.isRecommended
                        ? 'bg-[var(--green-cta)] text-[var(--text-inverse)] hover:bg-[var(--green-hover)] font-medium'
                        : 'border border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] font-normal'
                    }`}
                  >
                    Select provider
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================================================
          7. VERIFIED PATIENT JOURNEYS (Testimonials)
          ================================================== */}
      <section className="py-20 lg:py-24 max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-left">
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
          <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          Verified Patient Journeys
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-12">
          From patients who made the journey.
        </h2>

        {/* Featured Large Quote */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="w-10 h-[1px] bg-[var(--copper)]/30 mx-auto mb-6" />

          <blockquote className="text-xl sm:text-2xl font-serif font-light italic text-[var(--text-primary)] leading-[1.5] mb-6">
            "EthAum organized everything I was afraid to face alone — the records, the quotes, the questions. I arrived in Bangkok knowing exactly where I was going and why."
          </blockquote>

          <div className="w-10 h-[1px] bg-[var(--copper)]/30 mx-auto mb-6" />

          <div className="text-[15px] font-medium text-[var(--text-primary)] font-sans">
            Priya Mehta
          </div>
          <div className="text-xs text-[var(--text-secondary)] font-sans mt-0.5">
            Cardiac Bypass Surgery · Bumrungrad International
          </div>
          <div className="text-[11px] text-[var(--text-muted)] uppercase tracking-[0.08em] font-sans mt-0.5">
            India
          </div>
        </div>

        {/* 2 Supporting Quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10 border-t border-[var(--border-hairline)] max-w-4xl mx-auto">
          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px]">
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed mb-4">
              "Seeing three providers side by side, with real numbers and real inclusions, made the decision clear."
            </p>
            <div className="text-[13px] font-medium text-[var(--text-primary)] font-sans">
              James O'Brien
            </div>
            <div className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
              Ireland · Hip Replacement · Germany
            </div>
          </div>

          <div className="p-6 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[4px]">
            <p className="text-sm font-light text-[var(--text-secondary)] font-sans leading-relaxed mb-4">
              "The Turkish surgeon received all 18 months of my reports before I even arrived. That alone changed everything."
            </p>
            <div className="text-[13px] font-medium text-[var(--text-primary)] font-sans">
              Layla Hassan
            </div>
            <div className="text-xs text-[var(--text-muted)] font-sans mt-0.5">
              UAE · Dental Implants · Turkey
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. FREQUENTLY ASKED QUESTIONS (FAQ)
          ================================================== */}
      <section className="py-20 max-w-4xl mx-auto px-6 sm:px-8 border-t border-[var(--border-hairline)] text-left">
        <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-3 flex items-center gap-2.5 font-sans">
          <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          Frequently Asked Questions
        </p>

        <h2 className="text-3xl sm:text-4xl lg:text-[46px] font-serif font-normal text-[var(--text-primary)] tracking-[-0.025em] leading-[1.1] mb-10">
          Questions patients ask before they begin.
        </h2>

        <div className="divide-y divide-[var(--border-hairline)]">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIndex === idx
            return (
              <div
                key={idx}
                className={`py-5 transition-all duration-200 ${
                  isExpanded ? 'border-l-2 border-[var(--copper)] pl-4 -ml-4' : ''
                }`}
              >
                <button
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-base font-normal text-[var(--text-primary)] font-sans group-hover:text-[var(--text-secondary)] transition-colors">
                    {item.q}
                  </span>
                  <span
                    className={`text-xl font-light text-[var(--copper)] shrink-0 transition-transform duration-200 select-none ${
                      isExpanded ? 'rotate-45' : ''
                    }`}
                  >
                    +
                  </span>
                </button>

                {isExpanded && (
                  <div className="mt-3 text-[14px] sm:text-[15px] font-light text-[var(--text-secondary)] font-sans leading-[1.75]">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ==================================================
          9. FINAL CTA SECTION (Ready to explore...)
          ================================================== */}
      <section className="relative py-24 lg:py-28 bg-[var(--bg-canvas)] border-t border-[var(--border-hairline)] overflow-hidden text-center transition-colors duration-200">
        {/* Subtle Square Grid Background */}
        <div className="absolute inset-0 bg-grid-ethaum pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-6 sm:px-8">
          <p className="text-[11px] font-normal uppercase tracking-[0.12em] text-[var(--green-rich)] mb-4 inline-flex items-center gap-2.5 font-sans">
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
            Get started today
            <span className="inline-block w-6 h-[1px] bg-[var(--green-rich)]" />
          </p>

          <h2 className="text-3xl sm:text-5xl lg:text-[56px] font-serif font-light text-[var(--text-primary)] leading-[1.1] tracking-[-0.03em] max-w-2xl mx-auto">
            Ready to explore world-class care options?
          </h2>

          <p className="mt-5 text-[15px] sm:text-base font-light text-[var(--text-secondary)] font-sans leading-[1.75] max-w-[420px] mx-auto">
            Create your Medical Case in minutes. No commitment, no cost to patients — just clarity.
          </p>

          <div className="mt-8 flex justify-center">
            <button
              onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
              className="btn-primary-cta"
            >
              Create a Medical Case
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
