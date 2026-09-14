import { createContext } from 'react'

export const DEFAULT_CURRENCIES = {
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 1.0, decimals: 0, flag: '🇮🇳' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 0.012, decimals: 2, flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.011, decimals: 2, flag: '🇪🇺' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.0094, decimals: 2, flag: '🇬🇧' },
  AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rate: 0.044, decimals: 2, flag: '🇦🇪' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 1.85, decimals: 0, flag: '🇯🇵' },
  CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 0.016, decimals: 2, flag: '🇨🇦' },
  AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 0.018, decimals: 2, flag: '🇦🇺' }
}

export const CurrencyContext = createContext({
  currency: 'INR',
  setCurrency: () => {},
  currencies: DEFAULT_CURRENCIES,
  formatPrice: (amt) => `₹${amt}`,
  convertPrice: (amt) => amt,
  currentMeta: DEFAULT_CURRENCIES.INR
})
