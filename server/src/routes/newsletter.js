import { Router } from 'express'
import { store } from '../db/store.js'

const router = Router()

// POST /api/newsletter - subscribe to newsletter waitlist
router.post('/', async (req, res) => {
  try {
    const { email } = req.body

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      })
    }

    const result = await store.addSubscriber(email)
    if (!result.added) {
      return res.status(200).json({
        success: true,
        alreadySubscribed: true,
        message: result.message
      })
    }

    res.status(201).json({
      success: true,
      alreadySubscribed: false,
      message: 'You have been added to the VANTA VIP Drop Waitlist.'
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/newsletter/count - get count of subscribers
router.get('/count', async (_req, res) => {
  try {
    const subs = await store.getSubscribers()
    res.json({ success: true, count: subs.length })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
