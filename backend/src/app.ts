import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { apiRouter } from './routes/index.js'
import { errorHandler } from './middleware/errorHandler.js'
import { notFoundHandler } from './middleware/notFoundHandler.js'
import { env } from './config/env.js'
import { ForbiddenError } from './utils/apiError.js'

export const app = express()

// Security HTTP headers
app.use(helmet())

// CORS policy configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, supertest)
      if (!origin) {
        return callback(null, true)
      }

      const isConfiguredFrontend = origin === env.FRONTEND_URL
      const isAllowedLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)

      const isProduction = (process.env.NODE_ENV || env.NODE_ENV) === 'production'

      if (isConfiguredFrontend || (!isProduction && isAllowedLocalOrLan)) {
        return callback(null, true)
      }

      if (isProduction) {
        return callback(new ForbiddenError(`Origin '${origin}' is not allowed by CORS policy`))
      }

      return callback(null, true)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// Rate limiting: 100 requests per 15-minute window for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests from this IP address, please try again after 15 minutes',
    },
  },
})
app.use('/api', apiLimiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging (non-test environments)
if (env.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms'))
}

// Mount versioned API routes at /api/v1
app.use('/api/v1', apiRouter)

// Fallback 404 handler for unrecognized routes
app.use(notFoundHandler)

// Centralized error handling
app.use(errorHandler)

export default app
