import raw from '../../state_tax_data.json'

export type TaxBracket = {
  upTo: number | null
  rate: number
}

export type StateTaxEntry = {
  annualReportFee: number | null
  franchiseTaxType: string
  franchiseTaxAmount: number | null
  franchiseTaxMinimum: number | null
  franchiseTaxNotes?: string
  hasPersonalIncomeTax: boolean
  personalIncomeTaxRate: number | null
  personalIncomeTaxType: string
  personalIncomeTaxBrackets: TaxBracket[] | null
}

export const stateTaxData = raw as unknown as Record<string, StateTaxEntry>
