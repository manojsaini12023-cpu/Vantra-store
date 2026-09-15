import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: [path.resolve(__dirname, '.env'), path.resolve(__dirname, '../.env')] })
import { createApp } from './src/app.js'
import { store } from './src/db/store.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // 1. Initialize persistent storage and seeds
    await store.init()
    console.log('✓ Persistent database store initialized.')

    // 2. Create Express app
    const app = createApp()

    // 3. Start listening on 0.0.0.0 for Render & cloud deployment
    const HOST = '0.0.0.0'
    app.listen(PORT, HOST, () => {
      console.log(`=========================================`)
      console.log(`  VANTA Streetwear API Server Running     `)
      console.log(`  Host: ${HOST}:${PORT}                   `)
      console.log(`  Health: http://localhost:${PORT}/api/health`)
      console.log(`=========================================`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
