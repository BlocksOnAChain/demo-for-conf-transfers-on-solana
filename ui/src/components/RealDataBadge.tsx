import { CheckCircle2 } from 'lucide-react'

export function RealDataBadge({ label = 'Real devnet data' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-solana-green/30 bg-solana-green/10 px-2.5 py-1 text-[11px] font-semibold text-solana-green">
      <CheckCircle2 size={12} />
      {label}
    </span>
  )
}
