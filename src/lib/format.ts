export function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(safe)
}

export function parseCurrencyInput(value: string): number {
  const digits = value.replace(/[^0-9]/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function formatCurrencyInput(value: number): string {
  if (!value) return ''
  return formatCurrency(value)
}
