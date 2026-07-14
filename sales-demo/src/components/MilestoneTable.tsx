import { MILESTONES } from '../data/integrationScenario'

export function MilestoneTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">Milestone</th>
            <th className="px-4 py-3 font-medium">Focus area</th>
            <th className="px-4 py-3 font-medium">Key outcome</th>
            <th className="px-4 py-3 font-medium">Duration</th>
          </tr>
        </thead>
        <tbody>
          {MILESTONES.map((row) => (
            <tr key={row.milestone} className="border-b border-ink-800 align-top last:border-0">
              <td className="px-4 py-3 font-medium whitespace-nowrap text-white">{row.milestone}</td>
              <td className="px-4 py-3 text-slate-300">{row.focus}</td>
              <td className="px-4 py-3 text-slate-400">{row.outcome}</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-300">{row.duration}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-ink-800 px-4 py-2.5 text-[11px] text-slate-500">
        Source: ioBuilders' "Harmonia program: AFBc on Solana via Asseto" grant scope, June 2026. Milestones 1 and 2
        proceed concurrently over the same five months.
      </div>
    </div>
  )
}
