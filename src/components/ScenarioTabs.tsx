export type ScenarioTabId = 'sole' | 'scorp'

type ScenarioTabsProps = {
  active: ScenarioTabId
  onChange: (id: ScenarioTabId) => void
  isActive: boolean
  sCorpIsBetter: boolean
}

const TABS: { id: ScenarioTabId; label: string }[] = [
  { id: 'sole', label: 'Sole Proprietorship' },
  { id: 'scorp', label: 'S-Corp' },
]

export default function ScenarioTabs({
  active,
  onChange,
  isActive,
  sCorpIsBetter,
}: ScenarioTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Compare scenarios"
      className="flex w-full overflow-hidden rounded-sm ring-1 ring-stone-300/50"
    >
      {TABS.map(({ id, label }) => {
        const isWinner = id === 'sole' ? !sCorpIsBetter : sCorpIsBetter
        const accent = !isActive
          ? 'var(--color-muted)'
          : isWinner
            ? 'var(--color-green)'
            : 'var(--color-orange)'
        const selected = active === id

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`relative flex-1 px-3 py-2.5 text-center font-hand text-lg transition-all duration-300 ${
              selected
                ? 'bg-white/75'
                : 'bg-white/20 opacity-55 hover:opacity-90'
            }`}
            style={{
              color: accent,
              boxShadow: selected ? `inset 0 -3px 0 0 ${accent}` : undefined,
            }}
          >
            <span className="flex items-center justify-center gap-1.5">
              {label}
              {isActive && isWinner && (
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: accent }}
                  aria-hidden="true"
                />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
