import { Router } from 'express'
import { doctorController } from '../controllers/doctorController.js'

export const doctorRoutes = Router()

doctorRoutes.get('/', doctorController.listDoctors)
doctorRoutes.get('/:id', doctorController.getDoctorById)
