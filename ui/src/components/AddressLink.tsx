import { ExternalLink } from 'lucide-react'

function truncate(value: string, lead = 6, tail = 6): string {
  if (value.length <= lead + tail + 3) return value
  return `${value.slice(0, lead)}…${value.slice(-tail)}`
}

export function AddressLink({ address, explorer, full = false }: { address: string; explorer: string; full?: boolean }) {
  return (
    <a
      href={explorer}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-1 font-mono text-[12.5px] text-slate-300 hover:text-solana-green"
      title={address}
    >
      {full ? address : truncate(address)}
      <ExternalLink size={11} className="shrink-0 text-slate-500" />
    </a>
  )
}
