import { AlertTriangle, ExternalLink } from 'lucide-react'
import { cn } from '../utils/cn'

const STATUS_ROWS = [
  {
    layer: 'Confidential Transfers / Balances',
    detail: 'Live on Token-2022 mainnet today. Franklin Templeton and Spiko already use similar patterns.',
    status: 'Live',
    tone: 'green' as const,
  },
  {
    layer: 'Private channels',
    detail:
      'Reference stack is open source and functional. Audit and productization are ongoing — not something to hand to production next week without the audit story.',
    status: 'Pre-audit',
    tone: 'amber' as const,
  },
]

const TONE_CLASSES: Record<string, string> = {
  green: 'bg-solana-green/15 text-solana-green border-solana-green/30',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
}

const TRADEOFFS = [
  {
    title: 'Confidential Balances hides amounts — not counterparties or the mint',
    body: "If Allfunds needs to hide who is buying what fund, the private channel is the layer that does that. Confidential Balances alone is not enough.",
  },
  {
    title: 'Full sovereignty means full operational responsibility',
    body: 'The private channel gives Allfunds control over its own rules — which also means running the operator, indexers and KYC gates. Not a new burden versus what they run today, but worth naming.',
  },
  {
    title: 'ZK proof generation is a one-time wallet-stack integration cost',
    body: 'Proof generation for Confidential Transfers happens client-side. Fireblocks and Turnkey already support it; other custody providers vary.',
  },
]

const REPOS = [
  {
    label: 'Token-2022 Confidential Balances',
    repo: 'solana-labs/solana-program-library',
    url: 'https://github.com/solana-labs/solana-program-library',
  },
  {
    label: 'Private channel reference (heads-up: pre-audit)',
    repo: 'solana-foundation/solana-private-channels',
    url: 'https://github.com/solana-foundation/solana-private-channels',
  },
]

export function TradeOffs() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-solana-purple">Status &amp; trade-offs</span>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">What's live today vs. maturing</h2>
      </div>

      <div className="flex flex-col gap-3">
        {STATUS_ROWS.map((row) => (
          <div key={row.layer} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4">
            <div className="max-w-2xl">
              <div className="text-sm font-semibold text-white">{row.layer}</div>
              <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{row.detail}</p>
            </div>
            <span className={cn('shrink-0 rounded-full border px-3 py-1 text-xs font-medium', TONE_CLASSES[row.tone])}>
              {row.status}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-4 max-w-3xl">
        <h3 className="text-lg font-semibold text-white">Trade-offs to flag</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {TRADEOFFS.map((t) => (
          <div key={t.title} className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
            <AlertTriangle size={16} className="text-amber-400" />
            <div className="mt-2 text-[13px] font-semibold text-white">{t.title}</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{t.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-4 max-w-3xl">
        <h3 className="text-lg font-semibold text-white">If they want to see it working</h3>
        <p className="mt-1 text-[13px] text-slate-400">Reference deployments to point Allfunds engineering at.</p>
      </div>
      <div className="flex flex-col gap-2.5">
        {REPOS.map((r) => (
          <a
            key={r.repo}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4 transition-colors hover:border-solana-purple/50"
          >
            <div>
              <div className="text-sm font-medium text-white">{r.label}</div>
              <div className="font-mono text-xs text-slate-500">{r.repo}</div>
            </div>
            <ExternalLink size={16} className="shrink-0 text-slate-500" />
          </a>
        ))}
      </div>
    </div>
  )
}
