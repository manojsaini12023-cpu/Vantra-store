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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const PUBLIC_PRODUCTS_DIR = path.resolve(__dirname, '../../public/products')

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
