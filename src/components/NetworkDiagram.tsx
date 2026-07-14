import { motion } from 'framer-motion'
import { NODES, type NodeId } from '../data/nodes'
import type { DiagramEdge, ScenarioStep } from '../data/scenario'
import { ICON_MAP } from './icon-map'

const ZONE_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  outside: { border: 'border-ink-500', bg: 'bg-ink-850/80', text: 'text-slate-300' },
  channel: { border: 'border-solana-purple/60', bg: 'bg-ink-850/90', text: 'text-white' },
  mainnet: { border: 'border-solana-green/50', bg: 'bg-ink-850/90', text: 'text-white' },
}

const EDGE_COLOR: Record<DiagramEdge['style'], string> = {
  public: '#cbd5e1',
  private: '#c084fc',
  settlement: '#14f195',
}

function NodeCard({ id, active }: { id: NodeId; active: boolean }) {
  const node = NODES[id]
  const Icon = ICON_MAP[node.icon]
  const zoneStyle = ZONE_STYLES[node.zone]
  const w = 188
  const h = 78

  return (
    <foreignObject x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} style={{ overflow: 'visible' }}>
      <div
        className={`flex h-full w-full items-center gap-2.5 rounded-xl border px-3 backdrop-blur-sm transition-shadow duration-300 ${zoneStyle.border} ${zoneStyle.bg} ${
          active ? 'shadow-[0_0_0_3px_rgba(153,69,255,0.35),0_0_28px_rgba(20,241,149,0.25)]' : ''
        }`}
      >
        <Icon className={active ? 'shrink-0 text-solana-green' : 'shrink-0 text-slate-400'} size={20} />
        <div className="min-w-0 text-left">
          <div className={`truncate text-[13px] font-semibold leading-tight ${zoneStyle.text}`}>{node.label}</div>
          <div className="truncate text-[10.5px] leading-tight text-slate-400">{node.sublabel}</div>
        </div>
      </div>
    </foreignObject>
  )
}

function Edge({ edge }: { edge: DiagramEdge }) {
  const from = NODES[edge.from]
  const to = NODES[edge.to]
  const color = EDGE_COLOR[edge.style]
  const dashed = edge.style === 'private'
  const midX = (from.x + to.x) / 2
  const midY = (from.y + to.y) / 2

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={to.x}
        y2={to.y}
        stroke={color}
        strokeWidth={edge.style === 'settlement' ? 3 : 2}
        strokeLinecap="round"
        className={dashed ? 'animate-dash' : ''}
        markerEnd={`url(#arrow-${edge.style})`}
        opacity={0.9}
      />
      <motion.circle
        r={6.5}
        fill={color}
        initial={{ cx: from.x, cy: from.y, opacity: 0 }}
        animate={{ cx: [from.x, to.x], cy: [from.y, to.y], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
      <foreignObject x={midX - 100} y={midY - 24} width={200} height={48} style={{ overflow: 'visible', pointerEvents: 'none' }}>
        <div className="flex flex-col items-center">
          <span
            className="rounded-full border px-2.5 py-0.5 text-[10.5px] font-medium whitespace-nowrap"
            style={{ borderColor: color, color, background: 'rgba(8,7,13,0.9)' }}
          >
            {edge.label}
          </span>
          <span className="mt-1 whitespace-nowrap text-[10px] text-slate-400">{edge.amount}</span>
        </div>
      </foreignObject>
    </g>
  )
}

export function NetworkDiagram({ step }: { step: ScenarioStep }) {
  const active = new Set(step.activeNodes)

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-ink-700 bg-[radial-gradient(ellipse_at_top,_#141226_0%,_#08070d_70%)]">
      <svg viewBox="0 0 1000 620" className="h-auto w-full">
        <defs>
          {(['public', 'private', 'settlement'] as const).map((style) => (
            <marker
              key={style}
              id={`arrow-${style}`}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0 L 10 5 L 0 10 z" fill={EDGE_COLOR[style]} />
            </marker>
          ))}
        </defs>

        <text x="40" y="24" className="fill-slate-500" style={{ fontSize: 11, letterSpacing: 1.5 }}>
          OUTSIDE OBSERVERS
        </text>
        <line x1="40" y1="100" x2="960" y2="100" stroke="#211f38" strokeWidth={1} strokeDasharray="4 4" />

        <rect x="55" y="112" width="890" height="235" rx="16" fill="rgba(153,69,255,0.04)" stroke="rgba(153,69,255,0.35)" strokeDasharray="5 5" />
        <text x="72" y="136" className="fill-solana-purple" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>
          PRIVATE CHANNEL — OPERATED BY ALLFUNDS
        </text>

        <rect x="55" y="382" width="890" height="220" rx="16" fill="rgba(20,241,149,0.04)" stroke="rgba(20,241,149,0.3)" strokeDasharray="5 5" />
        <text x="72" y="404" className="fill-solana-green" style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 600 }}>
          SOLANA MAINNET
        </text>

        {step.edges.map((edge) => (
          <Edge key={`${step.id}-${edge.id}`} edge={edge} />
        ))}

        {(Object.keys(NODES) as NodeId[]).map((id) => (
          <NodeCard key={id} id={id} active={active.has(id)} />
        ))}
      </svg>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-ink-700 px-5 py-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-slate-300" /> Public on-chain
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 border-t-2 border-dashed border-solana-purple" /> Private, channel-internal
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-5 bg-solana-green" /> Confidential settlement (mainnet, encrypted amount)
        </span>
      </div>
    </div>
  )
}
