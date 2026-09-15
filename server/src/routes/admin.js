import { Router } from 'express'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { store } from '../db/store.js'

import fsSync from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const clientPublicProducts = path.resolve(__dirname, '../../../client/public/products')
const legacyPublicProducts = path.resolve(__dirname, '../../../public/products')
const PUBLIC_PRODUCTS_DIR = fsSync.existsSync(clientPublicProducts) ? clientPublicProducts : legacyPublicProducts

const router = Router()

const VALID_STATUSES = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// GET /api/admin/stats - Overview analytics
router.get('/stats', async (_req, res) => {
  try {
    const [orders, products, promos, subscribers] = await Promise.all([
      store.getOrders(),
      store.getProducts(),
      store.getPromos(),
      store.getSubscribers()
    ])

    const grossRevenue = orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + (Number(o?.pricing?.totalAmount) || 0), 0)

    const statusCounts = VALID_STATUSES.reduce((acc, status) => {
      acc[status] = orders.filter((o) => o.status === status).length
      return acc
    }, {})

    const lowStockProducts = products
      .filter((p) => Number(p.stock) <= 15)
      .map((p) => ({ id: p.id, title: p.title, stock: p.stock, price: p.price }))

    res.json({
      success: true,
      stats: {
        totalOrders: orders.length,
        grossRevenue,
        formattedRevenue: `₹${grossRevenue.toLocaleString('en-IN')}`,
        activeProducts: products.length,
        activePromos: promos.length,
        totalSubscribers: subscribers.length,
        statusCounts,
        recentOrders: orders.slice(0, 5),
        lowStockProducts
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/admin/orders - List & filter orders
router.get('/orders', async (req, res) => {
  try {
    const { status, search } = req.query
    let orders = await store.getOrders()

    if (status && status !== 'ALL') {
      orders = orders.filter((o) => (o.status || '').toUpperCase() === status.toUpperCase())
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase()
      orders = orders.filter((o) => {
        const orderNumber = (o.orderNumber || o.orderId || '').toLowerCase()
        const custName = (o.customer?.name || '').toLowerCase()
        const custPhone = (o.customer?.phone || '').toLowerCase()
        const custEmail = (o.customer?.email || '').toLowerCase()
        return (
          orderNumber.includes(q) ||
          custName.includes(q) ||
          custPhone.includes(q) ||
          custEmail.includes(q)
        )
      })
    }

    res.json({
      success: true,
      count: orders.length,
      orders
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PATCH /api/admin/orders/:orderId/status - Update live order status
router.patch('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body

    if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
      })
    }

    const updatedOrder = await store.updateOrderStatus(orderId, status.toUpperCase())
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: `Order with ID ${orderId} not found.`
      })
    }

    res.json({
      success: true,
      message: `Order status updated to ${status.toUpperCase()}`,
      order: updatedOrder
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/admin/orders/clear - Clear all orders / reset order history
router.delete('/orders/clear', async (_req, res) => {
  try {
    await store.clearOrders()
    res.json({
      success: true,
      message: 'All order history has been successfully cleared.'
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/admin/orders/:orderId - Delete single order by ID or order number
router.delete('/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    const deleted = await store.deleteOrder(orderId)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderId} not found.`
      })
    }

    res.json({
      success: true,
      message: `Order #${orderId} deleted successfully.`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/admin/products - List all products
router.get('/products', async (_req, res) => {
  try {
    const products = await store.getProducts()
    res.json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/admin/products - Create a new catalog item
router.post('/products', async (req, res) => {
  try {
    const { title, numericPrice } = req.body
    if (!title || !numericPrice) {
      return res.status(400).json({
        success: false,
        message: 'Product title and numeric price are required.'
      })
    }

    const newProduct = await store.addProduct(req.body)
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updated = await store.updateProduct(id, req.body)
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`
      })
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updated
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await store.deleteProduct(id)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${id} not found.`
      })
    }

    res.json({
      success: true,
      message: `Product ${id} deleted successfully`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/admin/upload-image - Upload product image to public/products/
router.post('/upload-image', async (req, res) => {
  try {
    const { imageBase64, fileName } = req.body
    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        message: 'No image data provided. Please provide an image file or base64 data.'
      })
    }

    // Determine mime extension
    let ext = 'png'
    let rawBase64 = imageBase64
    const mimeMatch = imageBase64.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/)
    if (mimeMatch) {
      ext = mimeMatch[1].toLowerCase()
      if (ext === 'jpeg') ext = 'jpg'
      if (ext === 'svg+xml') ext = 'svg'
      rawBase64 = mimeMatch[2]
    } else if (fileName && fileName.includes('.')) {
      const parts = fileName.split('.')
      ext = parts[parts.length - 1].toLowerCase()
      if (ext === 'jpeg') ext = 'jpg'
    }

    // Sanitize base name
    const rawName = (fileName || 'product-drop')
      .replace(/\.[^/.]+$/, '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .slice(0, 30)

    const uniqueFileName = `${rawName || 'product'}-${Date.now()}.${ext}`
    const targetFilePath = path.join(PUBLIC_PRODUCTS_DIR, uniqueFileName)

    // Ensure directory exists
    await fs.mkdir(PUBLIC_PRODUCTS_DIR, { recursive: true })

    // Decode and write binary file
    const fileBuffer = Buffer.from(rawBase64, 'base64')
    await fs.writeFile(targetFilePath, fileBuffer)

    const imageUrl = `/products/${uniqueFileName}`
    res.status(201).json({
      success: true,
      message: 'Product image uploaded successfully',
      imageUrl,
      fileName: uniqueFileName,
      sizeBytes: fileBuffer.length
    })
  } catch (error) {
    console.error('Upload product image error:', error)
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/admin/promos - List promos
router.get('/promos', async (_req, res) => {
  try {
    const promos = await store.getPromos()
    res.json({
      success: true,
      count: promos.length,
      promos
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/admin/promos - Add promo code
router.post('/promos', async (req, res) => {
  try {
    const { code, discountValue } = req.body
    if (!code || !discountValue) {
      return res.status(400).json({
        success: false,
        message: 'Promo code and discount value are required.'
      })
    }

    const result = await store.addPromo(req.body)
    if (!result.added) {
      return res.status(400).json({
        success: false,
        message: result.message
      })
    }

    res.status(201).json({
      success: true,
      message: 'Promo created successfully',
      promo: result.promo
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/admin/promos/:code - Delete promo code
router.delete('/promos/:code', async (req, res) => {
  try {
    const { code } = req.params
    const deleted = await store.deletePromo(code)
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Promo ${code} not found.`
      })
    }

    res.json({
      success: true,
      message: `Promo ${code} deleted successfully`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/admin/subscribers - View VIP waitlist
router.get('/subscribers', async (_req, res) => {
  try {
    const subscribers = await store.getSubscribers()
    res.json({
      success: true,
      count: subscribers.length,
      subscribers
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
