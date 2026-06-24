import type { TaxBracket } from './stateTaxData'
import type { FilingStatus } from '../types'

// 2026 federal income tax brackets (IRS inflation-adjusted figures).
// `upTo` is the top of each marginal band; the final band uses null = no cap.
export const FEDERAL_BRACKETS_2026: Record<FilingStatus, TaxBracket[]> = {
  single: [
    { upTo: 12400, rate: 0.1 },
    { upTo: 50400, rate: 0.12 },
    { upTo: 105700, rate: 0.22 },
    { upTo: 201775, rate: 0.24 },
    { upTo: 256225, rate: 0.32 },
    { upTo: 640600, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
  mfj: [
    { upTo: 24800, rate: 0.1 },
    { upTo: 100800, rate: 0.12 },
    { upTo: 211400, rate: 0.22 },
    { upTo: 403550, rate: 0.24 },
    { upTo: 512450, rate: 0.32 },
    { upTo: 768700, rate: 0.35 },
    { upTo: null, rate: 0.37 },
  ],
}

// 2026 standard deduction. Applied identically to both scenarios, so it does
// not affect the S-corp vs sole-prop delta, only the absolute figures.
export const STANDARD_DEDUCTION_2026: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
}

// Social Security wage base. Per the project brief; update to the official
// 2026 figure if desired.
export const SOCIAL_SECURITY_WAGE_BASE = 168600

// Combined self-employment / FICA rate (12.4% Social Security + 2.9% Medicare).
export const SE_FICA_RATE = 0.153
// Medicare-only rate that continues above the Social Security wage base.
export const MEDICARE_RATE = 0.029

// Default share of S-corp net profit paid as a "reasonable" W-2 salary.
export const DEFAULT_SALARY_RATIO = 0.5

// Flat annual assumption for S-corp overhead (accounting, payroll service).
export const SCORP_OVERHEAD = 2500

// Below this net profit, the S-corp election generally may not pencil out.
export const SCORP_VIABILITY_THRESHOLD = 60000
