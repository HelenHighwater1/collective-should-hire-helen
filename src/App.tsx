import { useEffect, useMemo, useRef, useState } from 'react'
import Footer from './components/Footer'
import InputCard from './components/InputCard'
import ScenarioPanel from './components/ScenarioPanel'
import ScenarioTabs, { type ScenarioTabId } from './components/ScenarioTabs'
import Tour from './components/Tour'
import { RoughBox } from './components/RoughSvg'
import type { PieSlice } from './components/RoughPie'
import { buildSCorpBreakdowns, buildSolePropBreakdowns } from './lib/explain'
import { DEFAULT_INPUTS, type Inputs } from './types'
import { compareScenarios } from './lib/tax'

const SLICE_COLORS = {
  federal: '#e03131',
  payroll: '#1971c2',
  state: '#f59f00',
  keep: '#2f9e44',
}

type TourTarget = 'none' | 'form' | 'sole' | 'scorp'

const TOUR_STEPS: { target: TourTarget; title: string; body: string }[] = [
  {
    target: 'none',
    title: 'Welcome, Collective Team, to my demo app!',
    body: "I'm Helen, and instead of just sending a resume I built you something. It's a live S Corp tax calculator for exactly the people you serve - freelancers and solo entrepreneurs wondering if restructuring would actually save them money. Let me give you the quick tour.",
  },
  {
    target: 'form',
    title: 'Start with your numbers',
    body: "Type in your income, pick your state, set your filing status - and open \"Refine\" if you want to add business expenses. There's no submit button; everything recalculates the instant you change anything.",
  },
  {
    target: 'sole',
    title: 'Life as a sole proprietor',
    body: "Here's where your money goes today: federal tax, self-employment / FICA, state tax, and what you actually keep. Hover any slice or line to see the real math behind it - the bracket you're in, your effective rate, your state's specific fees.",
  },
  {
    target: 'scorp',
    title: 'The same income as an S Corp',
    body: "Now the comparison. As an S Corp, FICA only hits your salary, not your distributions - but you pick up state fees and some overhead. The callout spells out exactly how much more (or less) you'd keep, so the tradeoff is honest. That gap is the whole reason this tool exists.",
  },
]

