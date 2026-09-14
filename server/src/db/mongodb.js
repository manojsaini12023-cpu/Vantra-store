// ==============================================================================
// VANTA STREETWEAR // CLOUD MONGODB ATLAS CONNECTOR HELPER
// ==============================================================================

/**
 * MongoDB Atlas connection helper.
 * Parses and verifies MONGODB_URI and Atlas cluster configurations from .env.
 */
export function getMongoConfig() {
  const uri = process.env.MONGODB_URI || ''
  const isConfigured = Boolean(
    uri &&
    !uri.includes('<username>') &&
    !uri.includes('cluster0.abcde.mongodb.net') &&
    uri.startsWith('mongodb')
  )

  let host = 'Not configured'
  let dbName = process.env.MONGODB_DB_NAME || 'vanta_streetwear'

  if (uri) {
    try {
      const parsed = new URL(uri.replace('mongodb+srv://', 'https://'))
      host = parsed.host
      if (parsed.pathname && parsed.pathname.length > 1) {
        dbName = parsed.pathname.slice(1)
      }
    } catch {
      // ignore parsing error for raw strings
    }
  }

  return {
    isConfigured,
    uriMasked: uri ? uri.replace(/:([^:@]+)@/, ':****@') : 'None',
    host: process.env.MONGODB_CLUSTER || host,
    dbName,
    driverRecommended: 'mongodb@^6.0.0 or mongoose@^8.0.0'
  }
}
