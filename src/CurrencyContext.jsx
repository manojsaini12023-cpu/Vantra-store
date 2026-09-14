import { useState, useEffect, useCallback } from 'react'
import { CurrencyContext, DEFAULT_CURRENCIES } from './CurrencyContextInstance'

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState('INR')
  const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES)

  useEffect(() => {
    fetch('/api/currency/rates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.currencies) {
          setCurrencies(data.currencies)
        }
      })
      .catch(() => {
        // Fallback to defaults
      })
  }, [])

  const currentMeta = currencies[currency] || DEFAULT_CURRENCIES.INR

  const convertPrice = useCallback(
    (amountInINR) => {
      const num = Number(amountInINR) || 0
      const rate = currentMeta.rate || 1.0
      const converted = num * rate
      return currentMeta.decimals === 0 ? Math.round(converted) : Number(converted.toFixed(currentMeta.decimals))
    },
    [currentMeta]
  )

  const formatPrice = useCallback(
    (amountInINR) => {
      const num = Number(amountInINR) || 0
      const converted = convertPrice(num)
      const formattedNumber = currentMeta.decimals === 0
        ? converted.toLocaleString('en-IN')
        : converted.toLocaleString('en-US', {
            minimumFractionDigits: currentMeta.decimals,
            maximumFractionDigits: currentMeta.decimals
          })
      return `${currentMeta.symbol}${formattedNumber}`
    },
    [convertPrice, currentMeta]
  )

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencies,
        formatPrice,
        convertPrice,
        currentMeta
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}
