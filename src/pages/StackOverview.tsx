import { CheckCircle2 } from 'lucide-react'
import { STACK_LAYERS } from '../data/stack'
import { STACK_ICON_MAP } from '../components/icon-map-stack'
import { cn } from '../utils/cn'

export function StackOverview() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-solana-purple">Solana's privacy stack</span>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Two layers, one right answer for Allfunds</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          For Allfunds specifically, the right architecture combines{' '}
          <span className="text-white">Layer 2 (private channel) + Layer 1 (confidential balances)</span> — not one or
          the other.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {STACK_LAYERS.map((layer) => {
          const Icon = STACK_ICON_MAP[layer.icon]
          return (
            <div
              key={layer.id}
              className={cn(
                'rounded-2xl border p-5 transition-colors',
                layer.recommended
                  ? 'border-solana-purple/50 bg-gradient-to-br from-ink-900 to-ink-850'
                  : 'border-ink-700 bg-ink-900/60 opacity-70',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                      layer.recommended ? 'bg-solana-purple/15 text-solana-purple' : 'bg-ink-700 text-slate-400',
                    )}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Layer {layer.layerNumber}
                    </div>
                    <div className="text-base font-semibold text-white">{layer.name}</div>
                    <div className="text-xs text-slate-500">{layer.tagline}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {layer.recommended && (
                    <span className="flex items-center gap-1 rounded-full bg-solana-green/15 px-2.5 py-1 text-[11px] font-semibold text-solana-green">
                      <CheckCircle2 size={12} /> Allfunds fit
                    </span>
                  )}
                  <span className="rounded-full border border-ink-600 px-2.5 py-1 text-[11px] text-slate-400">
                    {layer.status}
                  </span>
                </div>
              </div>

              <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {layer.bullets.map((b, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-snug text-slate-300">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reference architecture</div>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
          Fund shares are Token-2022 mints on Solana mainnet, with{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-[13px] text-solana-green">ConfidentialTransferMint</code>,{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-[13px] text-solana-green">PermanentDelegate</code> (for
          compliance seizures), and{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-[13px] text-solana-green">DefaultAccountState = Frozen</code>{' '}
          extensions. Allfunds operates a private channel where subscriptions and redemptions flow between banks, fund
          managers and the transfer agent in real time with zero fee and no public visibility. Inbound: a bank locks
          USDC (or on-chain EUR) in the channel's mainnet escrow, receives channel credit, subscribes to a fund — the
          subscription mints shares directly into the bank's confidential-balance token account. Outbound: redemption
          burns the channel-side shares, releases the corresponding cash on mainnet. Regulators get the auditor key for
          whichever mint they supervise and see everything they need without the public seeing anything.
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <WhyCard
          title="Distribution networks are the exact shape private channels model"
          body="Allfunds already runs a permissioned B2B network of ~900 wealth managers, banks and fund houses. A private channel Allfunds operates, with those counterparties as members, is the Solana-native translation of what they already do."
        />
        <WhyCard
          title="Confidential Balances protect the settled position"
          body="Once a fund subscription settles to a wealth manager's account on mainnet, the balance is encrypted. Competitors see a fund holder exists; they cannot see how much."
        />
      </div>
    </div>
  )
}

function WhyCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
      <div className="text-[13px] font-semibold text-white">{title}</div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-slate-400">{body}</p>
    </div>
  )
}
