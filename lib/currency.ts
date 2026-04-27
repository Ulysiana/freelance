export const CURRENCIES = ['EUR', 'USD', 'GBP'] as const
export type Currency = typeof CURRENCIES[number]
export const DEFAULT_CURRENCY: Currency = 'EUR'

const SYMBOLS: Record<Currency, string> = { EUR: '€', USD: '$', GBP: '£' }
const LOCALES: Record<Currency, string> = { EUR: 'fr-FR', USD: 'en-US', GBP: 'en-GB' }

export function normalizeCurrency(currency?: string | null): Currency {
  return (CURRENCIES.includes(currency as Currency) ? currency : DEFAULT_CURRENCY) as Currency
}

export function resolveCurrency(primary?: string | null, fallback?: string | null): Currency {
  return normalizeCurrency(primary ?? fallback)
}

export function formatAmount(amount: number, currency: string = 'EUR', decimals = 2) {
  const cur = normalizeCurrency(currency)
  return amount.toLocaleString(LOCALES[cur], {
    style: 'currency',
    currency: cur,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function currencySymbol(currency: string = 'EUR') {
  return SYMBOLS[normalizeCurrency(currency)] ?? '€'
}
