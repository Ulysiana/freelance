export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const
export type Currency = typeof CURRENCIES[number]

const SYMBOLS: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£' }
const LOCALES: Record<Currency, string> = { EUR: 'fr-FR', USD: 'en-US', GBP: 'en-GB' }

export function formatAmount(amount: number, currency: string = 'EUR', decimals = 2) {
  const cur = (CURRENCIES.includes(currency as Currency) ? currency : 'EUR') as Currency
  return amount.toLocaleString(LOCALES[cur], {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function currencySymbol(currency: string = 'EUR') {
  return SYMBOLS[(currency as Currency)] ?? '€'
}
