import { FileCheck2 } from 'lucide-react'

export function IntegrationNotes({ milestone, notes }: { milestone: string; notes: string[] }) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-ink-900 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-400">
        <FileCheck2 size={14} /> Harmonia Flow Steps · {milestone}
      </div>
      <ul className="space-y-1.5 text-[13px] leading-snug text-slate-300">
        {notes.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
