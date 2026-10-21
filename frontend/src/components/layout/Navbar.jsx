import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Activity, Menu, Globe, User, PlusCircle, LogOut, LayoutDashboard, Building2, Shield } from 'lucide-react'
import { Button } from '../common/Button'
import { IconButton } from '../common/IconButton'
import { ThemeToggle } from '../common/ThemeToggle'
import { Drawer } from './Drawer'
import { useAuth } from '../../context/AuthContext'

export function Navbar({
  brandName = 'EthAum',
  brandLogo = '/logo.png',
  tagline = 'Global Care. Closer to You.',
  onCreateCase,
  onLogin,
  user: userProp = null,
  className = '',
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname
  
  const authContext = useAuth()
  const activeUser = userProp || authContext?.user || null
  const role = activeUser?.role || null

  const handleLogout = async () => {
    if (authContext?.logout) {
      await authContext.logout()
    }
    navigate('/login')
  }

  const getPortalRoute = () => {
    if (role === 'provider') return '/provider'
    if (role === 'admin') return '/admin'
    return '/dashboard'
  }

  const getPortalLabel = () => {
    if (role === 'provider') return 'Provider Portal'
    if (role === 'admin') return 'Admin Console'
    return 'My Cases'
  }

  const navLinks = [
    { label: 'Treatments', href: '/#treatments' },
    { label: 'Destinations', href: '/#destinations' },
    { label: 'Providers', href: '/#providers' },
    { label: 'How it works', href: '/#how-it-works' },
  ]

  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    if (currentPath !== '/') {
      setActiveSection('')
      return
    }

    const sectionIds = ['how-it-works', 'treatments', 'destinations', 'providers']
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 160
      let current = ''
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop
          if (scrollPosition >= top) {
            current = id
          }
        }
      }
      setActiveSection(current)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [currentPath])

  const handleLinkClick = (href) => {
    setMobileMenuOpen(false)
    if (href.startsWith('/#')) {
      const targetId = href.replace('/#', '')
      if (currentPath !== '/') {
        navigate(`/#${targetId}`)
      } else {
        const el = document.getElementById(targetId)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' })
          window.history.pushState(null, '', `/#${targetId}`)
          setActiveSection(targetId)
        }
      }
    } else if (href === '/') {
      if (currentPath === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        window.history.pushState(null, '', '/')
        setActiveSection('')
      } else {
        navigate('/')
      }
    } else {
      navigate(href)
    }
  }

  const isLinkActive = (linkHref) => {
    if (linkHref.startsWith('/#')) {
      const targetId = linkHref.replace('/#', '')
      return currentPath === '/' && activeSection === targetId
    }
    if (linkHref === '/') {
      return currentPath === '/' && !activeSection
    }
    return currentPath.startsWith(linkHref)
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] transition-colors duration-150 ${className}`.trim()}
    >
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-8 h-8 rounded-[var(--radius-md,8px)] bg-[var(--action)] text-[var(--on-action)] flex items-center justify-center">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
          )}
          <div className="text-left">
            <span className="block text-xl sm:text-[22px] font-heading font-extrabold text-[var(--text-heading)] leading-none tracking-tight">
              EthAum
            </span>
            <span className="hidden sm:block text-[11px] font-sans text-[var(--text-muted)] tracking-normal mt-0.5">
              Global Care. Closer to You.
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = isLinkActive(link.href)

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => handleLinkClick(link.href)}
                className={`nav-link-refined cursor-pointer select-none text-[15px] ${
                  isActive
                    ? 'active text-[var(--text-heading)] font-semibold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-heading)] font-medium'
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />

          {activeUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              {/* Role-Specific Portal Button */}
              <button
                type="button"
                onClick={() => navigate(getPortalRoute())}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-[var(--radius-md,8px)] bg-[var(--surface-alt)] text-[var(--text-heading)] hover:bg-[var(--border)] border border-[var(--border)] transition-colors cursor-pointer"
              >
                {role === 'provider' ? (
                  <Building2 className="w-3.5 h-3.5" />
                ) : role === 'admin' ? (
                  <Shield className="w-3.5 h-3.5" />
                ) : (
                  <LayoutDashboard className="w-3.5 h-3.5" />
                )}
                <span>{getPortalLabel()}</span>
              </button>

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md,8px)]">
                <div className="w-6 h-6 rounded-full bg-[var(--action)] text-[var(--on-action)] text-[11px] font-bold flex items-center justify-center">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left pr-1">
                  <span className="block text-xs font-semibold text-[var(--text-heading)] leading-tight max-w-[120px] truncate">
                    {activeUser.name || activeUser.email}
                  </span>
                  <span className="block text-[10px] font-medium uppercase tracking-wide text-[var(--action-text)]">
                    {role || 'Patient'}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out of EthAum"
                className="p-2 text-[var(--text-muted)] hover:text-[var(--error-text)] rounded-[var(--radius-md,8px)] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => (onCreateCase ? onCreateCase() : navigate('/create-case'))}
              className="btn-primary-cta"
            >
              Create Medical Case
            </button>
          )}
        </div>

        {/* Mobile Hamburger Toggle & Theme Switcher */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle size="sm" />

          {(!activeUser || role === 'patient') && (
            <Button
              variant="primary"
              size="sm"
              onClick={onCreateCase || (() => navigate('/create-case'))}
              className="text-xs px-3"
            >
              New Case
            </Button>
          )}

          <IconButton
            icon={<Menu className="w-5 h-5 text-[var(--text-heading)]" />}
            label="Open navigation menu"
            variant="ghost"
            size="sm"
            onClick={() => setMobileMenuOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            {brandLogo && (
              <img src={brandLogo} alt={brandName} className="w-6 h-6 object-contain" />
            )}
            <span className="font-heading font-extrabold text-lg text-[var(--text-heading)]">EthAum</span>
          </div>
        }
        size="sm"
      >
        <div className="flex flex-col h-full justify-between py-2">
          <div className="space-y-1">
            {activeUser && (
              <div className="p-3.5 mb-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-[var(--radius-md,8px)] flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-heading)]">{activeUser.name}</p>
                  <p className="text-xs text-[var(--action-text)] uppercase font-semibold tracking-wider">{role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getPortalRoute())
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-[var(--action)] text-[var(--on-action)] rounded-[var(--radius-md,8px)]"
                >
                  Portal
                </button>
              </div>
            )}

            {navLinks.map((link) => {
              const isActive = isLinkActive(link.href)

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleLinkClick(link.href)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-[15px] rounded-[var(--radius-md,8px)] font-medium text-left transition-colors cursor-pointer
                    ${
                      isActive
                        ? 'bg-[var(--surface-alt)] text-[var(--text-heading)] font-semibold border-l-2 border-[var(--action)]'
                        : 'text-[var(--text-muted)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-heading)]'
                    }`}
                >
                  <span>{link.label}</span>
                </button>
              )
            })}
          </div>

          <div className="pt-6 border-t border-[var(--border)] space-y-3">
            <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
              <span>Theme Appearance</span>
              <ThemeToggle size="sm" />
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-[var(--text-muted)]">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Currency & Language
              </span>
              <span className="font-semibold text-[var(--text-heading)]">USD · English</span>
            </div>

            {activeUser ? (
              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out ({activeUser.name?.split(' ')[0]})
              </Button>
            ) : (
              <div className="space-y-2 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (onLogin) onLogin()
                    else navigate('/login')
                  }}
                  leftIcon={<User className="w-4 h-4" />}
                >
                  Login
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => {
                    setMobileMenuOpen(false)
                    if (onCreateCase) onCreateCase()
                    else navigate('/create-case')
                  }}
                  leftIcon={<PlusCircle className="w-4 h-4" />}
                >
                  Create Medical Case
                </Button>
              </div>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  )
}

export default Navbar
