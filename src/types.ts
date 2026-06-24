export type FilingStatus = 'single' | 'mfj'

export type Inputs = {
  income: number
  stateCode: string
  filingStatus: FilingStatus
  expenses: number
}

export const DEFAULT_INPUTS: Inputs = {
  income: 0,
  stateCode: 'CA',
  filingStatus: 'single',
  expenses: 0,
}
