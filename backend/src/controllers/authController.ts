import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { authService } from '../services/authService.js'
import { userService } from '../services/userService.js'
import { sendSuccess } from '../utils/apiResponse.js'
import { UnauthorizedError } from '../utils/apiError.js'

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(2, 'Full name is required'),
  role: z.enum(['patient', 'provider', 'admin', 'PATIENT', 'PROVIDER', 'ADMIN']),
  phone: z.string().optional(),
  country: z.string().optional(),
})

export const authController = {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      return sendSuccess(res, result, 'Successfully authenticated')
    } catch (err) {
      next(err)
    }
  },

  async signup(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signup(req.body)
      return sendSuccess(res, result, 'User registered successfully', 201)
    } catch (err) {
      next(err)
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new UnauthorizedError()
      }
      const user = await userService.getUserById(req.user.id)
      return sendSuccess(res, user || req.user, 'Current active profile')
    } catch (err) {
      next(err)
    }
  },
}

