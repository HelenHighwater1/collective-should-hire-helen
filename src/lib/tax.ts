import type { FilingStatus, Inputs } from '../types'
import {
  DEFAULT_SALARY_RATIO,
  FEDERAL_BRACKETS_2026,
  MEDICARE_RATE,
  SCORP_OVERHEAD,
  SCORP_VIABILITY_THRESHOLD,
  SE_FICA_RATE,
  SOCIAL_SECURITY_WAGE_BASE,
  STANDARD_DEDUCTION_2026,
} from './taxConstants'
import { marginalTax, marginalRate, stateFees, stateIncomeTax } from './stateTax'

export type SolePropResult = {
  netProfit: number
  federalIncomeTax: number
  seTax: number
  stateTax: number
  totalTax: number
  takeHome: number
}

export type SCorpResult = {
  netProfit: number
  salary: number
  distributions: number
  federalIncomeTax: number
  ficaTax: number
  stateIncomeTax: number
  stateFees: number
  overhead: number
  stateTaxAndFees: number
  totalTax: number
  takeHome: number
}

export type Comparison = {
  soleProp: SolePropResult
  sCorp: SCorpResult
  savings: number
  sCorpIsBetter: boolean
  belowViabilityThreshold: boolean
}

function federalIncomeTax(netProfit: number, filing: FilingStatus): number {
  return federalTaxDetail(netProfit, filing).tax
}

export type FederalTaxDetail = {
  taxableIncome: number
  tax: number
  marginalRate: number
  effectiveRate: number
}

export function federalTaxDetail(netProfit: number, filing: FilingStatus): FederalTaxDetail {
  const taxableIncome = Math.max(0, netProfit - STANDARD_DEDUCTION_2026[filing])
  const brackets = FEDERAL_BRACKETS_2026[filing]
  const tax = marginalTax(taxableIncome, brackets)

  return {
    taxableIncome,
    tax,
    marginalRate: marginalRate(taxableIncome, brackets),
    effectiveRate: taxableIncome > 0 ? tax / taxableIncome : 0,
  }
}

export type PayrollTaxDetail = {
  total: number
  socialSecurity: number
  medicare: number
}

/**
 * Self-employment / FICA tax: the full 15.3% applies up to the Social Security
 * wage base, with only the 2.9% Medicare portion continuing above it.
 */
export function payrollTax(base: number): number {
  return payrollTaxDetail(base).total
}

export function payrollTaxDetail(base: number): PayrollTaxDetail {
  if (base <= 0) {
    return { total: 0, socialSecurity: 0, medicare: 0 }
  }

  const ssBase = Math.min(base, SOCIAL_SECURITY_WAGE_BASE)
  const socialSecurity = ssBase * (SE_FICA_RATE - MEDICARE_RATE)
  const medicare =
    base <= SOCIAL_SECURITY_WAGE_BASE
      ? base * MEDICARE_RATE
      : SOCIAL_SECURITY_WAGE_BASE * MEDICARE_RATE +
        (base - SOCIAL_SECURITY_WAGE_BASE) * MEDICARE_RATE

  return {
    total: socialSecurity + medicare,
    socialSecurity,
    medicare,
  }
}

export function computeSoleProp(inputs: Inputs): SolePropResult {
  const netProfit = Math.max(0, inputs.income - inputs.expenses)
  const seTax = payrollTax(netProfit)
  const fed = federalIncomeTax(netProfit, inputs.filingStatus)
  const stateTax = stateIncomeTax(netProfit, inputs.stateCode)
  const totalTax = seTax + fed + stateTax

  return {
    netProfit,
    federalIncomeTax: fed,
    seTax,
    stateTax,
    totalTax,
    takeHome: netProfit - totalTax,
  }
}

export function computeSCorp(inputs: Inputs): SCorpResult {
  const netProfit = Math.max(0, inputs.income - inputs.expenses)
  const salary = netProfit * DEFAULT_SALARY_RATIO
  const distributions = netProfit - salary

  const ficaTax = payrollTax(salary)
  const fed = federalIncomeTax(netProfit, inputs.filingStatus)
  const stIncome = stateIncomeTax(netProfit, inputs.stateCode)
  const fees = stateFees(inputs.stateCode, netProfit)
  const overhead = netProfit > 0 ? SCORP_OVERHEAD : 0
  const stateTaxAndFees = stIncome + fees + overhead
  const totalTax = ficaTax + fed + stateTaxAndFees

  return {
    netProfit,
    salary,
    distributions,
    federalIncomeTax: fed,
    ficaTax,
    stateIncomeTax: stIncome,
    stateFees: fees,
    overhead,
    stateTaxAndFees,
    totalTax,
    takeHome: netProfit - totalTax,
  }
}

export function compareScenarios(inputs: Inputs): Comparison {
  const soleProp = computeSoleProp(inputs)
  const sCorp = computeSCorp(inputs)
  const savings = sCorp.takeHome - soleProp.takeHome

  return {
    soleProp,
    sCorp,
    savings,
    sCorpIsBetter: savings > 0,
    belowViabilityThreshold: soleProp.netProfit < SCORP_VIABILITY_THRESHOLD,
  }
}
