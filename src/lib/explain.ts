import { formatCurrency } from './format'
import { stateName } from './states'
import {
  SOCIAL_SECURITY_WAGE_BASE,
  STANDARD_DEDUCTION_2026,
} from './taxConstants'
import { stateFeesDetail, stateIncomeTaxDetail } from './stateTax'
import type { Comparison } from './tax'
import {
  federalTaxDetail,
  payrollTaxDetail,
} from './tax'
import type { Inputs } from '../types'

export type BreakdownLine = {
  label: string
  value: string
}

function pct(rate: number): string {
  return `${(rate * 100).toFixed(rate * 100 < 10 ? 1 : 0)}%`
}

function filingLabel(status: Inputs['filingStatus']): string {
  return status === 'mfj' ? 'married filing jointly' : 'single'
}

function federalBreakdown(netProfit: number, filing: Inputs['filingStatus']): BreakdownLine[] {
  const detail = federalTaxDetail(netProfit, filing)
  const deduction = STANDARD_DEDUCTION_2026[filing]

  return [
    { label: 'Net profit', value: formatCurrency(netProfit) },
    {
      label: 'Standard deduction',
      value: `−${formatCurrency(deduction)}`,
    },
    { label: 'Taxable income', value: formatCurrency(detail.taxableIncome) },
    {
      label: 'Marginal bracket',
      value: detail.taxableIncome > 0 ? pct(detail.marginalRate) : '—',
    },
    {
      label: 'Effective rate',
      value: detail.taxableIncome > 0 ? pct(detail.effectiveRate) : '—',
    },
    { label: 'Federal tax', value: formatCurrency(detail.tax) },
  ]
}

function payrollBreakdown(
  base: number,
  label: 'Self-employment' | 'FICA',
): BreakdownLine[] {
  const detail = payrollTaxDetail(base)
  const wageBase = formatCurrency(SOCIAL_SECURITY_WAGE_BASE)

  return [
    {
      label: `${label} base`,
      value: formatCurrency(base),
    },
    {
      label: 'Social Security (12.4%)',
      value: `${formatCurrency(detail.socialSecurity)} up to ${wageBase}`,
    },
    {
      label: 'Medicare (2.9%)',
      value: formatCurrency(detail.medicare),
    },
    { label: 'Total payroll tax', value: formatCurrency(detail.total) },
  ]
}

function stateIncomeBreakdown(
  netProfit: number,
  stateCode: string,
): BreakdownLine[] {
  const name = stateName(stateCode)
  const detail = stateIncomeTaxDetail(netProfit, stateCode)

  if (detail.type === 'none' || netProfit <= 0) {
    return [
      { label: 'State', value: name },
      { label: 'Personal income tax', value: 'None' },
      { label: 'State tax', value: formatCurrency(0) },
    ]
  }

  const typeLabel =
    detail.type === 'flat'
      ? 'Flat rate'
      : detail.type === 'graduated'
        ? 'Graduated brackets'
        : detail.type

  return [
    { label: 'State', value: name },
    { label: 'Tax type', value: typeLabel },
    { label: 'Taxable base', value: formatCurrency(netProfit) },
    {
      label: 'Marginal rate',
      value: pct(detail.marginalRate),
    },
    {
      label: 'Effective rate',
      value: pct(detail.effectiveRate),
    },
    { label: 'State income tax', value: formatCurrency(detail.tax) },
  ]
}

function solePropStateBreakdown(netProfit: number, stateCode: string): BreakdownLine[] {
  return stateIncomeBreakdown(netProfit, stateCode)
}

function sCorpStateFeesBreakdown(
  stateCode: string,
  netProfit: number,
  stateIncome: number,
  overhead: number,
): BreakdownLine[] {
  const name = stateName(stateCode)
  const fees = stateFeesDetail(stateCode, netProfit)
  const lines: BreakdownLine[] = [
    { label: 'State', value: name },
    { label: 'State income tax', value: formatCurrency(stateIncome) },
    {
      label: 'Annual report fee',
      value: formatCurrency(fees.reportFee),
    },
  ]

  if (fees.franchise > 0 || fees.isFloored) {
    const franchiseLabel = fees.isFloored
      ? 'Franchise / privilege tax (at least)'
      : fees.franchiseType === 'percentOfIncome'
        ? 'Franchise tax (% of income)'
        : fees.franchiseType === 'flat'
          ? 'Franchise / privilege tax'
          : 'Franchise / privilege tax'

    lines.push({
      label: franchiseLabel,
      value: fees.isFloored
        ? `${formatCurrency(fees.franchise)} minimum`
        : formatCurrency(fees.franchise),
    })

    if (fees.isFloored) {
      lines.push({
        label: 'Note',
        value: 'Actual fee may depend on net worth or revenue',
      })
    }
  } else if (fees.franchiseType !== 'none') {
    lines.push({
      label: 'Franchise / privilege tax',
      value: 'Not estimated (varies by net worth or revenue)',
    })
  }

  lines.push({
    label: 'S-Corp overhead (assumed)',
    value: formatCurrency(overhead),
  })
  lines.push({
    label: 'Combined state & fees',
    value: formatCurrency(stateIncome + fees.total + overhead),
  })

  return lines
}

function takeHomeBreakdown(
  netProfit: number,
  takeHome: number,
  totalTax: number,
): BreakdownLine[] {
  const keepPct = netProfit > 0 ? (takeHome / netProfit) * 100 : 0

  return [
    { label: 'Net profit', value: formatCurrency(netProfit) },
    { label: 'Total tax paid', value: formatCurrency(totalTax) },
    {
      label: 'You keep',
      value: `${formatCurrency(takeHome)} (${keepPct.toFixed(1)}%)`,
    },
  ]
}

export type ScenarioBreakdowns = Record<string, BreakdownLine[]>

export function buildSolePropBreakdowns(
  inputs: Inputs,
  comparison: Comparison,
): ScenarioBreakdowns {
  const { soleProp } = comparison
  const { netProfit } = soleProp

  return {
    'Federal Income Tax': federalBreakdown(netProfit, inputs.filingStatus),
    'Self-Employment / FICA': payrollBreakdown(netProfit, 'Self-employment'),
    'State Tax': solePropStateBreakdown(netProfit, inputs.stateCode),
    'You Keep': takeHomeBreakdown(netProfit, soleProp.takeHome, soleProp.totalTax),
  }
}

export function buildSCorpBreakdowns(
  inputs: Inputs,
  comparison: Comparison,
): ScenarioBreakdowns {
  const { sCorp } = comparison
  const { netProfit, salary } = sCorp

  return {
    'Federal Income Tax': [
      ...federalBreakdown(netProfit, inputs.filingStatus),
      {
        label: 'Filing status',
        value: filingLabel(inputs.filingStatus),
      },
    ],
    'FICA Tax (salary)': [
      {
        label: 'Salary (50% of net profit)',
        value: formatCurrency(salary),
      },
      {
        label: 'Distributions',
        value: formatCurrency(sCorp.distributions),
      },
      ...payrollBreakdown(salary, 'FICA'),
    ],
    'State Tax & Fees': sCorpStateFeesBreakdown(
      inputs.stateCode,
      netProfit,
      sCorp.stateIncomeTax,
      sCorp.overhead,
    ),
    'You Keep': takeHomeBreakdown(netProfit, sCorp.takeHome, sCorp.totalTax),
  }
}
