import { useState } from 'react'
import { Lock, Unlock, KeyRound, Eye } from 'lucide-react'
import { cn } from '../utils/cn'

const CIPHERTEXT =
  '0x8f3a1c…e94d2b · ElGamal(amount) + Pedersen(commitment), range-proof verified'

type View = 'public' | 'regulator'

export function ConfidentialBalanceToggle() {
  const [view, setView] = useState<View>('public')

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">Banco Alfa — Token-2022 Account</div>
          <div className="text-xs text-slate-500">Mint ATLAS-GEQ · ConfidentialTransferMint extension</div>
        </div>
        <div className="flex rounded-full border border-ink-600 bg-ink-850 p-1 text-xs font-medium">
          <button
            type="button"
            onClick={() => setView('public')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors',
              view === 'public' ? 'bg-ink-600 text-white' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            <Eye size={13} /> Public / explorer
          </button>
          <button
            type="button"
            onClick={() => setView('regulator')}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-colors',
              view === 'regulator' ? 'bg-solana-green/20 text-solana-green' : 'text-slate-400 hover:text-slate-200',
            )}
          >
            <KeyRound size={13} /> Regulator (auditor key)
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-ink-700 bg-ink-950 px-5 py-6">
        {view === 'public' ? (
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink-700 text-slate-300">
              <Lock size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">Balance field</div>
              <div className="truncate font-mono text-[13px] text-slate-300">{CIPHERTEXT}</div>
              <div className="mt-1 text-xs text-slate-500">
                Account exists · received a transfer · amount is not readable
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-solana-green/15 text-solana-green">
              <Unlock size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs uppercase tracking-wide text-slate-500">Balance field — decrypted</div>
              <div className="text-lg font-semibold text-white">40,000.00 ATLAS-GEQ shares</div>
              <div className="mt-1 text-xs text-slate-500">
                ≈ 2,000,000 USD @ NAV · decrypted with auditor key CNMV-ES-2026-0417
              </div>
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Same account, same on-chain data. The ciphertext never changes — only the auditor key determines who can
        open it.
      </p>
    </div>
  )
}
