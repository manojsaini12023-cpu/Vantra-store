import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()
const FREE_SHIPPING_THRESHOLD = 4999

// Helper to generate readable high-fashion order numbers
function generateOrderNumber() {
  const year = new Date().getFullYear()
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  return `VNTA-${year}-${randomSuffix}`
}

// POST /api/orders - place an order
router.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      promoCode,
      paymentMethod = 'COD'
    } = req.body

    // 1. Validation
    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.pincode) {
      return res.status(400).json({
        success: false,
        message: 'Customer name, phone number, address, and PIN code are required.'
      })
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty. Please add items before checking out.'
      })
    }

    // 2. Calculate subtotal based on verified items
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.numericPrice) || 0
      const qty = Number(item.quantity) || 1
      return sum + price * qty
    }, 0)

    // 3. Calculate discount if promoCode provided
    let discountAmount = 0
    let appliedPromo = null

    if (promoCode) {
      const cleanCode = promoCode.trim().toUpperCase()
      const promos = await store.getPromos()
      const promo = promos.find((p) => p.code === cleanCode)

      if (promo && (!promo.minOrder || subtotal >= promo.minOrder)) {
        appliedPromo = promo.code
        if (promo.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * promo.discountValue) / 100)
        } else if (promo.discountType === 'fixed') {
          discountAmount = Math.min(subtotal, promo.discountValue)
        }
      }
    }

    // 4. Calculate shipping
    const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD
    const shippingFee = isFreeShipping ? 0 : 199
    const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee)

    // 5. Calculate estimated delivery range
    const now = new Date()
    const dateFrom = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    const dateTo = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)
    const dateOpts = { month: 'short', day: 'numeric' }
    const estimatedDelivery = `${dateFrom.toLocaleDateString('en-IN', dateOpts)} - ${dateTo.toLocaleDateString('en-IN', dateOpts)}`

    // 6. Assemble Order Object
    const orderNumber = generateOrderNumber()
    const orderRecord = {
      orderId: orderNumber,
      orderNumber,
      createdAt: now.toISOString(),
      status: 'CONFIRMED',
      paymentStatus: paymentMethod === 'COD' ? 'PAY_ON_DELIVERY' : 'PAID_PREPAID',
      paymentMethod,
      customer: {
        name: customer.name.trim(),
        email: customer.email ? customer.email.trim() : '',
        phone: customer.phone.trim(),
        address: customer.address.trim(),
        city: customer.city ? customer.city.trim() : 'Metro',
        state: customer.state ? customer.state.trim() : '',
        pincode: customer.pincode.trim()
      },
      items: items.map((i) => ({
        id: i.id,
        title: i.title,
        size: i.size || 'L',
        quantity: i.quantity || 1,
        numericPrice: i.numericPrice,
        price: i.price,
        image: i.image,
        category: i.category || 'Streetwear'
      })),
      pricing: {
        subtotal,
        discountAmount,
        appliedPromo,
        shippingFee,
        totalAmount
      },
      shipping: {
        method: 'Express Courier Air (BlueDart / Delhivery)',
        trackingStatus: 'Order Placed • Preparing for Dispatch',
        estimatedDelivery
      }
    }

    // Save order in persistent store
    const savedOrder = await store.createOrder(orderRecord)

    res.status(201).json({
      success: true,
      message: 'Order successfully placed!',
      order: savedOrder
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/orders/:orderId - fetch specific order
router.get('/:orderId', async (req, res) => {
  try {
    const order = await store.getOrderById(req.params.orderId)
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }
    res.json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/orders - list all orders
router.get('/', async (_req, res) => {
  try {
    const orders = await store.getOrders()
    res.json({ success: true, count: orders.length, orders })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
