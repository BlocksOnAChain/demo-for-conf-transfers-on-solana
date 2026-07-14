# Allfunds x Solana — Confidential Settlement Demos

**Live demos:**
- 🎤 [allfunds-demo.vercel.app](https://allfunds-demo.vercel.app) — mocked sales walkthrough
- 🔍 [ui-seven-mocha.vercel.app](https://ui-seven-mocha.vercel.app) — real devnet evidence viewer

Two companion demos, kept in separate subfolders of this one repo so it's a single link
to share, while staying clear about which is which:

- **[`sales-demo/`](sales-demo/)** — an interactive, **fully mocked/illustrative**
  walkthrough for a business-audience call: the two-layer privacy architecture
  (confidential balances + private channels), a step-through of a subscription flowing
  through it, and a trade-offs/status page. No real chain interaction, no dependencies —
  built to run instantly for a live pitch.
- **[`confidential-transfer-demo/`](confidential-transfer-demo/)** — a **real** Solana
  devnet build: an actual Token-2022 mint with the `ConfidentialTransferMint` extension,
  real wallets and keys, a real confidential transfer between them, and an auditor
  independently decrypting the amount from on-chain data. Includes the captured evidence
  (real addresses and transaction signatures — verifiable on Solana's devnet explorer)
  and a companion UI that visualizes it, plus docs mapping Allfunds' existing Hyperledger
  Besu privacy groups onto Solana's model.

They're deliberately not blended into one app: one is a narrative simulation, the other
is an on-chain proof, and conflating them would make it unclear which claims are backed
by a real transaction and which are illustrative.

## Running either one

Each subfolder is independently runnable — see its own README for details:

```bash
cd sales-demo && npm install && npm run dev                    # mocked walkthrough
cd confidential-transfer-demo/ui && npm install && npm run dev # real-evidence viewer
```

## Deploying

Both are static Vite/React builds with no secrets or environment variables. If deploying
on Vercel/Netlify, set the project's Root Directory to the subfolder you want:
- `sales-demo` for the mocked walkthrough
- `confidential-transfer-demo/ui` for the real-evidence viewer

See each subfolder's README for the exact build command and output directory.
