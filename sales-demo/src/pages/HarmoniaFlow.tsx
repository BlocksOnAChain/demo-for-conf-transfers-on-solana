import { useEffect, useState } from 'react'
import { INTEGRATION_SCENARIO } from '../data/integrationScenario'
import { IntegrationDiagram } from '../components/IntegrationDiagram'
import { IntegrationNotes } from '../components/IntegrationNotes'
import { MilestoneTable } from '../components/MilestoneTable'
import { StepControls } from '../components/StepControls'

const STEP_DURATION_MS = 4500

export function HarmoniaFlow() {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const step = INTEGRATION_SCENARIO[index]

  useEffect(() => {
    if (!isPlaying) return
    if (index >= INTEGRATION_SCENARIO.length - 1) {
      setIsPlaying(false)
      return
    }
    const timer = setTimeout(() => setIndex((i) => Math.min(i + 1, INTEGRATION_SCENARIO.length - 1)), STEP_DURATION_MS)
    return () => clearTimeout(timer)
  }, [isPlaying, index])

  const jump = (i: number) => {
    setIsPlaying(false)
    setIndex(i)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 min-h-[92px]">
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{step.title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400 sm:text-[15px]">{step.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="flex flex-col gap-5">
          <IntegrationDiagram step={step} />
          <StepControls
            steps={INTEGRATION_SCENARIO}
            index={index}
            isPlaying={isPlaying}
            onPrev={() => jump(Math.max(0, index - 1))}
            onNext={() => jump(Math.min(INTEGRATION_SCENARIO.length - 1, index + 1))}
            onJump={jump}
            onTogglePlay={() => setIsPlaying((p) => !p)}
            onReset={() => jump(0)}
          />
        </div>

        <div className="flex flex-col gap-5">
          <IntegrationNotes milestone={step.milestone} notes={step.notes} />
        </div>
      </div>

      {step.showMilestoneTable && (
        <div className="mt-6">
          <MilestoneTable />
        </div>
      )}
    </div>
  )
}
