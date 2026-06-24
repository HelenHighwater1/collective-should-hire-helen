import { stateTaxData, type TaxBracket } from './stateTaxData'

const FLOORED_FRANCHISE_TYPES = new Set([
  'percentOfNetWorth',
  'percentOfRevenue',
  'complex',
])

/**
 * Marginal tax across an ordered list of brackets. `upTo` marks the top of each
 * band; the final band typically has `upTo: null` (no cap). Shared by federal
 * and graduated-state calculations.
 */
export function marginalTax(taxable: number, brackets: TaxBracket[]): number {
  if (taxable <= 0 || brackets.length === 0) return 0

  let tax = 0
  let lower = 0
  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Infinity
    if (taxable <= lower) break
    const bandAmount = Math.min(taxable, upper) - lower
    if (bandAmount > 0) tax += bandAmount * bracket.rate
    lower = upper
  }
  return tax
}

/** Returns the marginal rate of the bracket `taxable` falls into. */
export function marginalRate(taxable: number, brackets: TaxBracket[]): number {
  if (taxable <= 0 || brackets.length === 0) return 0

  for (const bracket of brackets) {
    const upper = bracket.upTo ?? Infinity
    if (taxable <= upper) return bracket.rate
  }
  return brackets[brackets.length - 1]?.rate ?? 0
}

export type StateIncomeTaxDetail = {
  tax: number
  type: string
  marginalRate: number
  effectiveRate: number
}

function resolveStateIncomeTaxType(stateCode: string): string {
  const entry = stateTaxData[stateCode]
  if (!entry || !entry.hasPersonalIncomeTax) return 'none'
  if (entry.personalIncomeTaxType) return entry.personalIncomeTaxType
  if (entry.personalIncomeTaxBrackets?.length) return 'graduated'
  if (entry.personalIncomeTaxRate != null) return 'flat'
  return 'none'
}

/**
 * State personal income tax for a given taxable base. The `state_tax_data.json`
 * file is the source of truth; this function degrades gracefully when a state
 * is missing or has incomplete data (returns 0 rather than guessing).
 */
export function stateIncomeTax(taxable: number, stateCode: string): number {
  const entry = stateTaxData[stateCode]
  if (!entry || !entry.hasPersonalIncomeTax || taxable <= 0) return 0

  const type = entry.personalIncomeTaxType

  if (type === 'graduated' && entry.personalIncomeTaxBrackets?.length) {
    return marginalTax(taxable, entry.personalIncomeTaxBrackets)
  }

  if (type === 'flat' && entry.personalIncomeTaxRate != null) {
    return taxable * entry.personalIncomeTaxRate
  }

  // Fallbacks for partial data: prefer brackets, then a flat rate, else 0.
  if (entry.personalIncomeTaxBrackets?.length) {
    return marginalTax(taxable, entry.personalIncomeTaxBrackets)
  }
  if (entry.personalIncomeTaxRate != null) {
    return taxable * entry.personalIncomeTaxRate
  }
  return 0
}

export function stateIncomeTaxDetail(
  taxable: number,
  stateCode: string,
): StateIncomeTaxDetail {
  const tax = stateIncomeTax(taxable, stateCode)
  const type = resolveStateIncomeTaxType(stateCode)
  const entry = stateTaxData[stateCode]

  let marginal = 0
  if (type === 'graduated' && entry?.personalIncomeTaxBrackets?.length) {
    marginal = marginalRate(taxable, entry.personalIncomeTaxBrackets)
  } else if (type === 'flat' && entry?.personalIncomeTaxRate != null) {
    marginal = entry.personalIncomeTaxRate
  } else if (entry?.personalIncomeTaxBrackets?.length) {
    marginal = marginalRate(taxable, entry.personalIncomeTaxBrackets)
  } else if (entry?.personalIncomeTaxRate != null) {
    marginal = entry.personalIncomeTaxRate
  }

  return {
    tax,
    type,
    marginalRate: marginal,
    effectiveRate: taxable > 0 ? tax / taxable : 0,
  }
}

export type StateFeesDetail = {
  total: number
  reportFee: number
  franchise: number
  franchiseType: string
  isFloored: boolean
}

function computeFranchise(
  franchiseTaxType: string | null | undefined,
  amount: number | null,
  min: number,
  netIncome: number,
): { franchise: number; isFloored: boolean } {
  switch (franchiseTaxType) {
    case 'none':
    case undefined:
    case null:
      return { franchise: 0, isFloored: false }
    case 'flat':
      return { franchise: amount ?? min, isFloored: false }
    case 'percentOfIncome':
      return {
        franchise: amount != null ? Math.max(amount * Math.max(0, netIncome), min) : min,
        isFloored: false,
      }
    default:
      return { franchise: min, isFloored: FLOORED_FRANCHISE_TYPES.has(franchiseTaxType ?? '') }
  }
}

/**
 * Annual state fees an S-corp incurs: the annual report fee plus a franchise /
 * privilege tax. The `franchiseTaxType` determines how `franchiseTaxAmount`
 * should be read:
 *   - "flat": amount is a fixed dollar figure
 *   - "percentOfIncome": amount is a rate applied to net income (which we have),
 *      floored at the stated minimum
 *   - "percentOfNetWorth" / "percentOfRevenue" / "complex": the base depends on
 *      data we don't have, so we degrade to the documented minimum
 *   - "none" / missing: no franchise tax
 * Anything unrecognized degrades to the minimum (or 0), never a guess.
 */
export function stateFeesDetail(stateCode: string, netIncome = 0): StateFeesDetail {
  const entry = stateTaxData[stateCode]
  if (!entry) {
    return {
      total: 0,
      reportFee: 0,
      franchise: 0,
      franchiseType: 'none',
      isFloored: false,
    }
  }

  const reportFee = entry.annualReportFee ?? 0
  const min = entry.franchiseTaxMinimum ?? 0
  const { franchise, isFloored } = computeFranchise(
    entry.franchiseTaxType,
    entry.franchiseTaxAmount,
    min,
    netIncome,
  )

  return {
    total: reportFee + franchise,
    reportFee,
    franchise,
    franchiseType: entry.franchiseTaxType ?? 'none',
    isFloored,
  }
}

export function stateFees(stateCode: string, netIncome = 0): number {
  return stateFeesDetail(stateCode, netIncome).total
}
