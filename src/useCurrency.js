import { useContext } from 'react'
import { CurrencyContext } from './CurrencyContextInstance'

export function useCurrency() {
  return useContext(CurrencyContext)
}
