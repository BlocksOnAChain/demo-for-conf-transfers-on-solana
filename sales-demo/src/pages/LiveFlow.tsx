import { useEffect, useState } from 'react'
import { SCENARIO } from '../data/scenario'
import { INTEGRATION_SCENARIO } from '../data/integrationScenario'
import { NetworkDiagram } from '../components/NetworkDiagram'
import { IntegrationDiagram } from '../components/IntegrationDiagram'
import { VisibilityPanel } from '../components/VisibilityPanel'
import { IntegrationNotes } from '../components/IntegrationNotes'
import { ConfidentialBalanceToggle } from '../components/ConfidentialBalanceToggle'
import { SummaryTable } from '../components/SummaryTable'
import { MilestoneTable } from '../components/MilestoneTable'
import { StepControls } from '../components/StepControls'

const STEP_DURATION_MS = 4500

const TIMELINE = [...SCENARIO.map((step) => ({ ...step, kind: 'privacy' as const })), ...INTEGRATION_SCENARIO]

export function LiveFlow() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const item = TIMELINE[index]

  useEffect(() => {
    if (!isPlaying) return
    if (index >= TIMELINE.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, TIMELINE.length - 1)), STEP_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isPlaying, index])

  const jump = (i: number) => {
    setIsPlaying(false)
    setIndex(i)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 min-h-[92px]">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{item.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">{item.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          {item.kind === 'privacy' ? <NetworkDiagram step={item} /> : <IntegrationDiagram step={item} />}
          <StepControls
            steps={TIMELINE}
            index={index}
            isPlaying={isPlaying}
            onPrev={() => jump(Math.max(0, index - 1))}
            onNext={() => jump(Math.min(TIMELINE.length - 1, index + 1))}
            onJump={jump}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onReset={() => jump(0)}
          />
        </div>

        <div className="flex flex-col gap-5">
          {item.kind === 'privacy' ? (
            <>
              {item.showToggle && <ConfidentialBalanceToggle />}
              <VisibilityPanel visibility={item.visibility} />
            </>
          ) : (
            <IntegrationNotes milestone={item.milestone} notes={item.notes} />
          )}
        </div>
      </div>

      {item.kind === 'privacy' && item.showSummary && (
        <div className="mt-6">
          <SummaryTable />
        </div>
      )}
      {item.kind === 'integration' && item.showMilestoneTable && (
        <div className="mt-6">
          <MilestoneTable />
        </div>
      )}
    </div>
  )
}
