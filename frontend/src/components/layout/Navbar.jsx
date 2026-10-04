import React, { useState } from 'react'
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
    { label: 'Treatments', href: '/treatments' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Providers', href: '/providers' },
    { label: 'How it works', href: '/how-it-works' },
  ]

  const handleLinkClick = (href) => {
    setMobileMenuOpen(false)
    if (href.startsWith('/#')) {
      if (currentPath !== '/') {
        navigate('/')
        setTimeout(() => {
          const el = document.getElementById(href.replace('/#', ''))
          el?.scrollIntoView({ behavior: 'smooth' })
        }, 150)
      } else {
        const el = document.getElementById(href.replace('/#', ''))
        el?.scrollIntoView({ behavior: 'smooth' })
      }
    } else {
      navigate(href)
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 w-full bg-[var(--bg-canvas)]/92 backdrop-blur-md border-b border-[var(--border-hairline)] transition-colors duration-200 ${className}`.trim()}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Brand */}
        <div
          onClick={() => handleLinkClick('/')}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-[var(--green-rich)] text-[var(--text-inverse)] flex items-center justify-center">
              <Activity className="w-4 h-4 stroke-[2.2]" />
            </div>
          )}
          <div className="text-left">
            <span className="block text-xl sm:text-[22px] font-serif font-light text-[var(--text-primary)] leading-none tracking-tight">
              Eth<span className="italic font-normal">A</span>um
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? currentPath === '/'
                : !link.href.startsWith('/#') && currentPath.startsWith(link.href)

            return (
              <button
                key={link.label}
                type="button"
                onClick={() => handleLinkClick(link.href)}
                className={`nav-link-refined cursor-pointer select-none ${
                  isActive ? 'active text-[var(--text-primary)] font-medium' : ''
                }`}
              >
                {link.label}
              </button>
            )
          })}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          {/* Theme Switcher Capsule Toggle */}
          <ThemeToggle />

          {activeUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-hairline)]">
              {/* Role-Specific Portal Button */}
              <button
                type="button"
                onClick={() => navigate(getPortalRoute())}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-[3px] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[var(--border-strong)] border border-[var(--border-default)] transition-colors cursor-pointer"
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
              <div className="flex items-center gap-2 px-2.5 py-1 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[3px]">
                <div className="w-6 h-6 rounded-full bg-[var(--green-rich)] text-[var(--text-inverse)] text-[10px] font-bold flex items-center justify-center">
                  {activeUser.name ? activeUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="text-left pr-1">
                  <span className="block text-xs font-medium text-[var(--text-primary)] leading-tight max-w-[120px] truncate">
                    {activeUser.name || activeUser.email}
                  </span>
                  <span className="block text-[9px] font-normal uppercase tracking-wide text-[var(--copper)]">
                    {role || 'User'}
                  </span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Sign out of EthAum"
                className="p-1.5 text-[var(--text-muted)] hover:text-[#A33B39] rounded-[3px] transition-colors cursor-pointer"
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
              className="text-xs px-2.5 py-1.5"
            >
              Case
            </Button>
          )}

          <IconButton
            icon={<Menu className="w-5 h-5 text-[var(--text-primary)]" />}
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
            <span className="font-serif">Eth<span className="italic">A</span>um</span>
          </div>
        }
        size="sm"
      >
        <div className="flex flex-col h-full justify-between py-2">
          <div className="space-y-1">
            {activeUser && (
              <div className="p-3 mb-3 bg-[var(--bg-elevated)] border border-[var(--border-hairline)] rounded-[4px] flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[var(--text-primary)]">{activeUser.name}</p>
                  <p className="text-[10px] text-[var(--copper)] uppercase tracking-wider">{role}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    navigate(getPortalRoute())
                  }}
                  className="px-2.5 py-1 text-xs font-medium bg-[var(--green-cta)] text-[var(--text-inverse)] rounded-[3px]"
                >
                  Portal
                </button>
              </div>
            )}

            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? currentPath === '/'
                  : !link.href.startsWith('/#') && currentPath.startsWith(link.href)

              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleLinkClick(link.href)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm rounded-xl font-medium text-left transition-colors cursor-pointer
                    ${
                      isActive
                        ? 'bg-[#E6EFEB] text-[#173E39] dark:bg-[#202B28] dark:text-[#F2F4F1] font-semibold'
                        : 'text-[#172321] dark:text-[#B6C0BC] hover:bg-[#EEF1EF] dark:hover:bg-[#1A2421]'
                    }`}
                >
                  <span>{link.label}</span>
                </button>
              )
            })}
          </div>

          <div className="pt-6 border-t border-[#EEF1EF] dark:border-[#2B3834] space-y-3">
            {/* Mobile Theme Preference */}
            <div className="flex items-center justify-between px-2 text-xs text-[#172321]/60 dark:text-[#89938F]">
              <span>Appearance</span>
              <ThemeToggle size="sm" />
            </div>

            <div className="flex items-center justify-between px-2 text-xs text-[#172321]/60 dark:text-[#89938F]">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Regional Preference
              </span>
              <span className="font-semibold text-[#173E39] dark:text-[#83B2A3]">USD · EN</span>
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
              <>
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
              </>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  )
}

export default Navbar
