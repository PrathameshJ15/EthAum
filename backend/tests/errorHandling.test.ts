import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '../src/app.js'

describe('Error Handling Middleware', () => {
  it('should return 404 with structured JSON for unrecognized routes', async () => {
    const response = await request(app).get('/api/v1/nonexistent-route')

    expect(response.status).toBe(404)
    expect(response.body).toHaveProperty('success', false)
    expect(response.body.error).toHaveProperty('code', 'NOT_FOUND')
    expect(response.body.error.message).toContain('route not found on EthAum API')
  })
})
