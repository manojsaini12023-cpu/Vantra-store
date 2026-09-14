import crypto from 'node:crypto'

const JWT_SECRET = process.env.JWT_SECRET || 'vanta_jwt_super_secret_encryption_key_2026_xyz'
const DEFAULT_EXPIRY_SECONDS = 7 * 24 * 60 * 60 // 7 days

/**
 * Hash a password securely using PBKDF2 with SHA-512 and random salt
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex')
  return `${salt}:${derivedKey}`
}

/**
 * Verify a plain text password against a stored salt:derivedKey hash
 */
export function verifyPassword(password, storedHash) {
  if (!storedHash || !storedHash.includes(':')) return false
  const [salt, key] = storedHash.split(':')
  const keyBuffer = Buffer.from(key, 'hex')
  const derivedBuffer = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer)
}

/**
 * Helper to encode Base64URL
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

/**
 * Helper to decode Base64URL
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/')
  while (base64.length % 4) {
    base64 += '='
  }
  return Buffer.from(base64, 'base64').toString('utf8')
}

/**
 * Generate an HMAC-SHA256 signed token
 */
export function signToken(payload, expiresInSeconds = DEFAULT_EXPIRY_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const fullPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds
  }

  const encodedHeader = base64UrlEncode(JSON.stringify(header))
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload))
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  return `${dataToSign}.${signature}`
}

/**
 * Verify and decode an HMAC-SHA256 signed token
 */
export function verifyToken(token) {
  if (!token || typeof token !== 'string') return null
  const parts = token.split('.')
  if (parts.length !== 3) return null

  const [encodedHeader, encodedPayload, signature] = parts
  const dataToSign = `${encodedHeader}.${encodedPayload}`

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(dataToSign)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')

  if (signature !== expectedSignature) {
    return null
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) {
      return null // expired
    }
    return payload
  } catch {
    return null
  }
}

/**
 * Express middleware to authenticate user via Bearer token
 */
export function authenticateUser(req, _res, next) {
  const authHeader = req.headers.authorization || ''
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    const payload = verifyToken(token)
    if (payload) {
      req.user = payload
    }
  }
  next()
}

/**
 * Express middleware requiring authenticated user
 */
export function requireAuth(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please sign in.'
    })
  }
  next()
}

/**
 * Express middleware requiring admin role
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrator credentials required.'
    })
  }
  next()
}
