import { Layers3 } from 'lucide-react'

const ROWS = [
  {
    dimension: 'What is hidden',
    besu: 'Everything: existence, parties, contract state, amounts',
    channel: 'Order flow, counterparties, which fund/product',
    confidential: 'Only the balance/amount',
  },
  {
    dimension: 'What is still visible',
    besu: 'A privacy-marker tx on the public chain, no content',
    channel: 'Escrow deposits/withdrawals on mainnet (the channel boundary)',
    confidential: 'The account exists and received a transfer',
  },
  {
    dimension: 'Mechanism',
    besu: 'Private transaction manager distributes encrypted payloads only to group members, who execute and store the private state locally',
    channel: 'Off-chain-batched channel operated by Allfunds; no public mempool inside',
    confidential: 'Token-2022 extension: ElGamal + Pedersen encrypt the balance on the public ledger itself',
  },
  {
    dimension: 'Auditor/regulator access',
    besu: 'Whatever access the group grants a member added to the group',
    channel: 'Whatever Allfunds (as operator) grants via membership/KYC gating',
    confidential: 'A designated auditor ElGamal key decrypts the amount on demand — cryptographic, not access-grant-based',
  },
  {
    dimension: 'Granularity',
    besu: 'All-or-nothing per group',
    channel: 'All-or-nothing per channel membership',
    confidential: 'Per-mint, independent of channel membership',
  },
]

export function ArchitectureComparison() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-solana-purple">Architecture comparison</span>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Besu privacy groups vs. Solana's privacy stack</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Allfunds' existing network runs on Hyperledger Besu with a custom privacy plugin: each node pairs a{' '}
          <strong className="text-white">Servo node</strong> (the product/API layer) with an{' '}
          <strong className="text-white">Arrow node</strong> (Besu + the privacy plugin). A{' '}
          <strong className="text-white">privacy group</strong> is a set of participants who share private
          transactions — only members see that transaction's details and the resulting contract state; everyone else
          sees nothing beyond a content-free marker on the public ledger. It's an all-or-nothing model: there's no
          in-between where an outsider sees <em>that</em> a position exists but not <em>how much</em>.
        </p>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Solana has no direct equivalent at the protocol level — its ledger is public by default. Instead it
          composes two narrower, independent mechanisms that together cover the same ground and add a capability Besu
          privacy groups don't have on their own.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
        <table className="w-full min-w-[820px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Dimension</th>
              <th className="px-4 py-3 font-medium">Besu privacy group</th>
              <th className="px-4 py-3 font-medium text-solana-purple">Solana private channel (L2)</th>
              <th className="px-4 py-3 font-medium text-solana-green">Solana Confidential Balances (L1)</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.dimension} className="border-b border-ink-800 last:border-0 align-top">
                <td className="px-4 py-3 font-medium text-white">{row.dimension}</td>
                <td className="px-4 py-3 text-slate-400">{row.besu}</td>
                <td className="px-4 py-3 text-slate-300">{row.channel}</td>
                <td className="px-4 py-3 text-slate-300">{row.confidential}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-ink-700 bg-ink-900/60 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          <Layers3 size={14} /> Why this matters for Allfunds specifically
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-300">
          A Besu privacy group and a Solana private channel solve the same problem — restricting who sees order flow
          and counterparties — with a similar trust model (Allfunds, as operator or group admin, controls
          membership). That part of the migration is close to 1:1.
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-slate-300">
          What Solana adds that Besu's privacy groups don't give on their own is Confidential Balances at the
          settlement layer: even <em>after</em> a position settles onto the base ledger — public, permissionless,
          composable with the rest of Solana DeFi — the balance itself stays encrypted. A privacy group can't do
          this: once you're a member you see the balance in full; once you're not, you see nothing about the
          transaction at all. Solana decouples those two questions — <em>is this settled on a public, composable
          ledger</em> and <em>can an outside observer read the amount</em> — and the companion technical deep-dive
          (confidential-transfer-demo) proves the second half with a real transfer, a real auditor key, and real
          on-chain data.
        </p>
      </div>
    </div>
  )
}
