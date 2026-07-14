import { useState } from 'react'
import { FileJson, KeyRound, Layers3, Sparkles } from 'lucide-react'
import { cn } from './utils/cn'
import { Overview } from './pages/Overview'
import { KeysAndEncryption } from './pages/KeysAndEncryption'
import { PrivacyGroups } from './pages/PrivacyGroups'
import evidence from './data/devnet-run.json'
import type { DevnetRunEvidence } from './types/evidence'

const typedEvidence = evidence as DevnetRunEvidence

const TABS = [
  { id: 'overview', label: 'Overview', icon: FileJson },
  { id: 'keys', label: 'Keys & Encryption', icon: KeyRound },
  { id: 'privacy', label: 'Privacy Groups', icon: Layers3 },
] as const

function App() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview')

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
              <Sparkles size={12} className="text-solana-green" />
              Confidential Transfer technical deep-dive — real Solana devnet evidence
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
        {tab === 'overview' && <Overview evidence={typedEvidence} />}
        {tab === 'keys' && <KeysAndEncryption evidence={typedEvidence} />}
        {tab === 'privacy' && <PrivacyGroups />}
      </main>

      <footer className="border-t border-ink-800 py-6 text-center text-xs text-slate-600">
        Real Solana devnet data — not a simulation. Cross-check any address or signature at explorer.solana.com.
      </footer>
    </div>
  )
}

export default App
