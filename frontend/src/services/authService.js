import apiClient from './apiClient.js'

const AUTH_TOKEN_KEY = 'ethaum_auth_token'
const SESSION_STORAGE_KEY = 'ethaum_active_session'

const DEFAULT_DEMO_USERS = [
  {
    id: 'usr-patient-1',
    email: 'patient@ethaum.com',
    password: 'PatientPass123!',
    name: 'Eleanor Vance',
    role: 'patient',
    patientId: 'pat-1',
    country: 'United Kingdom',
    created_at: '2026-09-12T10:00:00Z',
  },
  {
    id: 'usr-provider-1',
    email: 'doctor@ethaum.com',
    password: 'DoctorPass123!',
    name: 'Dr. Vikram Oberoi',
    role: 'provider',
    providerId: 'apex-joint-delhi',
    organization: 'Apex Orthopedic & Robotic Joint Institute',
    specialty: 'Adult Knee & Hip Reconstruction',
    country: 'India',
    created_at: '2026-08-01T12:00:00Z',
  },
  {
    id: 'usr-admin-1',
    email: 'admin@ethaum.com',
    password: 'AdminPass123!',
    name: 'EthAum Compliance Officer',
    role: 'admin',
    organization: 'EthAum Global Platform',
    created_at: '2026-01-01T00:00:00Z',
  },
]

export const authService = {
  /**
   * Sign In with Email & Password
   * Connects to Node.js backend POST /api/v1/auth/login
   */
  async signIn({ email, password }) {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const data = await apiClient.post('/auth/login', {
        email: normalizedEmail,
        password,
      })

      const user = data.user || data
      const token = data.token || `ethaum_${user.role}_token_${user.id}`

      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))

      return { user, token }
    } catch (apiError) {
      console.warn('[authService] API login error, checking fallback demo credentials:', apiError.message)

      // Fallback: Check local demo credentials if backend is temporarily unreachable
      const demoUser = DEFAULT_DEMO_USERS.find(
        (u) => u.email.toLowerCase() === normalizedEmail
      )
      if (demoUser && demoUser.password === password) {
        const mockToken = `ethaum_${demoUser.role}_token_${demoUser.id}`
        localStorage.setItem(AUTH_TOKEN_KEY, mockToken)
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(demoUser))
        return { user: demoUser, token: mockToken }
      }

      throw apiError
    }
  },

  /**
   * Sign Up with Email, Password & Profile metadata
   * Connects to Node.js backend POST /api/v1/auth/signup
   */
  async signUp({ email, password, name, role = 'patient', phone = '', country = '', organization = '', specialty = '' }) {
    const normalizedEmail = email.trim().toLowerCase()

    try {
      const data = await apiClient.post('/auth/signup', {
        email: normalizedEmail,
        password,
        name: name.trim(),
        role: role.toLowerCase(),
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
      })

      const user = data.user || data
      const token = data.token || `ethaum_${user.role}_token_${user.id}`

      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user))

      return { user, token }
    } catch (apiError) {
      console.warn('[authService] API registration error, falling back locally:', apiError.message)

      // Fallback local registration
      const newUser = {
        id: `usr-${Date.now()}`,
        email: normalizedEmail,
        name: name.trim(),
        role: role.toLowerCase(),
        organization: organization.trim() || null,
        specialty: specialty.trim() || null,
        created_at: new Date().toISOString(),
      }
      const token = `ethaum_${newUser.role}_token_${newUser.id}`
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser))
      return { user: newUser, token }
    }
  },

  /**
   * Sign Out
   */
  async signOut() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(SESSION_STORAGE_KEY)
  },

  /**
   * Fetch current authenticated profile from Node.js backend GET /api/v1/auth/me
   */
  async getMe() {
    return await apiClient.get('/auth/me')
  },

  /**
   * Retrieve active session user
   * Verifies against backend if token exists, or falls back to persisted session
   */
  async getSessionUser() {
    const token = localStorage.getItem(AUTH_TOKEN_KEY)
    if (!token) return null

    try {
      const liveUser = await this.getMe()
      if (liveUser) {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(liveUser))
        return liveUser
      }
    } catch {
      // Fallback to cached session
    }

    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  },

  /**
   * Password strength verification helper
   */
  validatePassword(password) {
    const hasMinLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    const isValid = hasMinLength && hasUpper && hasLower && hasNumber

    return {
      isValid,
      hasMinLength,
      hasUpper,
      hasLower,
      hasNumber,
      hasSpecial,
    }
  },
}

export const validatePassword = (password) => authService.validatePassword(password)
export default authService
