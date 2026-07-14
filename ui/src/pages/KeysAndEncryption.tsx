import { KeyRound, Lock, ShieldCheck, Unlock } from 'lucide-react'
import type { DevnetRunEvidence } from '../types/evidence'
import { AddressLink } from '../components/AddressLink'

const KEY_ROWS = [
  {
    key: 'Ed25519 wallet key',
    holder: 'Each participant',
    purpose: 'Sign transactions, prove ownership',
    source: 'Standard Solana keypair',
  },
  {
    key: 'ElGamal keypair',
    holder: 'Each confidential account owner',
    purpose: "Encrypt/decrypt that account's own balance",
    source: "Deterministically derived from the owner's Ed25519 signature — not a separate secret to back up",
  },
  {
    key: 'AES key',
    holder: 'Each confidential account owner',
    purpose: 'Fast symmetric decryption of their own balance',
    source: 'Same derivation pattern as the ElGamal keypair',
  },
  {
    key: 'Auditor ElGamal keypair',
    holder: "The mint's designated auditor",
    purpose: 'Decrypt the amount of any confidential transfer on that mint',
    source: 'Independently generated — not tied to any wallet',
  },
]

export function KeysAndEncryption({ evidence }: { evidence: DevnetRunEvidence }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 max-w-3xl">
        <span className="text-xs font-semibold uppercase tracking-wide text-solana-purple">Keys &amp; encryption</span>
        <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">Four keys, one real transfer</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-400">
          Confidential Balances layers ElGamal encryption (homomorphic — the network verifies balance arithmetic via
          zero-knowledge proofs without ever decrypting) and Pedersen commitments (backing the range proofs) on top of
          ordinary Token-2022 accounts.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-700 bg-ink-900">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-ink-700 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Who holds it</th>
              <th className="px-4 py-3 font-medium">Purpose</th>
              <th className="px-4 py-3 font-medium">How it's obtained</th>
            </tr>
          </thead>
          <tbody>
            {KEY_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-ink-800 last:border-0">
                <td className="px-4 py-3 font-medium text-white">{row.key}</td>
                <td className="px-4 py-3 text-slate-400">{row.holder}</td>
                <td className="px-4 py-3 text-slate-400">{row.purpose}</td>
                <td className="px-4 py-3 text-slate-400">{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <KeyRound size={14} /> Banco Alfa's derived ElGamal pubkey
          </div>
          <div className="mt-2 font-mono text-[12.5px] break-all text-slate-300">{evidence.wallets.bancoAlfa.elgamalPubkey}</div>
          <p className="mt-2 text-[12px] text-slate-500">
            Safe to be public — it's what lets others encrypt <em>to</em> her account, and is stored openly in her
            account's <code className="rounded bg-ink-800 px-1 py-0.5">ConfidentialTransferAccount</code> extension data.
          </p>
        </div>
        <div className="rounded-xl border border-ink-700 bg-ink-900/60 p-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <ShieldCheck size={14} className="text-solana-green" /> Auditor's ElGamal pubkey
          </div>
          <div className="mt-2 font-mono text-[12.5px] break-all text-slate-300">{evidence.mint.auditorElgamalPubkey}</div>
          <p className="mt-2 text-[12px] text-slate-500">
            Embedded in the mint at creation. Every confidential transfer on this mint encrypts its amount under this
            key too, alongside the sender's and recipient's.
          </p>
        </div>
      </div>

      <div className="mt-10 mb-3">
        <h3 className="text-lg font-semibold text-white">Same on-chain field, three views</h3>
        <p className="mt-1 text-[13px] text-slate-400">
          These are the actual bytes from the run above — decrypted with the real keys involved, not simulated.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <CiphertextRow
          icon={Lock}
          label="Banco Alfa's available balance — raw on-chain field"
          value={evidence.wallets.bancoAlfa.rawEncryptedAvailableBalanceBase64}
          mono
        />
        <CiphertextRow
          icon={Unlock}
          label="...decrypted with Banco Alfa's own AES key"
          value={evidence.wallets.bancoAlfa.finalDecryptedBalanceDisplay}
          highlight
        />
        <CiphertextRow
          icon={Lock}
          label="Banca Meridian's available balance — raw on-chain field"
          value={evidence.wallets.bancaMeridian.rawEncryptedAvailableBalanceBase64}
          mono
        />
        <CiphertextRow
          icon={Unlock}
          label="...decrypted with Banca Meridian's own AES key"
          value={evidence.wallets.bancaMeridian.finalDecryptedBalanceDisplay}
          highlight
        />
      </div>

      <div className="mt-4 rounded-2xl border border-solana-green/30 bg-gradient-to-br from-ink-900 to-ink-850 p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-solana-green">
          <ShieldCheck size={14} /> Auditor decryption — proof, not assertion
        </div>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
          The transfer amount below wasn't handed to the auditor out of band. It was obtained by fetching transaction{' '}
          <AddressLink address={evidence.transfer.signature} explorer={evidence.transfer.explorer} />, decoding its{' '}
          <code className="rounded bg-ink-800 px-1 py-0.5 text-solana-green">ConfidentialTransfer</code> instruction
          data, and decrypting the auditor-ciphertext field with only the auditor's ElGamal secret key.
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-950 px-4 py-3">
          <span className="text-[13px] text-slate-400">Auditor independently decrypted:</span>
          <span className="text-lg font-semibold text-white">{evidence.transfer.auditorDecryptedAmountDisplay}</span>
          <span className="text-[12px] text-slate-500">(actual transfer was {evidence.transfer.amountDisplay})</span>
        </div>
      </div>
    </div>
  )
}

function CiphertextRow({
  icon: Icon,
  label,
  value,
  mono,
  highlight,
}: {
  icon: typeof Lock
  label: string
  value: string
  mono?: boolean
  highlight?: boolean
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-ink-700 bg-ink-900 p-4">
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${highlight ? 'bg-solana-green/15 text-solana-green' : 'bg-ink-700 text-slate-400'}`}>
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] uppercase tracking-wide text-slate-500">{label}</div>
        <div className={mono ? 'mt-1 break-all font-mono text-[12px] text-slate-300' : 'mt-1 text-lg font-semibold text-white'}>
          {value}
        </div>
      </div>
    </div>
  )
}
