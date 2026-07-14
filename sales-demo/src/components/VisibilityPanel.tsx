import { EyeOff, Users, ShieldCheck } from 'lucide-react'
import type { Visibility } from '../data/scenario'

const GROUPS = [
  { key: 'public' as const, label: 'Public / Competitors', icon: EyeOff, color: 'text-slate-300', border: 'border-ink-600' },
  { key: 'channel' as const, label: 'Channel Members', icon: Users, color: 'text-solana-purple', border: 'border-solana-purple/40' },
  { key: 'regulator' as const, label: 'Regulator', icon: ShieldCheck, color: 'text-solana-green', border: 'border-solana-green/40' },
]

export function VisibilityPanel({ visibility }: { visibility: Visibility }) {
  return (
    <div className="grid gap-3">
      {GROUPS.map((g) => (
        <div key={g.key} className={`rounded-xl border ${g.border} bg-ink-900 p-4`}>
          <div className={`mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${g.color}`}>
            <g.icon size={14} /> {g.label}
          </div>
          <ul className="space-y-1.5 text-[13px] leading-snug text-slate-300">
            {visibility[g.key].map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
