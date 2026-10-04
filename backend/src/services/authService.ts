import { userService } from './userService.js'
import { User, UserRole } from '../types/index.js'
import { UnauthorizedError } from '../utils/apiError.js'

export const authService = {
  /**
   * Authentication Bridge
   * Prepared for Phase 8 Supabase Auth SDK integration
   */
  async login(email: string, _password?: string): Promise<{ user: User; token: string }> {
    const user = await userService.getUserByEmail(email)
    if (!user) {
      throw new UnauthorizedError('Invalid credentials. No user registered with this email.')
    }

    // Generate token string (simulated bearer token for Phase 7; replaced by Supabase session token in Phase 8)
    const token = `ethaum_${user.role}_token_${user.id}`
    return { user, token }
  },

  async signup(data: {
    email: string
    name: string
    role: UserRole
    phone?: string
    country?: string
  }): Promise<{ user: User; token: string }> {
    const existing = await userService.getUserByEmail(data.email)
    if (existing) {
      throw new UnauthorizedError('An account with this email address already exists.')
    }

    const newUser: User = {
      id: `usr-${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role,
      phone: data.phone,
      country: data.country,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await userService.createUser(newUser)

    const token = `ethaum_${newUser.role}_token_${newUser.id}`
    return { user: newUser, token }
  },
}
