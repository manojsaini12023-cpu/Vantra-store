import 'dotenv/config'
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

    // 3. Start listening
    app.listen(PORT, () => {
      console.log(`=========================================`)
      console.log(`  VANTA Streetwear API Server Running     `)
      console.log(`  Port: http://localhost:${PORT}          `)
      console.log(`  Health: http://localhost:${PORT}/api/health`)
      console.log(`=========================================`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
