import { COMPARISON_ROWS } from '../data/scenario'

export function SummaryTable() {
  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3 font-medium">What's at stake</th>
            <th className="px-4 py-3 font-medium">Public / Competitors</th>
            <th className="px-4 py-3 font-medium text-solana-purple">Channel Members</th>
            <th className="px-4 py-3 font-medium text-solana-green">Regulator (Auditor Key)</th>
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.dimension} className="border-b border-ink-800 last:border-0">
              <td className="px-4 py-3 font-medium text-white">{row.dimension}</td>
              <td className="px-4 py-3 text-slate-400">{row.public}</td>
              <td className="px-4 py-3 text-slate-300">{row.channel}</td>
              <td className="px-4 py-3 text-slate-300">{row.regulator}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
