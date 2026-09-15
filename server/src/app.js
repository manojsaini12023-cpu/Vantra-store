import express from 'express'
import cors from 'cors'
import productsRouter from './routes/products.js'
import promoRouter from './routes/promo.js'
import shippingRouter from './routes/shipping.js'
import ordersRouter from './routes/orders.js'
import newsletterRouter from './routes/newsletter.js'
import adminRouter from './routes/admin.js'
import currencyRouter from './routes/currency.js'
import paymentsRouter from './routes/payments.js'
import reviewsRouter from './routes/reviews.js'
import wishlistRouter from './routes/wishlist.js'
import invoiceRouter from './routes/invoice.js'
import authRouter from './routes/auth.js'
import { authenticateUser } from './utils/auth.js'

import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fsSync from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const clientPublicProducts = path.resolve(__dirname, '../../client/public/products')
const legacyPublicProducts = path.resolve(__dirname, '../../public/products')
const PUBLIC_PRODUCTS_DIR = fsSync.existsSync(clientPublicProducts) ? clientPublicProducts : legacyPublicProducts

const clientDistDir = path.resolve(__dirname, '../../client/dist')
const legacyDistDir = path.resolve(__dirname, '../../dist')
const CLIENT_DIST_DIR = fsSync.existsSync(clientDistDir) ? clientDistDir : legacyDistDir

export function createApp() {
  const app = express()

  // Middleware
  app.use(cors())
  app.use(express.json({ limit: '25mb' }))
  app.use(express.urlencoded({ extended: true, limit: '25mb' }))

  // Static files for uploaded products
  app.use('/products', express.static(PUBLIC_PRODUCTS_DIR))

  // Simple request logger
  app.use((req, _res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`)
    next()
  })

  // Authenticate user via token if provided
  app.use(authenticateUser)

  // Healthcheck endpoint
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'VANTA Streetwear API',
      timestamp: new Date().toISOString()
    })
  })

  // Mount API modules
  app.use('/api/auth', authRouter)
  app.use('/api/products', productsRouter)
  app.use('/api/promo', promoRouter)
  app.use('/api/shipping', shippingRouter)
  app.use('/api/orders', ordersRouter)
  app.use('/api/newsletter', newsletterRouter)
  app.use('/api/admin', adminRouter)
  app.use('/api/currency', currencyRouter)
  app.use('/api/payments', paymentsRouter)
  app.use('/api/reviews', reviewsRouter)
  app.use('/api/wishlist', wishlistRouter)
  app.use('/api/invoice', invoiceRouter)

  // 404 handler for unknown API routes
  app.use('/api', (req, res) => {
    res.status(404).json({
      success: false,
      message: `API endpoint not found: ${req.method} ${req.originalUrl}`
    })
  })

  // Serve production client build if present
  app.use(express.static(CLIENT_DIST_DIR))
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/products')) {
      return next()
    }
    const indexPath = path.join(CLIENT_DIST_DIR, 'index.html')
    if (fsSync.existsSync(indexPath)) {
      return res.sendFile(indexPath)
    }
    next()
  })

  // Global error handler
  app.use((err, _req, res, _next) => {
    console.error('Unhandled server error:', err)
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
    })
  })

  return app
}
