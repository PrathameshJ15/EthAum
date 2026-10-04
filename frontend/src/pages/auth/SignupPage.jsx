import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react'

import { useAuth } from '../../context/AuthContext'
import { useToast, BackgroundGrid } from '../../components'
import { Button } from '../../components/common/Button'
import { Input } from '../../components/forms/Input'
import { authService } from '../../services/authService'

export function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { addToast } = useToast()

  const [role, setRole] = useState('patient')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [organization, setOrganization] = useState('')
  const [specialty, setSpecialty] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Live password validation
  const pwdValidation = authService.validatePassword(password)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please provide your full legal name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter a valid email address.')
      return
    }

    if (!pwdValidation.isValid) {
      setError('Please ensure your password meets all clinical security requirements.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please retype carefully.')
      return
    }

    if (role === 'provider' && (!organization.trim() || !specialty.trim())) {
      setError('Please specify your hospital/practice and primary clinical specialty.')
      return
    }

    setIsSubmitting(true)
    try {
      const newUser = await signup({
        name,
        email,
        password,
        role,
        organization,
        specialty,
      })

      addToast({
        type: 'success',
        title: 'Account Registered',
        message: `Welcome to EthAum, ${newUser.name}. Your sovereign health vault is initialized.`,
      })

      if (newUser.role === 'provider') {
        navigate('/provider/dashboard', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 sm:px-6 py-12 text-left">
      <BackgroundGrid mask="radial" opacityClass="opacity-[0.07] dark:opacity-[0.09]" />

      <div className="relative w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="EthAum"
                className="w-12 h-12 object-contain transition-transform group-hover:scale-105"
              />
            </Link>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-[var(--bg-elevated)] border border-[var(--border-hairline)] text-xs font-normal text-[var(--green-rich)] font-sans">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Patient-Controlled Sovereignty</span>
          </div>
          <h1 className="text-3xl font-serif font-light text-[var(--text-primary)] tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs sm:text-sm font-light text-[var(--text-secondary)] max-w-sm mx-auto font-sans">
            Upload diagnostic files once, compare hospital packages, and coordinate cross-border surgery.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex p-1 bg-[var(--bg-card)] rounded-[4px] border border-[var(--border-default)]">
          <button
            type="button"
            onClick={() => {
              setRole('patient')
              setError('')
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              role === 'patient'
                ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] shadow-xs'
                : 'text-[#172321]/70 dark:text-[#B6C0BC] hover:bg-[#EEF1EF] dark:hover:bg-[#202B28]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>I am a Patient</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setRole('provider')
              setError('')
            }}
            className={`flex-1 py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
              role === 'provider'
                ? 'bg-[#173E39] dark:bg-[#6F9F91] text-[#F8F8F5] dark:text-[#101614] shadow-xs'
                : 'text-[#172321]/70 dark:text-[#B6C0BC] hover:bg-[#EEF1EF] dark:hover:bg-[#202B28]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>I am a Healthcare Provider</span>
          </button>
        </div>

        {/* Signup Form Card */}
        <div className="bg-white dark:bg-[#1A2421] p-6 sm:p-8 rounded-3xl border border-[#E5E7E4] dark:border-[#2B3834] shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#FDF2F2] dark:bg-red-950/30 border border-[#F5D4D4] dark:border-red-900/50 flex items-start gap-2.5 text-xs text-[#A33B39] dark:text-red-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              label={role === 'patient' ? 'Full Legal Name' : 'Doctor / Coordinator Name'}
              placeholder={role === 'patient' ? 'e.g. Eleanor Vance' : 'e.g. Dr. Sarah Jenkins'}
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            {role === 'provider' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Hospital or Clinic Name"
                  placeholder="e.g. Apollo Hospitals"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Clinical Specialty"
                  placeholder="e.g. Orthopedics"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  required
                />
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer text-[#172321]/45 dark:text-[#89938F] hover:text-[#172321] dark:hover:text-[#F2F4F1]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />

              <Input
                label="Confirm Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="w-4 h-4" />}
                required
              />
            </div>

            {/* Live Password Rules */}
            {password.length > 0 && (
              <div className="p-3 bg-[#F8F8F5] dark:bg-[#151C1A] rounded-xl border border-[#EEF1EF] dark:border-[#2B3834] space-y-1.5 text-xs text-[#172321]/70 dark:text-[#B6C0BC]">
                <p className="font-semibold text-[#173E39] dark:text-[#F2F4F1]">Password requirements:</p>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasMinLength ? 'text-[#2D6A4F] dark:text-[#6F9F91] font-semibold' : 'text-[#172321]/50 dark:text-[#89938F]'}`}>
                    {pwdValidation.hasMinLength ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    8+ characters
                  </span>
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasUpper ? 'text-[#2D6A4F] dark:text-[#6F9F91] font-semibold' : 'text-[#172321]/50 dark:text-[#89938F]'}`}>
                    {pwdValidation.hasUpper ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Uppercase letter
                  </span>
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasLower ? 'text-[#2D6A4F] dark:text-[#6F9F91] font-semibold' : 'text-[#172321]/50 dark:text-[#89938F]'}`}>
                    {pwdValidation.hasLower ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    Lowercase letter
                  </span>
                  <span className={`flex items-center gap-1.5 ${pwdValidation.hasNumber ? 'text-[#2D6A4F] dark:text-[#6F9F91] font-semibold' : 'text-[#172321]/50 dark:text-[#89938F]'}`}>
                    {pwdValidation.hasNumber ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    At least one number
                  </span>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="mt-4"
            >
              Register {role === 'patient' ? 'Patient Account' : 'Provider Profile'}
            </Button>
          </form>

          <div className="pt-4 border-t border-[#EEF1EF] dark:border-[#2B3834] text-center text-xs text-[#172321]/70 dark:text-[#B6C0BC]">
            <span>Already registered? </span>
            <Link to="/login" className="font-semibold text-[#173E39] dark:text-[#6F9F91] hover:underline">
              Sign in to your account
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignupPage
