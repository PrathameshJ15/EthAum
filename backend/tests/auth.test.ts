import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import { app } from '../src/app.js'
import { requireAuth, requireRole, requireAdmin, requireProvider } from '../src/middleware/auth.js'
import { errorHandler } from '../src/middleware/errorHandler.js'

describe('Authentication & Authorization Middleware', () => {
  describe('requireAuth', () => {
    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app).get('/api/v1/auth/me')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should return 401 when authorization header is not Bearer format', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Basic dXNlcjpwYXNz')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('UNAUTHORIZED')
    })

    it('should authenticate successfully with valid Bearer token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer patient-token')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.role).toBe('patient')
    })
  })

  describe('requireRole / requireAdmin / requireProvider', () => {
    // Create an isolated sub-app to test role guards comprehensively
    const testApp = express()
    testApp.use(express.json())

    testApp.get(
      '/admin-only',
      requireAuth,
      requireAdmin,
      (_req, res) => {
        res.json({ success: true, message: 'Welcome Admin' })
      }
    )

    testApp.get(
      '/provider-only',
      requireAuth,
      requireProvider,
      (_req, res) => {
        res.json({ success: true, message: 'Welcome Provider' })
      }
    )

    testApp.use(errorHandler)

    it('should allow admin role access to admin-only route', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', 'Bearer admin-token')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Welcome Admin')
    })

    it('should block patient role from admin-only route with 403 Forbidden', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', 'Bearer patient-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('FORBIDDEN')
      expect(response.body.error.message).toContain('Insufficient permissions')
    })

    it('should allow provider access to provider-only route', async () => {
      const response = await request(testApp)
        .get('/provider-only')
        .set('Authorization', 'Bearer provider-token')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe('Welcome Provider')
    })

    it('should block patient from provider-only route with 403 Forbidden', async () => {
      const response = await request(testApp)
        .get('/provider-only')
        .set('Authorization', 'Bearer patient-token')

      expect(response.status).toBe(403)
      expect(response.body.success).toBe(false)
      expect(response.body.error.code).toBe('FORBIDDEN')
    })
  })
})
