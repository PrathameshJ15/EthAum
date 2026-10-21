import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Lock,
  FileText,
  CheckCircle2,
  Video,
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  Sparkles,
  Check,
  MapPin,
  Award,
} from 'lucide-react'
import { Photo, StatusBadge, Button, Card } from '../components'

export function HomePage({ onCreateCase }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Smooth scroll to section if hash exists in URL on mount or hash change
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const timer = setTimeout(() => {
        const el = document.getElementById(id)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [location.hash])

  // Active Tab in Medical Case Preview Mockup
  const [activeCaseTab, setActiveCaseTab] = useState('overview')

  // FAQ Accordion State
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(0)

  // 4-Step Journey per DESIGN.md Section 6
  const journeySteps = [
    {
      number: '01',
      title: 'Discover Treatments',
      description: 'Explore clinically validated procedures and JCI/NABH accredited quaternary medical centers across 47 countries.',
    },
    {
      number: '02',
      title: 'Open Medical Case',
      description: 'Create your private sovereign dossier — your encrypted, central healthcare record that you control completely.',
    },
    {
      number: '03',
      title: 'Upload Records',
      description: 'Securely upload MRIs, blood panels, and clinical histories. Grant or revoke doctor access with a single click.',
    },
    {
      number: '04',
      title: 'Compare & Aftercare',
      description: 'Receive itemized institutional quotes with zero markup, consult via video, and coordinate recovery directives.',
    },
  ]

  // Direct Institutional Quotes comparison table data matching real specifications
  const quoteComparisonRows = [
    {
      provider: 'Fortis Memorial Research Institute',
      city: 'Gurgaon, India',
      accreditation: 'NABH',
      stay: '5 nights inpatient',
      price: '$3,100 USD',
      inclusions: 'Pre-op diagnostic workup, surgeon fees, 5-night private room, medications, airport transfer',
      recommended: false,
    },
    {
      provider: 'Bumrungrad International Hospital',
      city: 'Bangkok, Thailand',
      accreditation: 'JCI Accredited',
      stay: '7 nights inpatient',
      price: '$4,200 USD',
      inclusions: 'Chief surgeon consultation, 7-night VIP suite, cardiac rehab program, 24-mo remote aftercare',
      recommended: true,
    },
    {
      provider: 'Anadolu Medical Center',
      city: 'Istanbul, Turkey',
      accreditation: 'JCI Accredited',
      stay: '6 nights inpatient',
      price: '$5,800 USD',
      inclusions: 'Johns Hopkins affiliate protocol, 6-night stay, dedicated international concierge, translation',
      recommended: false,
    },
  ]

  // Leading Medical Tourism Hubs with local authentic photos
  const destinations = [
    {
      name: 'Thailand',
      city: 'Bangkok & Phuket',
      image: '/images/dest-bangkok.webp',
      centers: '68 Verified Centers',
      accreditation: 'JCI Quaternary Hub',
      specialties: 'Cardiology, Orthopaedics, Executive Health',
      href: '/destinations/thailand',
    },
    {
      name: 'Turkey',
      city: 'Istanbul & Ankara',
      image: '/images/dest-istanbul.webp',
      centers: '54 Verified Centers',
      accreditation: 'JCI & Johns Hopkins Affiliate',
      specialties: 'Oncology, Transplants, Neuro-Rehab',
      href: '/destinations/turkey',
    },
    {
      name: 'India',
      city: 'Delhi, Mumbai, Bengaluru',
      image: '/images/dest-delhi.webp',
      centers: '82 Verified Centers',
      accreditation: 'NABH & JCI Quaternary',
      specialties: 'Cardiac Surgery, Joint Replacement, Bone Marrow',
      href: '/destinations/india',
    },
  ]

  // Real clinical & operational FAQ matching DESIGN.md rules
  const faqItems = [
    {
      q: 'What is a Medical Case on EthAum?',
      a: 'A Medical Case is your secure, patient-owned healthcare dossier. It holds your medical history, imaging scans, and specialist summaries in one place. You choose exactly which hospitals can view your records, and you can revoke access at any time.',
    },
    {
      q: 'How does EthAum verify healthcare providers?',
      a: 'All participating hospitals hold internationally recognized quaternary accreditations — Joint Commission International (JCI), NABH, or equivalent national standards. We verify medical licensing, clinical safety records, and surgeon credentials before onboarding.',
    },
    {
      q: 'Are my medical records private and HIPAA compliant?',
      a: 'Yes. All documents are encrypted in transit (TLS 1.3) and at rest (AES-256). EthAum enforces strict HIPAA and GDPR compliance with zero third-party data sharing. Only authorized clinicians can view your files.',
    },
    {
      q: 'Does EthAum add markups to hospital treatment prices?',
      a: 'No. EthAum quotes come directly from the hospital administration with full itemization of surgeon fees, room charges, and medications. You pay the exact same price as a direct patient, with zero hidden markups.',
    },
  ]

  return (
    <div className="w-full bg-[var(--bg)] text-[var(--text)] transition-colors duration-150">
      {/* ==================================================
          2. HERO SECTION (Split Layout per DESIGN.md)
          ================================================== */}
      <section id="hero" className="relative pt-12 sm:pt-16 lg:pt-20 pb-16 lg:pb-24 border-b border-[var(--border)] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            {/* Left Content Column (7 cols) */}
            <div className="lg:col-span-7">
              {/* Eyebrow Label per DESIGN.md: 13px, 600, uppercase */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-sm,6px)] bg-[var(--surface-alt)] border border-[var(--border)] text-[13px] font-semibold text-[var(--action-text)] tracking-[0.08em] uppercase mb-6">
                <span className="w-2 h-2 rounded-full bg-[var(--action)]" />
                <span>Accredited Quaternary Healthcare · Zero Markup</span>
              </div>

              {/* H1 Headline per DESIGN.md: 60px desktop, 38px mobile, Manrope 800 */}
              <h1 className="text-[38px] sm:text-[46px] lg:text-[58px] font-heading font-extrabold text-[var(--text-heading)] leading-[1.08] tracking-[-0.025em] max-w-[620px]">
                Global Care. Closer to You.
              </h1>

              {/* Paragraph max 520px per DESIGN.md: 18px desktop, line-height 1.6 */}
              <p className="mt-6 text-base sm:text-lg font-normal text-[var(--text-muted)] leading-[1.6] max-w-[520px]">
                EthAum coordinates your cross-border care journey — patient-controlled medical records, verified quaternary hospitals, and transparent institutional quotes across 47 countries.
              </p>

              {/* Primary Action + Secondary Button */}
              <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
                  className="btn-primary-cta"
                >
                  Open Medical Case
                </button>
                <a
                  href="#treatments"
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById('treatments')
                    el?.scrollIntoView({ behavior: 'smooth' })
                    window.history.pushState(null, '', '/#treatments')
                  }}
                  className="btn-secondary-ghost inline-flex items-center gap-2"
                >
                  <span>Explore Treatments</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust Indicators: clinical info never below 14px */}
              <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-wrap items-center gap-6 text-sm font-medium text-[var(--text-muted)]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--action)] shrink-0" />
                  <span>JCI & NABH Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--action)] shrink-0" />
                  <span>HIPAA & GDPR Sovereign Vault</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[var(--action)] shrink-0" />
                  <span>Direct Hospital Pricing</span>
                </div>
              </div>
            </div>

            {/* Right Doctor Hero Visual (from user reference) */}
            <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
              <div className="w-full max-w-[500px] relative">
                {/* Soft ambient aura matching the reference screenshot */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#EBF3FE] via-[#F0F6FF] to-transparent rounded-full blur-2xl opacity-80 pointer-events-none" />

                {/* Doctor Hero Graphic with clean rounded card frame */}
                <div className="relative z-10 w-full overflow-hidden rounded-[28px] bg-gradient-to-b from-[#FFFFFF] to-[#F8FAFC] p-3 sm:p-4 border border-[#E2E8F0] shadow-[0_16px_40px_rgba(16,42,67,0.06)]">
                  <img
                    src="/images/doctor-hero.png"
                    alt="Accredited consulting physician providing international medical care and tele-consultations"
                    className="w-full h-auto object-contain rounded-[20px]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          3. PLAIN-LANGUAGE TRANSPARENCY STRIP
          ================================================== */}
      <section className="py-8 bg-[var(--surface-alt)] border-b border-[var(--border)]">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-heading)]">Itemized Hospital Quotes</h4>
                <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  Real numbers with doctor fees, room nights, and surgical inclusions stated upfront.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-heading)]">Instant Access Revocation</h4>
                <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  You decide which doctors view your scans. Grant or revoke record access at any time.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[var(--text-heading)]">Non-Diagnostic Safety</h4>
                <p className="text-sm text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  AI assists only with document indexing and missing scan detection. Real doctors make decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          4. FOUR-STEP JOURNEY (Numbered Columns with Top Rule)
          ================================================== */}
      <section id="how-it-works" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 max-w-[1200px] mx-auto px-6 sm:px-8 text-left">
        <div className="mb-14">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-3">
            Clinical Care Pathway
          </p>
          <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
            How EthAum coordinates your cross-border care.
          </h2>
          <p className="mt-3 text-base sm:text-[17px] text-[var(--text-muted)] leading-[1.6] max-w-xl">
            A structured, transparent pathway designed for clarity and medical safety from first consultation to final recovery.
          </p>
        </div>

        {/* 4 Numbered Columns with Top Rules (Not cards, per DESIGN.md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {journeySteps.map((step) => (
            <div key={step.number} className="pt-6 border-t-2 border-[var(--border-strong)]">
              <span className="text-xs font-semibold text-[var(--action)] tracking-wider">
                STEP {step.number}
              </span>
              <h3 className="text-lg font-heading font-bold text-[var(--text-heading)] mt-2 mb-2">
                {step.title}
              </h3>
              <p className="text-sm font-normal text-[var(--text-muted)] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================================================
          5. POPULAR TREATMENTS & PROCEDURES
          ================================================== */}
      <section id="treatments" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 bg-[var(--surface-alt)] border-t border-b border-[var(--border)] text-left">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
                Accredited Clinical Specialties
              </p>
              <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
                Verified procedures patients travel for.
              </h2>
            </div>
            <Link
              to="/treatments"
              className="text-sm font-semibold text-[var(--action-text)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View full procedure directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Editorial Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Featured Procedure (7 cols) */}
            <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[var(--action-text)]">Cardiology · Quaternary Care</span>
                  <StatusBadge status="VERIFIED" customLabel="JCI Accredited Facility" size="sm" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-heading)] mb-3">
                  Cardiac Bypass Surgery (CABG)
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
                  Comprehensive cardiovascular surgical packages in Bangkok's leading JCI-accredited cardiac institutes. Pre-operative angiography review, telemetry recovery, and 24-month remote cardiologist follow-up.
                </p>
                <div className="grid grid-cols-2 gap-4 p-4 rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] border border-[var(--border)] mb-6 text-sm">
                  <div>
                    <span className="text-[var(--text-muted)] block text-xs">Estimated Inpatient Stay</span>
                    <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">5–7 Days Inpatient</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-xs">Institutional Cost</span>
                    <span className="font-bold tabular-nums text-[var(--action-text)] mt-0.5 block">From $4,200 USD</span>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-sm text-[var(--text-muted)]">Includes pre-surgical workup & aftercare</span>
                <Link to="/treatments/cardiac-bypass" className="text-sm font-semibold text-[var(--action-text)] hover:underline">
                  View procedure specs →
                </Link>
              </div>
            </div>

            {/* Stacked Procedures (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Orthopaedics</span>
                    <span className="text-sm font-bold tabular-nums text-[var(--text-heading)]">From $8,500 USD</span>
                  </div>
                  <h4 className="text-lg font-heading font-bold text-[var(--text-heading)] mb-1">
                    Total Knee & Hip Arthroplasty
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Robotic-assisted joint replacement in accredited German & Indian orthopedic centers.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--border)] flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] text-xs">NABH / ISO 9001 Certified</span>
                  <Link to="/treatments/knee-replacement" className="font-semibold text-[var(--action-text)] hover:underline">
                    Details →
                  </Link>
                </div>
              </div>

              <div className="flex-1 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg,12px)] p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Maxillofacial & Dental</span>
                    <span className="text-sm font-bold tabular-nums text-[var(--text-heading)]">From $1,800 USD</span>
                  </div>
                  <h4 className="text-lg font-heading font-bold text-[var(--text-heading)] mb-1">
                    All-on-4 Full Dental Restoration
                  </h4>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                    Surgical titanium implants and immediate 3D-scanned zirconia prosthetics in Istanbul.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--border)] flex justify-between items-center text-sm">
                  <span className="text-[var(--text-muted)] text-xs">JCI Accredited Facility</span>
                  <Link to="/treatments/dental-implants-all-on-4" className="font-semibold text-[var(--action-text)] hover:underline">
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          6. LEADING QUATERNARY DESTINATIONS
          ================================================== */}
      <section id="destinations" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 max-w-[1200px] mx-auto px-6 sm:px-8 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
              Global Healthcare Destinations
            </p>
            <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
              Quaternary medical centers by country.
            </h2>
            <p className="text-base text-[var(--text-muted)] mt-2 max-w-xl">
              Strictly accredited hospital districts with proven surgical safety records and dedicated international patient concierges.
            </p>
          </div>
          <Link
            to="/destinations"
            className="text-sm font-semibold text-[var(--action-text)] hover:underline inline-flex items-center gap-1 shrink-0"
          >
            <span>Explore all 47 countries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {destinations.map((dest) => (
            <Link
              key={dest.name}
              to={dest.href}
              className="group bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] rounded-[var(--radius-lg,12px)] overflow-hidden transition-all flex flex-col"
            >
              <div className="w-full aspect-[16/10] overflow-hidden bg-[var(--surface-alt)] relative">
                <img
                  src={dest.image}
                  alt={`Medical tourism district in ${dest.name}`}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 dark:brightness-90"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-[var(--action-text)]">{dest.centers}</span>
                    <span className="text-xs px-2 py-0.5 rounded-[var(--radius-sm,6px)] bg-[var(--surface-alt)] text-[var(--text-heading)] font-medium">
                      {dest.accreditation}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading font-bold text-[var(--text-heading)] mb-1">
                    {dest.name}
                  </h3>
                  <p className="text-sm text-[var(--text-muted)] mb-3">
                    {dest.city}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    Specialties: <span className="text-[var(--text-heading)] font-medium">{dest.specialties}</span>
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-[var(--border)] flex items-center justify-between text-sm font-semibold text-[var(--action-text)]">
                  <span>View destination centers</span>
                  <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ==================================================
          7. VERIFIED QUATERNARY PROVIDERS
          ================================================== */}
      <section id="providers" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 bg-[var(--surface-alt)] border-t border-b border-[var(--border)] text-left">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
                Accredited Hospital Network
              </p>
              <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
                Verified quaternary medical centers.
              </h2>
              <p className="text-base text-[var(--text-muted)] mt-2 max-w-xl">
                Every listed institution is independently audited for clinical hygiene, surgeon board certifications, and zero hidden hospital markups.
              </p>
            </div>
            <Link
              to="/providers"
              className="text-sm font-semibold text-[var(--action-text)] hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>View all verified hospitals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-[var(--surface)] border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--action)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Bangkok, Thailand</span>
                  </div>
                  <StatusBadge status="VERIFIED" customLabel="JCI Accredited" size="sm" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-heading)] mb-2">
                  Bumrungrad International Hospital
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Quaternary multidisciplinary center with 580 inpatient beds, robotic cardiac suite, and dedicated international patient wing.
                </p>
                <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  <div>Specialties: <span className="font-medium text-[var(--text-heading)]">Cardiology, Oncology, Orthopaedics</span></div>
                  <div>Average response time: <span className="font-semibold text-[var(--action-text)]">Under 4 hours</span></div>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border)] flex items-center justify-between text-sm">
                <span className="text-xs text-[var(--text-muted)]">NABH / JCI Verified</span>
                <Link to="/providers/bumrungrad" className="font-semibold text-[var(--action-text)] hover:underline">
                  Hospital Profile →
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--surface)] border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--action)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Gurgaon, India</span>
                  </div>
                  <StatusBadge status="VERIFIED" customLabel="NABH Accredited" size="sm" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-heading)] mb-2">
                  Fortis Memorial Research Institute
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Top-ranked quaternary healthcare destination renowned for advanced robotics, neurosciences, and complex paediatric cardiac interventions.
                </p>
                <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  <div>Specialties: <span className="font-medium text-[var(--text-heading)]">Neuro-Spine, Cardiac Surgery, Transplants</span></div>
                  <div>Average response time: <span className="font-semibold text-[var(--action-text)]">Under 6 hours</span></div>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border)] flex items-center justify-between text-sm">
                <span className="text-xs text-[var(--text-muted)]">NABH Certified Quaternary</span>
                <Link to="/providers/fortis" className="font-semibold text-[var(--action-text)] hover:underline">
                  Hospital Profile →
                </Link>
              </div>
            </Card>

            <Card className="p-6 bg-[var(--surface)] border-[var(--border)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)] mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[var(--action)]" />
                    <span className="text-xs font-semibold text-[var(--text-muted)]">Istanbul, Turkey</span>
                  </div>
                  <StatusBadge status="VERIFIED" customLabel="JCI & Johns Hopkins" size="sm" />
                </div>
                <h3 className="text-xl font-heading font-bold text-[var(--text-heading)] mb-2">
                  Anadolu Medical Center
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Affiliated with Johns Hopkins Medicine, delivering oncology, bone marrow transplants, and stereotactic radiosurgery with European clinical standards.
                </p>
                <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                  <div>Specialties: <span className="font-medium text-[var(--text-heading)]">Comprehensive Oncology, Bone Marrow</span></div>
                  <div>Average response time: <span className="font-semibold text-[var(--action-text)]">Under 4 hours</span></div>
                </div>
              </div>
              <div className="pt-4 mt-6 border-t border-[var(--border)] flex items-center justify-between text-sm">
                <span className="text-xs text-[var(--text-muted)]">Johns Hopkins Affiliate</span>
                <Link to="/providers/anadolu" className="font-semibold text-[var(--action-text)] hover:underline">
                  Hospital Profile →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================================================
          8. PATIENT-CONTROLLED RECORDS & SOVEREIGNTY
          ================================================== */}
      <section id="records" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 max-w-[1200px] mx-auto px-6 sm:px-8 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column Text (6 cols) */}
          <div className="lg:col-span-6">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-3">
              Patient Data Sovereignty
            </p>
            <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] mb-6">
              Your health records. Completely under your control.
            </h2>
            <p className="text-base sm:text-[17px] text-[var(--text-muted)] leading-[1.6] mb-8">
              Cross-border healthcare often forces patients to repeatedly resend sensitive files via unencrypted emails. With EthAum, you store diagnostic scans in an encrypted sovereign vault and grant temporary access to specific hospitals.
            </p>

            <div className="space-y-4 text-sm font-medium text-[var(--text-heading)] mb-8">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>End-to-end encrypted storage with immutable access audit trails</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Revoke provider file permissions with one click at any time</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[var(--action)]/15 text-[var(--action)] flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
                <span>Automated missing pre-op diagnostic checklist detection</span>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
                className="btn-primary-cta"
              >
                Open Your Sovereign Vault
              </button>
            </div>
          </div>

          {/* Right Column Visual (6 cols) */}
          <div className="lg:col-span-6">
            <Card className="border-[var(--border)] p-6 bg-[var(--surface)]">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[var(--action)]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-heading)]">
                    Access Permission Manager
                  </span>
                </div>
                <StatusBadge status="ACTIVE" customLabel="Vault Encrypted" size="sm" />
              </div>

              <div className="space-y-3">
                <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)] flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-[var(--text-heading)] block">Bumrungrad Hospital</span>
                    <span className="text-[var(--text-muted)] text-xs">Access granted: 3 diagnostic scans</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-[var(--action-text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm,6px)]">
                    Authorized
                  </span>
                </div>

                <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)] flex items-center justify-between text-sm">
                  <div>
                    <span className="font-semibold text-[var(--text-heading)] block">Anadolu Medical Center</span>
                    <span className="text-[var(--text-muted)] text-xs">Access granted: Cardiac MRI report</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-[var(--action-text)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm,6px)]">
                    Authorized
                  </span>
                </div>

                <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)] flex items-center justify-between text-sm opacity-70">
                  <div>
                    <span className="font-semibold text-[var(--text-heading)] block">Fortis Healthcare</span>
                    <span className="text-[var(--text-muted)] text-xs">Access revoked on patient request</span>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-sm,6px)]">
                    Revoked
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ==================================================
          9. MEDICAL CASE WORKFLOW PREVIEW
          ================================================== */}
      <section id="case-preview" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 bg-[var(--surface-alt)] border-t border-b border-[var(--border)] text-left">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
              Centralized Healthcare Record
            </p>
            <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
              Inside your EthAum Medical Case.
            </h2>
            <p className="text-base text-[var(--text-muted)] mt-2">
              Every appointment, specialist finding, itemized quote, and recovery directive lives in a single coordinated interface.
            </p>
          </div>

          <Card className="border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[var(--border)] gap-4 mb-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Medical Dossier</span>
                <h3 className="text-xl font-heading font-bold text-[var(--text-heading)] mt-0.5">
                  Case #MC-2024-0891 · Priya Mehta
                </h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status="QUOTES_RECEIVED" size="md" />
              </div>
            </div>

            {/* Case Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-sm">
              <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)]">
                <span className="text-[var(--text-muted)] block text-xs">Treatment Requested</span>
                <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">Cardiac Consultation</span>
              </div>
              <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)]">
                <span className="text-[var(--text-muted)] block text-xs">Clinical Stage</span>
                <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">Quotes Received</span>
              </div>
              <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)]">
                <span className="text-[var(--text-muted)] block text-xs">Verified Records</span>
                <span className="font-semibold text-[var(--text-heading)] mt-0.5 block">3 Scans in Vault</span>
              </div>
              <div className="p-3.5 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)]">
                <span className="text-[var(--text-muted)] block text-xs">Hospital Inquiries</span>
                <span className="font-semibold text-[var(--action-text)] mt-0.5 block">3 Accredited Matches</span>
              </div>
            </div>

            {/* In-Case Navigation Tabs Mockup */}
            <div className="flex items-center gap-6 border-b border-[var(--border)] mb-6 text-sm">
              {['overview', 'records', 'quotes'].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveCaseTab(tab)}
                  className={`pb-3 capitalize font-semibold cursor-pointer transition-colors ${
                    activeCaseTab === tab
                      ? 'text-[var(--text-heading)] border-b-2 border-[var(--action)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-heading)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Body */}
            {activeCaseTab === 'overview' && (
              <div className="space-y-3 text-sm text-[var(--text-muted)] leading-relaxed">
                <p>
                  Patient presented with angina and coronary artery disease symptoms. Cardiac diagnostic reports and angiogram scans submitted on 12 Mar 2024. Three accredited quaternary hospitals have issued comprehensive itemized treatment proposals.
                </p>
              </div>
            )}
            {activeCaseTab === 'records' && (
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-[var(--radius-md,8px)] text-sm">
                <div className="p-3 flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-heading)]">Cardiology_Report_2024.pdf</span>
                  <span className="text-xs text-[var(--text-muted)]">Verified · 12 Mar</span>
                </div>
                <div className="p-3 flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-heading)]">Coronary_Angiogram_Scan.dcm</span>
                  <span className="text-xs text-[var(--text-muted)]">Verified · 08 Mar</span>
                </div>
              </div>
            )}
            {activeCaseTab === 'quotes' && (
              <div className="text-sm text-[var(--text-muted)]">
                <p>3 itemized institutional quotes available in Quote Comparison table below.</p>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* ==================================================
          10. QUOTE COMPARISON TABLE (Per DESIGN.md Section 6)
          ================================================== */}
      <section id="quotes" className="scroll-mt-20 sm:scroll-mt-24 py-20 lg:py-24 max-w-[1200px] mx-auto px-6 sm:px-8 text-left">
        <div className="mb-12">
          <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
            Institutional Pricing Transparency
          </p>
          <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15]">
            Compare quotes side by side.
          </h2>
          <p className="text-base text-[var(--text-muted)] mt-2 max-w-xl">
            Real institutional pricing from accredited medical centers. Compare stays, inclusions, and hospital credentials with complete transparency.
          </p>
        </div>

        {/* Structured Table Container per DESIGN.md */}
        <div className="overflow-x-auto border border-[var(--border)] rounded-[var(--radius-lg,12px)] bg-[var(--surface)]">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface-alt)] text-xs font-bold uppercase text-[var(--text-muted)] tracking-wider">
                <th className="py-4 px-6">Hospital & Location</th>
                <th className="py-4 px-6">Accreditation</th>
                <th className="py-4 px-6">Stay Duration</th>
                <th className="py-4 px-6">Package Inclusions</th>
                <th className="py-4 px-6 text-right">All-Inclusive Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {quoteComparisonRows.map((row, idx) => (
                <tr key={idx} className={row.recommended ? 'bg-[var(--action)]/5' : ''}>
                  <td className="py-4 px-6">
                    <div className="font-semibold text-[var(--text-heading)]">{row.provider}</div>
                    <div className="text-xs text-[var(--text-muted)]">{row.city}</div>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status="VERIFIED" customLabel={row.accreditation} size="sm" />
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-muted)] font-medium">
                    {row.stay}
                  </td>
                  <td className="py-4 px-6 text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
                    {row.inclusions}
                  </td>
                  <td className="py-4 px-6 text-right font-heading font-bold text-base text-[var(--text-heading)] tabular-nums">
                    {row.price}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==================================================
          11. CONSULTATION AND AFTERCARE
          ================================================== */}
      <section className="py-20 lg:py-24 bg-[var(--surface-alt)] border-t border-b border-[var(--border)] text-left">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
                Continuous Clinical Coordination
              </p>
              <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] mb-4">
                Specialist tele-consultation before you travel. Structured aftercare when you return.
              </h2>
              <p className="text-base text-[var(--text-muted)] leading-relaxed mb-6">
                EthAum coordinates private video sessions with your operating surgeon before departure. Following treatment, your Medical Case transfers clinical discharge directives, medication schedules, and rehabilitation plans back to your home general practitioner.
              </p>
              <div className="space-y-3.5 text-sm font-medium text-[var(--text-heading)]">
                <div className="flex items-center gap-2.5">
                  <Video className="w-4 h-4 text-[var(--action)]" />
                  <span>Secure HIPAA video consultation with operating surgeon</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-[var(--action)]" />
                  <span>Daily post-operative milestone and wound care tracking</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-[var(--action)]" />
                  <span>24-month structured digital aftercare monitoring</span>
                </div>
              </div>
            </div>

            <div>
              <Card className="border-[var(--border)] p-6 bg-[var(--surface)]">
                <div className="flex items-center justify-between pb-4 border-b border-[var(--border)] mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-[var(--action)]" />
                    <span className="text-xs font-bold text-[var(--text-heading)] uppercase tracking-wider">Tele-Consultation Active</span>
                  </div>
                  <span className="text-xs text-[var(--action-text)] font-semibold">14:00 UTC · Confirmed</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                  Chief of Cardiac Surgery, Dr. Somchai Prasert (Bumrungrad) will review coronary angiogram slices and discuss minimally invasive bypass options.
                </p>
                <div className="p-3.5 bg-[var(--surface-alt)] rounded-[var(--radius-md,8px)] border border-[var(--border)] flex justify-between items-center text-sm">
                  <span className="text-[var(--text-heading)] font-semibold">Secure Video Link Encrypted</span>
                  <span className="text-[var(--action-text)] font-semibold">Ready to connect</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================
          12. FREQUENTLY ASKED QUESTIONS (Accordion)
          ================================================== */}
      <section id="faq" className="scroll-mt-20 sm:scroll-mt-24 py-20 max-w-[800px] mx-auto px-6 sm:px-8 text-left">
        <p className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[var(--action)] mb-2">
          Frequently Asked Questions
        </p>
        <h2 className="text-3xl sm:text-[38px] font-heading font-bold text-[var(--text-heading)] tracking-[-0.02em] leading-[1.15] mb-10">
          Everything patients ask before they begin.
        </h2>

        <div className="divide-y divide-[var(--border)] border-t border-b border-[var(--border)]">
          {faqItems.map((item, idx) => {
            const isExpanded = expandedFaqIndex === idx
            return (
              <div key={idx} className="py-5">
                <button
                  type="button"
                  onClick={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  className="w-full flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="text-base sm:text-[17px] font-semibold text-[var(--text-heading)] group-hover:text-[var(--action-text)] transition-colors">
                    {item.q}
                  </span>
                  <span className="text-xl font-light text-[var(--action)] shrink-0 select-none">
                    {isExpanded ? '−' : '+'}
                  </span>
                </button>
                {isExpanded && (
                  <p className="mt-3 text-sm sm:text-base text-[var(--text-muted)] leading-[1.6]">
                    {item.a}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ==================================================
          13. FINAL CTA BAND (Deep Teal per DESIGN.md Section 6)
          ================================================== */}
      <section className="py-20 lg:py-24 bg-[var(--text-heading)] text-white text-center">
        <div className="max-w-[720px] mx-auto px-6 sm:px-8">
          <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--action-text)] mb-3">
            Start Your Journey
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-[-0.025em] leading-[1.15]">
            Ready to explore world-class care options?
          </h2>
          <p className="mt-4 text-base text-white/80 leading-relaxed max-w-lg mx-auto">
            Open your secure Medical Case in minutes. No commitment, zero markup, patient-controlled records.
          </p>
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
              className="bg-[var(--action)] text-white font-semibold text-base py-3 px-8 min-h-[48px] rounded-[var(--radius-md,8px)] hover:opacity-95 transition-opacity cursor-pointer shadow-sm"
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
