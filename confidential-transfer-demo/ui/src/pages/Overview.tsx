import type { ReactNode } from 'react'
import { Building2, Landmark, ListChecks } from 'lucide-react'
import type { DevnetRunEvidence } from '../types/evidence'
import { AddressLink } from '../components/AddressLink'
import { RealDataBadge } from '../components/RealDataBadge'

const PHASE_LABELS: Record<string, string> = {
  '1-create-mint': 'Create mint (ConfidentialTransferMint + auditor key)',
  '2a-configure-alfa-account': "Configure Banco Alfa's confidential account",
  '2b-configure-meridian-account': "Configure Banca Meridian's confidential account",
  '3-mint-to-alfa': 'Mint plaintext tokens to Banco Alfa',
  '4-deposit-pending-balance': 'Deposit into pending confidential balance',
  '5-apply-pending-alfa': "Apply pending balance (Banco Alfa's available balance)",
  '7-confidential-transfer': 'Confidential transfer: Banco Alfa → Banca Meridian',
  '8-apply-pending-meridian': "Apply pending balance (Banca Meridian's available balance)",
}

export function Overview({ evidence }: { evidence: DevnetRunEvidence }) {
  const totalTx = Object.values(evidence.transactions).flat().length

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <div className="mb-2 flex items-center gap-2">
          <RealDataBadge />
          <span className="text-xs text-slate-500">{evidence.network} · generated {new Date(evidence.generatedAt).toLocaleString()}</span>
        </div>
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">A real Token-2022 confidential transfer, end to end</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Every value on this page came out of an actual run of{' '}
          <code className="rounded bg-ink-800 px-1.5 py-0.5 text-[13px] text-solana-green">scripts/build-devnet-demo.ts</code>{' '}
          against Solana devnet — {totalTx} real transactions across {Object.keys(evidence.transactions).length} steps. Click any
          address or signature to check it on the explorer yourself.
        </p>
      </div>

      <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mint</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-slate-500">Address </span>
            <AddressLink address={evidence.mint.address} explorer={evidence.mint.explorer} />
          </div>
          <div>
            <span className="text-slate-500">Decimals </span>
            <span className="font-mono text-slate-300">{evidence.decimals}</span>
          </div>
          <div title="An ElGamal pubkey embedded in the mint's extension data, not a separate on-chain account">
            <span className="text-slate-500">Auditor ElGamal pubkey </span>
            <span className="font-mono text-[12.5px] text-slate-300">{evidence.mint.auditorElgamalPubkey}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <WalletCard title="Banco Alfa" icon={Building2} data={evidence.wallets.bancoAlfa} />
        <WalletCard title="Banca Meridian" icon={Landmark} data={evidence.wallets.bancaMeridian} />
      </div>

      <div className="mt-4 rounded-2xl border border-solana-green/30 bg-gradient-to-br from-ink-900 to-ink-850 p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-solana-green">Confidential transfer</div>
        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <div>
            <span className="text-slate-500">Amount </span>
            <span className="font-semibold text-white">{evidence.transfer.amountDisplay}</span>
          </div>
          <div>
            <span className="text-slate-500">Transaction </span>
            <AddressLink address={evidence.transfer.signature} explorer={evidence.transfer.explorer} />
          </div>
          <div>
            <span className="text-slate-500">Auditor decrypted it as </span>
            <span className="font-semibold text-solana-green">{evidence.transfer.auditorDecryptedAmountDisplay}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 mb-3 flex items-center gap-2">
        <ListChecks size={16} className="text-slate-500" />
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">All {totalTx} transactions</h3>
      </div>
      <div className="flex flex-col gap-2">
        {Object.entries(evidence.transactions).map(([phase, signatures]) => (
          <div key={phase} className="rounded-xl border border-ink-700 bg-ink-900 p-3.5">
            <div className="text-[13px] font-medium text-white">{PHASE_LABELS[phase] ?? phase}</div>
            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
              {signatures.map((sig) => (
                <AddressLink key={sig} address={sig} explorer={`https://explorer.solana.com/tx/${sig}?cluster=devnet`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WalletCard({
  title,
  icon: Icon,
  data,
}: {
  title: string
  icon: typeof Building2
  data: DevnetRunEvidence['wallets']['bancoAlfa']
}) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-solana-purple/15 text-solana-purple">
          <Icon size={17} />
        </div>
        <div className="text-sm font-semibold text-white">{title}</div>
      </div>
      <dl className="space-y-2 text-[13px]">
        <Row label="Wallet" value={<AddressLink address={data.owner} explorer={data.explorer} />} />
        <Row label="Confidential token account" value={<AddressLink address={data.tokenAccount} explorer={data.tokenAccountExplorer} />} />
        <Row label="ElGamal pubkey" value={<span className="font-mono text-slate-300">{data.elgamalPubkey.slice(0, 12)}…</span>} />
        <Row label="Final decrypted balance" value={<span className="font-semibold text-solana-green">{data.finalDecryptedBalanceDisplay}</span>} />
      </dl>
    </div>
  )
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-slate-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  )
}
