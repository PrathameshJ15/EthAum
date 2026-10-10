import { app } from './src/app.js'
import { env } from './src/config/env.js'

const server = app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`[EthAum API] Server running:`)
  console.log(`  > Local:   http://localhost:${env.PORT}/api/v1`)
  console.log(`  > Network: http://192.168.1.8:${env.PORT}/api/v1`)
  console.log(`  > Health:  http://localhost:${env.PORT}/api/v1/health`)
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
