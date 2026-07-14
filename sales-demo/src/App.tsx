import { useState } from 'react'
import { Layers3, PlayCircle, ClipboardList, Sparkles } from 'lucide-react'
import { cn } from './utils/cn'
import { StackOverview } from './pages/StackOverview'
import { LiveFlow } from './pages/LiveFlow'
import { TradeOffs } from './pages/TradeOffs'

const TABS = [
  { id: 'stack', label: 'Why this stack', icon: Layers3, Page: StackOverview },
  { id: 'flow', label: 'Live flow', icon: PlayCircle, Page: LiveFlow },
  { id: 'tradeoffs', label: 'Trade-offs & status', icon: ClipboardList, Page: TradeOffs },
] as const

function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('stack')
  const ActivePage = TABS.find((t) => t.id === tab)!.Page

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="sticky top-0 z-10 border-b border-ink-700 bg-ink-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-solana-purple to-solana-green bg-clip-text text-lg font-bold text-transparent">
                Allfunds
              </span>
              <span className="text-lg font-bold text-slate-500">×</span>
              <span className="text-lg font-bold text-white">Solana</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles size={12} className="text-solana-purple" />
              Private distribution &amp; confidential settlement — illustrative, mocked flow
            </div>
          </div>

          <nav className="flex flex-wrap gap-1.5 rounded-full border border-ink-600 bg-ink-900 p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  tab === t.id ? 'bg-ink-600 text-white' : 'text-slate-400 hover:text-slate-200',
                )}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        <ActivePage />
      </main>

      <footer className="border-t border-ink-800 py-6 text-center text-xs text-slate-600">
        Illustrative demo with mocked data — not connected to a live chain. Entities, amounts and repo references are
        for discussion purposes.
      </footer>
    </div>
  )
}

export default App
