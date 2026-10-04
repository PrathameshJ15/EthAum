import { Router } from 'express'
import { userController } from '../controllers/userController.js'
import { requireAuth } from '../middleware/auth.js'

export const userRoutes = Router()

userRoutes.get('/:id', requireAuth, userController.getUserById)
