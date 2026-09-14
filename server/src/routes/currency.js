import { Router } from 'express'

const router = Router()

// Multi-Currency Exchange Rates and Configs (Base Currency: INR)
const CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1.0, decimals: 0, flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012, decimals: 2, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011, decimals: 2, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0094, decimals: 2, flag: '🇬🇧' },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rate: 0.044, decimals: 2, flag: '🇦🇪' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.85, decimals: 0, flag: '🇯🇵' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 0.016, decimals: 2, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 0.018, decimals: 2, flag: '🇦🇺' }
}

// GET /api/currency/rates - Get all supported currencies and exchange rates
router.get('/rates', (_req, res) => {
  res.json({
    success: true,
    base: 'INR',
    updatedAt: new Date().toISOString(),
    currencies: CURRENCIES
  })
})

// POST /api/currency/convert - Convert amount between currencies
router.post('/convert', (req, res) => {
  try {
    const { amount, from = 'INR', to = 'USD' } = req.body
    const numericAmount = Number(amount)

    if (isNaN(numericAmount) || numericAmount < 0) {
      return res.status(400).json({ success: false, message: 'Valid amount is required.' })
    }

    const fromCurr = CURRENCIES[from.toUpperCase()]
    const toCurr = CURRENCIES[to.toUpperCase()]

    if (!fromCurr || !toCurr) {
      return res.status(400).json({
        success: false,
        message: `Supported currencies: ${Object.keys(CURRENCIES).join(', ')}`
      })
    }

    // Convert from -> INR -> to
    const amountInINR = numericAmount / fromCurr.rate
    const convertedAmount = amountInINR * toCurr.rate
    const rounded = Number(convertedAmount.toFixed(toCurr.decimals))

    res.json({
      success: true,
      from: fromCurr.code,
      to: toCurr.code,
      originalAmount: numericAmount,
      convertedAmount: rounded,
      formatted: `${toCurr.symbol}${rounded.toLocaleString()}`
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
