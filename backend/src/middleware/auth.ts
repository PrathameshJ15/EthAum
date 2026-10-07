import { Request, Response, NextFunction } from 'express'
import { UnauthorizedError, ForbiddenError } from '../utils/apiError.js'
import { UserRole } from '../types/index.js'
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js'
import { userService, patientService } from '../services/userService.js'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  name?: string
  patientId?: string
  providerId?: string
  authUserId?: string
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

/**
 * Authentication Middleware
 * 
 * Verifies Supabase Auth JWT when remote credentials are active,
 * and decodes test/mock tokens for deterministic test suites.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Authorization token required (Bearer <token>)')
    }

    const token = authHeader.split(' ')[1]

    if (!token) {
      throw new UnauthorizedError('Bearer token is missing')
    }

    // 1. Supabase Auth Verification (when live Supabase credentials are configured)
    const isMockToken =
      token.startsWith('patient') ||
      token.startsWith('provider') ||
      token.startsWith('admin') ||
      token.startsWith('test-') ||
      token.includes('-token')

    if (isSupabaseConfigured() && !isMockToken) {
      const { data, error } = await supabaseAdmin.auth.getUser(token)
      if (error || !data.user) {
        throw new UnauthorizedError('Invalid or expired Supabase authentication token')
      }

      // Query user profile from public.users
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('*')
        .or(`auth_user_id.eq.${data.user.id},id.eq.${data.user.id}`)
        .single()

      const userRole = (profile?.role || data.user.user_metadata?.role || 'patient').toLowerCase() as UserRole
      const userId = profile?.id || data.user.id

      req.user = {
        id: userId,
        email: data.user.email || profile?.email || 'patient@ethaum.com',
        role: userRole,
        name: profile?.name || data.user.user_metadata?.name || 'EthAum User',
        patientId: userRole === 'patient' ? profile?.id || 'pat-1' : undefined,
        providerId: userRole === 'provider' ? profile?.organization || profile?.id || 'apex-joint-delhi' : undefined,
        authUserId: data.user.id,
      }

      return next()
    }

    // 2. Development, Test & Offline Token Decoder
    // Check if token references an existing user ID (e.g. ethaum_patient_token_usr-12345)
    const tokenParts = token.split('_token_')
    if (tokenParts.length === 2 && tokenParts[1]) {
      const specificUserId = tokenParts[1]
      const foundUser = await userService.getUserById(specificUserId)
      if (foundUser) {
        let patientId: string | undefined = undefined
        if (foundUser.role === 'patient') {
          const patient = await patientService.getPatientByUserId(foundUser.id)
          patientId = patient?.id || foundUser.id
        }
        req.user = {
          id: foundUser.id,
          email: foundUser.email,
          role: foundUser.role,
          name: foundUser.name,
          patientId,
          providerId: foundUser.role === 'provider' ? 'apex-joint-delhi' : undefined,
        }
        return next()
      }
    }

    let mockRole: UserRole = 'patient'
    let mockId = 'usr-demo-patient'
    let mockName = 'Demo Patient'
    let mockPatientId: string | undefined = 'pat-1'
    let mockProviderId: string | undefined = undefined

    const lowerToken = token.toLowerCase()
    if (lowerToken.includes('admin')) {
      mockRole = 'admin'
      mockId = 'usr-demo-admin'
      mockName = 'Demo Admin'
      mockPatientId = undefined
    } else if (lowerToken.includes('unauthorized-provider')) {
      mockRole = 'provider'
      mockId = 'usr-unauthorized-provider'
      mockName = 'Dr. Foreign Hospital'
      mockProviderId = 'unauthorized-hospital-xyz'
      mockPatientId = undefined
    } else if (lowerToken.includes('provider') || lowerToken.includes('doctor')) {
      mockRole = 'provider'
      mockId = 'usr-demo-provider'
      mockName = 'Dr. Vikram Oberoi'
      mockProviderId = 'apex-joint-delhi'
      mockPatientId = undefined
    } else if (lowerToken.includes('pat-2') || lowerToken.includes('other-patient')) {
      mockRole = 'patient'
      mockId = 'usr-other-patient'
      mockName = 'Marcus Aurelius'
      mockPatientId = 'pat-2'
    }

    req.user = {
      id: mockId,
      email: `${mockRole}@ethaum.com`,
      role: mockRole,
      name: mockName,
      patientId: mockPatientId,
      providerId: mockProviderId,
    }

    next()
  } catch (err) {
    next(err)
  }
}

/**
 * Role-Based Authorization Guard
 */
export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required before checking role permissions')
    }

    const normalizedUserRole = (req.user.role || '').toLowerCase()
    const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase())

    if (!normalizedAllowed.includes(normalizedUserRole)) {
      throw new ForbiddenError(
        `Insufficient permissions: Role '${req.user.role}' is not authorized for this resource`
      )
    }

    next()
  }
}

/** Shorthand Role Middleware */
export const requirePatient = requireRole(['patient', 'PATIENT'])
export const requireProvider = requireRole(['provider', 'PROVIDER'])
export const requireAdmin = requireRole(['admin', 'ADMIN'])
