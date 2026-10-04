import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Validation Middleware', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should reject request when email is invalid', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'password123',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      const emailError = response.body.error.details.find((d: any) => d.field === 'email')
      expect(emailError).toBeDefined()
    })

    it('should reject request when password is too short', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'valid@ethaum.com',
          password: '123',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      const passwordError = response.body.error.details.find((d: any) => d.field === 'password')
      expect(passwordError).toBeDefined()
    })
  })

  describe('POST /api/v1/auth/signup', () => {
    it('should reject registration when role is not a valid enum value', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'newuser@ethaum.com',
          password: 'securepassword123',
          name: 'Jane Doe',
          role: 'superhero', // invalid enum
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      const roleError = response.body.error.details.find((d: any) => d.field === 'role')
      expect(roleError).toBeDefined()
    })

    it('should accept valid registration payload', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          email: 'newpatient@ethaum.com',
          password: 'securepassword123',
          name: 'Jane Doe',
          role: 'patient',
          country: 'United Kingdom',
        })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.user.email).toBe('newpatient@ethaum.com')
    })
  })

  describe('PATCH /api/v1/cases/:id/status', () => {
    it('should reject status update with invalid status enum value', async () => {
      const response = await request(app)
        .patch('/api/v1/cases/ET-8492/status')
        .set('Authorization', 'Bearer patient-token')
        .send({
          status: 'INVALID_STATUS_CODE',
        })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('VALIDATION_ERROR')
      const statusError = response.body.error.details.find((d: any) => d.field === 'status')
      expect(statusError).toBeDefined()
    })
  })
})
