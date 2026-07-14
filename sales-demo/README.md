# Allfunds x Solana — Private Distribution & Confidential Settlement (Demo)

An interactive, **fully mocked/illustrative** walkthrough built for a business-audience call:
how Allfunds' existing permissioned distribution network (banks, wealth managers, fund
houses) could translate onto Solana using two complementary privacy layers —

- **Layer 1 — Confidential Balances / Confidential Transfers** (Token-2022 extension):
  encrypts amounts and balances on-chain, with an auditor key for regulators.
- **Layer 2 — Private Channels** (Contra / Solana Private Channels): a permissioned
  batching layer with direct mainnet liquidity access, zero per-transaction fees, and
  no public mempool inside the channel.

There is no live/on-chain data here — every number, wallet, and transaction in this app
is simulated for narrative purposes. For a companion build with a **real** Solana devnet
confidential-transfer run (real keys, real mint, real transaction signatures), see
[`../confidential-transfer-demo`](../confidential-transfer-demo) — the two are kept apart
deliberately so it's never ambiguous which one is mocked and which one is independently
verifiable on-chain.

## What's in the app

Four tabs:

1. **Why this stack** — the two-layer architecture, why it fits Allfunds' distribution
   network shape, and the reference architecture (Token-2022 extensions used, inbound/
   outbound subscription & redemption flow).
2. **Live flow** — a step-through animation of a subscription moving through the private
   channel and settling into a confidential-balance token account, with a toggle between
   "public view" (what a competitor/outsider sees) and "regulator view" (what the auditor
   key decrypts).
3. **Trade-offs & status** — what's live on mainnet today vs. still maturing (e.g. private
   channels are pre-audit), the trade-offs worth flagging out loud, and reference repos.
4. **Architecture comparison** — a closing summary mapping Allfunds' existing Hyperledger
   Besu privacy groups onto Solana's private channel (L2) + Confidential Balances (L1),
   dimension by dimension (what's hidden, what's still visible, the mechanism, auditor
   access, granularity). Same comparison as in `../confidential-transfer-demo/ui`, kept in
   sync by hand since this copy is intentionally self-contained (no dependency on real
   evidence data, unlike the other app's version).

## Running locally

```bash
npm install
npm run dev
```

Opens on `http://localhost:5183` (see `.claude/launch.json` for the pinned port; `npm run
dev` without that file will pick Vite's default port instead).

## Deploying

This is a static Vite/React build — no backend, no environment variables, no secrets.

```bash
npm run build   # outputs to dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, GitHub Pages, Cloudflare Pages). On
Vercel/Netlify, point them at the repo with Root Directory set to `sales-demo` and the
defaults otherwise (build command `npm run build`, output directory `dist`).

## Stack

React + TypeScript + Vite + Tailwind CSS v4. No wallet adapter, no RPC calls, no on-chain
dependency of any kind — intentionally, since this app's whole job is a fast, dependable
narrative walkthrough for a live call, not a technical proof.
