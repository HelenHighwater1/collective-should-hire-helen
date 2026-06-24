import { useState } from 'react'
import { RoughBox } from './RoughSvg'
import { STATE_OPTIONS } from '../lib/states'
import { formatCurrencyInput, parseCurrencyInput } from '../lib/format'
import type { FilingStatus, Inputs } from '../types'

type InputCardProps = {
  inputs: Inputs
  onChange: (patch: Partial<Inputs>) => void
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1.5 block text-sm font-semibold text-ink">{children}</label>
}

function CurrencyField({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (next: number) => void
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <RoughBox
        stroke="#ced4da"
        fill="#ffffff"
        paddingClassName="px-3 py-2"
        className="transition-[filter] duration-200 focus-within:brightness-[0.98]"
      >
        <input
          type="text"
          inputMode="numeric"
          value={formatCurrencyInput(value)}
          onChange={(e) => onChange(parseCurrencyInput(e.target.value))}
          placeholder="$0"
          className="w-full bg-transparent text-base text-ink outline-none placeholder:text-muted"
        />
      </RoughBox>
    </div>
  )
}

function ToggleOption({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <RoughBox
      stroke={active ? 'var(--color-blue)' : '#ced4da'}
      fill={active ? 'rgba(25, 113, 194, 0.1)' : 'transparent'}
      paddingClassName="p-0"
      className="transition-transform duration-150 active:scale-[0.98]"
    >
      <button
        type="button"
        onClick={onClick}
        className={`w-full px-2 py-2 text-center text-sm transition-colors duration-200 ${
          active ? 'font-semibold text-blue' : 'text-muted hover:text-ink'
        }`}
      >
        {children}
      </button>
    </RoughBox>
  )
}

export default function InputCard({ inputs, onChange }: InputCardProps) {
  const [refineOpen, setRefineOpen] = useState(false)

  const setFiling = (filingStatus: FilingStatus) => onChange({ filingStatus })

  return (
    <RoughBox
      stroke="var(--color-blue)"
      fill="#ffffff"
      roughness={0.9}
      shadow
      className="panel-enter w-full max-w-xs sm:max-w-sm"
      paddingClassName="px-6 py-7"
    >
      <div className="space-y-5">
        <div className="text-center">
          <h2 className="font-hand text-2xl text-blue">Your numbers</h2>
          <p className="mt-1 text-sm text-muted">
            Adjust inputs to compare side by side
          </p>
        </div>

        <CurrencyField
          label="Annual freelance income"
          value={inputs.income}
          onChange={(income) => onChange({ income })}
        />

        <div>
          <FieldLabel>State</FieldLabel>
          <RoughBox
            stroke="#ced4da"
            fill="#ffffff"
            paddingClassName="px-3 py-2"
            className="transition-[filter] duration-200 focus-within:brightness-[0.98]"
          >
            <div className="relative">
              <select
                value={inputs.stateCode}
                onChange={(e) => onChange({ stateCode: e.target.value })}
                className="w-full cursor-pointer appearance-none bg-transparent pr-6 text-base text-ink outline-none transition-colors duration-200 hover:text-blue"
              >
                {STATE_OPTIONS.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center text-muted">
                ▾
              </span>
            </div>
          </RoughBox>
        </div>

        <div>
          <FieldLabel>Filing status</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <ToggleOption
              active={inputs.filingStatus === 'single'}
              onClick={() => setFiling('single')}
            >
              Single
            </ToggleOption>
            <ToggleOption
              active={inputs.filingStatus === 'mfj'}
              onClick={() => setFiling('mfj')}
            >
              Married jointly
            </ToggleOption>
          </div>
        </div>

        <div className="border-t border-dashed border-stone-200 pt-4">
          <button
            type="button"
            onClick={() => setRefineOpen((o) => !o)}
            className="flex w-full items-center justify-between text-base text-muted transition-colors duration-200 hover:text-blue"
            aria-expanded={refineOpen}
          >
            <span>Refine your estimate</span>
            <span
              className={`inline-block text-xl leading-none transition-transform duration-300 ${
                refineOpen ? 'rotate-45' : ''
              }`}
            >
              +
            </span>
          </button>

          <div
            className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
              refineOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="mt-4">
                <CurrencyField
                  label="Annual business expenses"
                  value={inputs.expenses}
                  onChange={(expenses) => onChange({ expenses })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </RoughBox>
  )
}
