import React from 'react'
import { Link } from 'react-router-dom'
import { Activity, Shield, AlertTriangle } from 'lucide-react'

const CURRENT_YEAR = new Date().getFullYear()

export function Footer({ onNavigate }) {
  const handleLinkClick = (href, e) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  return (
    <footer className="w-full bg-[var(--bg-base)] text-[var(--text-secondary)] pt-16 pb-12 border-t border-[var(--border-hairline)] mt-auto transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-left">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-12 border-b border-[var(--border-hairline)]">
          {/* Brand Info (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="EthAum"
                className="w-8 h-8 object-contain"
              />
              <span className="text-xl font-serif font-light text-[var(--text-primary)] tracking-tight">
                Eth<span className="italic">A</span>um
              </span>
            </Link>
            <p className="text-xs font-light text-[var(--text-secondary)] leading-relaxed max-w-sm font-sans">
              International healthcare coordination — verified, organized, transparent.
            </p>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-normal uppercase tracking-[0.1em] text-[var(--text-primary)] font-sans">
              Product
            </h4>
            <ul className="space-y-2 text-xs font-light text-[var(--text-secondary)] font-sans">
              <li>
                <Link to="/treatments" onClick={(e) => handleLinkClick('/treatments', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Treatments
                </Link>
              </li>
              <li>
                <Link to="/destinations" onClick={(e) => handleLinkClick('/destinations', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Destinations
                </Link>
              </li>
              <li>
                <Link to="/providers" onClick={(e) => handleLinkClick('/providers', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Providers
                </Link>
              </li>
              <li>
                <Link to="/create-case" onClick={(e) => handleLinkClick('/create-case', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Medical Case
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-normal uppercase tracking-[0.1em] text-[var(--text-primary)] font-sans">
              For Patients
            </h4>
            <ul className="space-y-2 text-xs font-light text-[var(--text-secondary)] font-sans">
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/create-case" onClick={(e) => handleLinkClick('/create-case', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Get a quote
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Patient guide
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-normal uppercase tracking-[0.1em] text-[var(--text-primary)] font-sans">
              For Providers
            </h4>
            <ul className="space-y-2 text-xs font-light text-[var(--text-secondary)] font-sans">
              <li>
                <Link to="/login" onClick={(e) => handleLinkClick('/login', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Join EthAum
                </Link>
              </li>
              <li>
                <Link to="/provider" onClick={(e) => handleLinkClick('/provider', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Partner portal
                </Link>
              </li>
              <li>
                <Link to="/providers" onClick={(e) => handleLinkClick('/providers', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Accreditation
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-normal uppercase tracking-[0.1em] text-[var(--text-primary)] font-sans">
              Company
            </h4>
            <ul className="space-y-2 text-xs font-light text-[var(--text-secondary)] font-sans">
              <li>
                <Link to="/how-it-works" onClick={(e) => handleLinkClick('/how-it-works', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" onClick={(e) => handleLinkClick('/privacy', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" onClick={(e) => handleLinkClick('/terms', e)} className="hover:text-[var(--text-primary)] transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-light font-sans text-[var(--text-muted)]">
          <p>© {CURRENT_YEAR} EthAum. All rights reserved.</p>
          <p className="tracking-[0.04em]">
            HIPAA Compliant · GDPR Compliant · JCI Verified
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
