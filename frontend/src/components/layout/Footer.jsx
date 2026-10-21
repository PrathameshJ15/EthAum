import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Activity } from 'lucide-react'
import { useTranslation } from '../../i18n'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer({ onNavigate }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLinkClick = (href, e) => {
    if (href.startsWith('/#')) {
      e.preventDefault()
      const targetId = href.replace('/#', '')
      if (location.pathname === '/') {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', href)
        }
      } else {
        navigate(href)
      }
      return
    }

    if (href === '/') {
      if (location.pathname === '/') {
        e.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
        window.history.pushState(null, '', '/')
        return
      }
    }

    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  return (
    <footer className="w-full bg-[var(--surface-alt)] text-[var(--text)] pt-16 pb-12 border-t border-[var(--border)] mt-auto transition-colors duration-150">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 text-left rtl:text-right">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-[var(--border)]">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" onClick={(e) => handleLinkClick('/', e)} className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="EthAum"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-heading font-extrabold text-[var(--text-heading)] tracking-tight">
                EthAum
              </span>
            </Link>
            <p className="text-sm font-normal text-[var(--text-muted)] leading-relaxed max-w-sm">
              {t('brand.tagline', 'International healthcare coordination — patient-controlled medical records, accredited hospital matching, and transparent institutional quotes.')}
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-heading)] font-heading">
              {t('nav.treatments', 'Product')}
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/#treatments" onClick={(e) => handleLinkClick('/#treatments', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  {t('nav.treatments', 'Treatments')}
                </Link>
              </li>
              <li>
                <Link to="/#destinations" onClick={(e) => handleLinkClick('/#destinations', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  {t('nav.destinations', 'Destinations')}
                </Link>
              </li>
              <li>
                <Link to="/#providers" onClick={(e) => handleLinkClick('/#providers', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  {t('nav.providers', 'Providers')}
                </Link>
              </li>
              <li>
                <Link to="/create-case" onClick={(e) => handleLinkClick('/create-case', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  {t('nav.case', 'Medical Case')}
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-heading)] font-heading">
              For Patients
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/#how-it-works" onClick={(e) => handleLinkClick('/#how-it-works', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/create-case" onClick={(e) => handleLinkClick('/create-case', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Open a Case
                </Link>
              </li>
              <li>
                <Link to="/#faq" onClick={(e) => handleLinkClick('/#faq', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Patient FAQ
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Clinical Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-heading)] font-heading">
              For Providers
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/login" onClick={(e) => handleLinkClick('/login', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Provider Access
                </Link>
              </li>
              <li>
                <Link to="/provider" onClick={(e) => handleLinkClick('/provider', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Hospital Portal
                </Link>
              </li>
              <li>
                <Link to="/providers" onClick={(e) => handleLinkClick('/providers', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Accredited Centers
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--text-heading)] font-heading">
              Compliance
            </h4>
            <ul className="space-y-2.5 text-sm text-[var(--text-muted)]">
              <li>
                <Link to="/privacy" onClick={(e) => handleLinkClick('/privacy', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={(e) => handleLinkClick('/terms', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-heading)] transition-colors">
                  Data Sovereignty
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-normal text-[var(--text-muted)]">
          <p>© {CURRENT_YEAR} EthAum. All rights reserved. Non-diagnostic clinical coordination platform.</p>
          <p className="tracking-wide">
            HIPAA Compliant · GDPR Compliant · Patient-Controlled Records
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
