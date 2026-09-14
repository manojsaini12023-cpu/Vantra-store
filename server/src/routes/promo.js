import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// POST /api/promo/validate - validate promo code and compute discount
router.post('/validate', async (req, res) => {
  try {
    const { code, subtotal = 0 } = req.body

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'Please provide a valid coupon code.'
      })
    }

    const cleanCode = code.trim().toUpperCase()
    const promos = await store.getPromos()
    const promo = promos.find((p) => p.code === cleanCode)

    if (!promo) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: `Invalid coupon code "${cleanCode}". Try VANTA10 or VANTA500.`
      })
    }

    const numericSubtotal = Number(subtotal) || 0

    if (promo.minOrder && numericSubtotal < promo.minOrder) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: `Min. order value of ₹${promo.minOrder.toLocaleString('en-IN')} required for ${promo.code}.`
      })
    }

    let discountAmount = 0
    if (promo.discountType === 'percentage') {
      discountAmount = Math.round((numericSubtotal * promo.discountValue) / 100)
    } else if (promo.discountType === 'fixed') {
      discountAmount = Math.min(numericSubtotal, promo.discountValue)
    }

    return res.json({
      success: true,
      valid: true,
      code: promo.code,
      discountAmount,
      description: promo.description,
      newSubtotal: Math.max(0, numericSubtotal - discountAmount)
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/promo/available - list public available promotional codes
router.get('/available', async (_req, res) => {
  try {
    const promos = await store.getPromos()
    res.json({
      success: true,
      promos: promos.map((p) => ({
        code: p.code,
        description: p.description,
        minOrder: p.minOrder
      }))
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
