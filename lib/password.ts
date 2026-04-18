export const PASSWORD_RULES = {
  minLength: 10,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_RULES.minLength) return `Au moins ${PASSWORD_RULES.minLength} caractères requis`
  if (!/[A-Z]/.test(password)) return 'Au moins une majuscule requise'
  if (!/[0-9]/.test(password)) return 'Au moins un chiffre requis'
  if (!/[^A-Za-z0-9]/.test(password)) return 'Au moins un caractère spécial requis (!@#$…)'
  return null
}

export function passwordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 10) score++
  if (password.length >= 14) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  if (score <= 1) return { score, label: 'Très faible', color: '#f87171' }
  if (score === 2) return { score, label: 'Faible', color: '#fb923c' }
  if (score === 3) return { score, label: 'Moyen', color: '#fbbf24' }
  if (score === 4) return { score, label: 'Fort', color: '#86efac' }
  return { score, label: 'Très fort', color: '#34d399' }
}
