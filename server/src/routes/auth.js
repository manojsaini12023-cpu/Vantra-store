import { Router } from 'express'
import { store } from '../db/store.js'
import {
  verifyPassword,
  signToken,
  authenticateUser,
  requireAuth
} from '../utils/auth.js'

const router = Router()

/**
 * POST /api/auth/signup - Register new customer account
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body

    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full name must be at least 2 characters long.'
      })
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      })
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      })
    }

    const cleanEmail = email.toLowerCase().trim()
    const existing = await store.findUserByEmail(cleanEmail)
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in.'
      })
    }

    const newUser = await store.createUser({
      name: name.trim(),
      email: cleanEmail,
      phone: (phone || '').trim(),
      password,
      role: 'user'
    })

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    }
    const token = signToken(tokenPayload)

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to VANTA.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * POST /api/auth/login - Customer or staff sign in
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await store.findUserByEmail(cleanEmail)

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password. Please verify your credentials.'
      })
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
    const token = signToken(tokenPayload)

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * POST /api/auth/admin-login - Dedicated Staff Admin Gateway
 */
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Admin email and security password are required.'
      })
    }

    const cleanEmail = email.toLowerCase().trim()
    const user = await store.findUserByEmail(cleanEmail)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Admin credentials not recognized or unauthorized.'
      })
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access restricted. Account does not possess administrator privileges.'
      })
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid administrator password.'
      })
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: 'admin'
    }
    const token = signToken(tokenPayload)

    res.json({
      success: true,
      message: 'Staff Admin clearance granted.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * GET /api/auth/me - Retrieve current authenticated user profile
 */
router.get('/me', authenticateUser, requireAuth, async (req, res) => {
  try {
    const user = await store.findUserById(req.user.id)
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile no longer exists.'
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

/**
 * POST /api/auth/logout - Sign out confirmation
 */
router.post('/logout', (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  })
})

export default router
