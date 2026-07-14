# Allfunds x Solana — Confidential Transfer Technical Deep-Dive

A **real** Solana devnet build (not a simulation, not mocked data) demonstrating Token-2022
Confidential Balances end to end: mint creation, wallet/key structure, minting, deposit,
a real confidential transfer between two wallets, and an auditor independently decrypting
the transfer amount from on-chain data alone.

This is a companion to, and deliberately kept in its own repo separate from, the
`allfunds-demo` private-channels sales demo — that one is an illustrative/mocked
walkthrough of the private-channel + confidential-balances architecture for a business
audience. This repo is the technical proof: real keys, a real mint, a real transfer,
verifiable independently on Solana's devnet explorer.

## What's here

- [`scripts/build-devnet-demo.ts`](scripts/build-devnet-demo.ts) — the real devnet build.
  Creates a Token-2022 mint with the `ConfidentialTransferMint` extension and an auditor
  ElGamal key, configures confidential accounts for two wallets ("Banco Alfa" and "Banca
  Meridian" — same names as the sales demo, for continuity), mints, deposits, executes a
  real confidential transfer, decrypts both parties' balances to verify correctness, and
  finally decrypts the transfer amount as the auditor using only on-chain data.
- [`evidence/devnet-run.json`](evidence/devnet-run.json) — the captured output of the most
  recent real run: real addresses, real transaction signatures, real (encrypted) balances.
- [`docs/PRIVACY-GROUPS.md`](docs/PRIVACY-GROUPS.md) — how Allfunds' existing Hyperledger
  Besu privacy groups map onto Solana's model (private channels + confidential balances).
- [`docs/KEYS-AND-ENCRYPTION.md`](docs/KEYS-AND-ENCRYPTION.md) — wallet structure, key
  derivation, minting flow, and the encryption scheme, all grounded in the real run above.
- [`ui/`](ui/) — a small companion app that visualizes the captured evidence.

## Running it yourself

Requires Node >= 24 (the ZK proof WASM package needs it) and a little devnet SOL.

```bash
nvm install 24 && nvm use 24
npm install
npm run build-devnet-demo
```

The script funds itself: it tries the public devnet faucet first, and if that's
rate-limited (common), it falls back to transferring a small amount from your local
`~/.config/solana/id.json` CLI keypair, if you have one with a devnet balance. Wallet
keypairs it generates are persisted under `evidence/keypairs/` (gitignored) so a failed
run's funding isn't wasted on retry.

Every transaction signature it produces links to `explorer.solana.com?cluster=devnet` —
click through and check the raw instruction data yourself; nothing here asks you to take
its word for it.

## Deploying the UI

The `evidence/devnet-run.json` in this repo is already-captured real data, so you don't
need Node 24 or devnet SOL just to *view* the demo — only to regenerate fresh evidence.
See [`ui/README.md`](ui/README.md) for exact deploy steps (Vercel/Netlify, static, no
secrets, no environment variables). Short version: point your host at this repo with
`ui` as the root/subdirectory and build command `npm run build`.

## Related repo

[`allfunds-demo`](https://github.com/BlocksOnAChain/allfunds-demo) — the mocked/illustrative
sales walkthrough this build is a technical companion to.

## Why a separate repo

The private-channels sales demo intentionally uses mocked/simulated data — it's built to
run instantly in a browser for a live pitch, and private channels themselves are a
pre-audit reference implementation with no public devnet deployment to point at. This
repo is the opposite tradeoff: it's slower to run and requires devnet SOL, but every
number in it is real, because Token-2022 Confidential Balances **is** live on devnet
(and mainnet) today. Keeping them in separate repos avoids implying the private-channel
walkthrough is backed by the same kind of on-chain proof this one provides.
