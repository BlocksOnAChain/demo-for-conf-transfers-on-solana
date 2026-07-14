import { ChevronLeft, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react'
import { cn } from '../utils/cn'
import { SCENARIO } from '../data/scenario'

interface Props {
  index: number
  isPlaying: boolean
  onPrev: () => void
  onNext: () => void
  onJump: (index: number) => void
  onTogglePlay: () => void
  onReset: () => void
}

export function StepControls({ index, isPlaying, onPrev, onNext, onJump, onTogglePlay, onReset }: Props) {
  const total = SCENARIO.length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-1.5">
        {SCENARIO.map((step, i) => (
          <button
            key={step.id}
            type="button"
            onClick={() => onJump(i)}
            title={step.title}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i === index ? 'bg-solana-green' : i < index ? 'bg-solana-purple/50' : 'bg-ink-600',
            )}
          />
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">
          Step {index + 1} of {total} · {SCENARIO[index].phase}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReset}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-600 text-slate-400 hover:border-ink-500 hover:text-white"
            title="Restart"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onPrev}
            disabled={index === 0}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-600 text-slate-300 hover:border-ink-500 hover:text-white disabled:opacity-30"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={onTogglePlay}
            className="flex h-8 items-center gap-1.5 rounded-lg bg-gradient-to-r from-solana-purple to-solana-green px-3 text-xs font-semibold text-ink-950"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={index === total - 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-ink-600 text-slate-300 hover:border-ink-500 hover:text-white disabled:opacity-30"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
