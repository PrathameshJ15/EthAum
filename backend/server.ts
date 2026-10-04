import { app } from './src/app.js'
import { env } from './src/config/env.js'

const server = app.listen(env.PORT, () => {
  console.log(`[EthAum API] Server running on http://localhost:${env.PORT} in ${env.NODE_ENV} mode`)
  console.log(`[EthAum API] Health check available at http://localhost:${env.PORT}/api/v1/health`)
  console.log(`[EthAum API] CORS configured for: ${env.FRONTEND_URL}`)
})

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('[EthAum API] Received SIGTERM signal, shutting down gracefully...')
  server.close(() => {
    console.log('[EthAum API] Server terminated.')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('[EthAum API] Received SIGINT signal, shutting down gracefully...')
  server.close(() => {
    console.log('[EthAum API] Server terminated.')
    process.exit(0)
  })
})
