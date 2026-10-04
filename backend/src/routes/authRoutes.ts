import { Router } from 'express'
import { authController, loginSchema, signupSchema } from '../controllers/authController.js'
import { validate } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'

export const authRoutes = Router()

authRoutes.post('/login', validate({ body: loginSchema }), authController.login)
authRoutes.post('/signup', validate({ body: signupSchema }), authController.signup)
authRoutes.get('/me', requireAuth, authController.me)