function App() {
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS)
  const [activeTab, setActiveTab] = useState<ScenarioTabId>('sole')
  const [tourStep, setTourStep] = useState(-1)

  const gridRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const soleRef = useRef<HTMLDivElement>(null)
  const scorpRef = useRef<HTMLDivElement>(null)

  const updateInputs = (patch: Partial<Inputs>) =>
    setInputs((prev) => ({ ...prev, ...patch }))

  useEffect(() => {
    const timer = window.setTimeout(() => setTourStep(0), 400)
    return () => window.clearTimeout(timer)
  }, [])

  const tourTarget = tourStep >= 0 ? TOUR_STEPS[tourStep]?.target : null

  useEffect(() => {
    if (tourStep < 0) return

    const step = TOUR_STEPS[tourStep]
    if (!step) return

    if (step.target === 'sole') setActiveTab('sole')
    if (step.target === 'scorp') setActiveTab('scorp')

    const refMap = {
      form: formRef,
      sole: soleRef,
      scorp: scorpRef,
    } as const

    const ref = step.target !== 'none' ? refMap[step.target] : null
    if (!ref) return

    const scrollTimer = window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)

    return () => window.clearTimeout(scrollTimer)
  }, [tourStep])

  const closeTour = () => {
    setTourStep(-1)
    // On mobile the tour scrolls down to the panels; bring the user back to the
    // input section at the top so they can start without scrolling up manually.
    const isMobile = window.matchMedia('(max-width: 1023px)').matches
    if (isMobile) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleTourNext = () => {
    if (tourStep >= TOUR_STEPS.length - 1) {
      closeTour()
    } else {
      setTourStep((s) => s + 1)
    }
  }

  const handleTourBack = () => setTourStep((s) => Math.max(0, s - 1))

  const handleTourSkip = () => closeTour()

  const result = useMemo(() => compareScenarios(inputs), [inputs])
  const isActive = result.soleProp.netProfit > 0

  const soleBreakdowns = useMemo(
    () => buildSolePropBreakdowns(inputs, result),
    [inputs, result],
  )
  const sCorpBreakdowns = useMemo(
    () => buildSCorpBreakdowns(inputs, result),
    [inputs, result],
  )

  const soleSlices = useMemo<PieSlice[]>(() => {
    const { soleProp } = result
    return [
      {
        label: 'Federal Income Tax',
        value: soleProp.federalIncomeTax,
        color: SLICE_COLORS.federal,
        breakdown: soleBreakdowns['Federal Income Tax'],
      },
      {
        label: 'Self-Employment / FICA',
        value: soleProp.seTax,
        color: SLICE_COLORS.payroll,
        breakdown: soleBreakdowns['Self-Employment / FICA'],
      },
      {
        label: 'State Tax',
        value: soleProp.stateTax,
        color: SLICE_COLORS.state,
        breakdown: soleBreakdowns['State Tax'],
      },
      {
        label: 'You Keep',
        value: Math.max(0, soleProp.takeHome),
        color: SLICE_COLORS.keep,
        breakdown: soleBreakdowns['You Keep'],
      },
    ]
  }, [result, soleBreakdowns])

  const sCorpSlices = useMemo<PieSlice[]>(() => {
    const { sCorp } = result
    return [
      {
        label: 'Federal Income Tax',
        value: sCorp.federalIncomeTax,
        color: SLICE_COLORS.federal,
        breakdown: sCorpBreakdowns['Federal Income Tax'],
      },
      {
        label: 'FICA Tax (salary)',
        value: sCorp.ficaTax,
        color: SLICE_COLORS.payroll,
        breakdown: sCorpBreakdowns['FICA Tax (salary)'],
      },
      {
        label: 'State Tax & Fees',
        value: sCorp.stateTaxAndFees,
        color: SLICE_COLORS.state,
        breakdown: sCorpBreakdowns['State Tax & Fees'],
      },
      {
        label: 'You Keep',
        value: Math.max(0, sCorp.takeHome),
        color: SLICE_COLORS.keep,
        breakdown: sCorpBreakdowns['You Keep'],
      },
    ]
  }, [result, sCorpBreakdowns])

  const zeroSlices = (slices: PieSlice[]) =>
    slices.map((slice) => ({ ...slice, value: 0 }))

  const soleDisplaySlices = isActive ? soleSlices : zeroSlices(soleSlices)
  const sCorpDisplaySlices = isActive ? sCorpSlices : zeroSlices(sCorpSlices)
  const soleDisplayTax = isActive ? result.soleProp.totalTax : 0
  const soleDisplayTakeHome = isActive ? result.soleProp.takeHome : 0
  const sCorpDisplayTax = isActive ? result.sCorp.totalTax : 0
  const sCorpDisplayTakeHome = isActive ? result.sCorp.takeHome : 0

  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:px-6">
        <header className="header-enter mb-8 text-center">
          <h1 className="font-hand text-4xl text-ink sm:text-5xl">
            Should I S-Corp?
          </h1>
          <p className="mt-3 text-base text-muted sm:text-lg">
            Compare sole proprietorship vs. S Corp tax savings for freelancers
          </p>
        </header>

        <RoughBox
          stroke="rgba(30,30,30,0.7)"
          fill="var(--color-paper)"
          roughness={0.8}
          corners
          shadow
          className="main-enter"
          paddingClassName="px-5 py-8 sm:px-8 sm:py-10"
        >
          <div
            ref={gridRef}
            className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-[1fr_minmax(0,19rem)_1fr] lg:gap-5 xl:gap-8"
          >
            <div
              ref={formRef}
              className={`order-1 flex justify-center lg:order-2 ${
                tourTarget === 'form' ? 'tour-highlight' : ''
              }`}
            >
              <InputCard inputs={inputs} onChange={updateInputs} />
            </div>

            <div className="order-2 lg:hidden">
              <ScenarioTabs
                active={activeTab}
                onChange={setActiveTab}
                isActive={isActive}
                sCorpIsBetter={result.sCorpIsBetter}
              />
            </div>

            <div
              ref={soleRef}
              className={`order-3 panel-enter lg:order-1 lg:block ${
                activeTab === 'sole' ? 'block' : 'hidden'
              } ${tourTarget === 'sole' ? 'tour-highlight' : ''}`}
            >
              <ScenarioPanel
                title="Sole Proprietorship"
                side="left"
                isActive={isActive}
                isWinner={!result.sCorpIsBetter}
                slices={soleDisplaySlices}
                totalTax={soleDisplayTax}
                takeHome={soleDisplayTakeHome}
              />
            </div>

            <div
              ref={scorpRef}
              className={`order-4 panel-enter lg:order-3 lg:block ${
                activeTab === 'scorp' ? 'block' : 'hidden'
              } ${tourTarget === 'scorp' ? 'tour-highlight' : ''}`}
            >
              <ScenarioPanel
                title="S-Corp"
                side="right"
                isActive={isActive}
                isWinner={result.sCorpIsBetter}
                slices={sCorpDisplaySlices}
                totalTax={sCorpDisplayTax}
                takeHome={sCorpDisplayTakeHome}
                savings={result.savings}
                sCorpIsBetter={result.sCorpIsBetter}
                belowViabilityThreshold={result.belowViabilityThreshold}
              />
            </div>
          </div>
        </RoughBox>
      </main>

      <Footer />

      {tourStep >= 0 && (
        <Tour
          step={tourStep}
          total={TOUR_STEPS.length}
          title={TOUR_STEPS[tourStep].title}
          body={TOUR_STEPS[tourStep].body}
          onNext={handleTourNext}
          onBack={handleTourBack}
          onSkip={handleTourSkip}
          isLast={tourStep === TOUR_STEPS.length - 1}
          anchorRef={gridRef}
        />
      )}
    </div>
  )
}

export default App
