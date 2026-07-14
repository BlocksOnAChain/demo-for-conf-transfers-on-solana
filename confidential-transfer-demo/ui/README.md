# Confidential Transfer Demo — UI

**Live: [ui-seven-mocha.vercel.app](https://ui-seven-mocha.vercel.app)**

Companion visualization for the real Solana devnet run captured in
[`../evidence/devnet-run.json`](../evidence/devnet-run.json) — see the
[parent README](../README.md) for the full picture (what was built, how the devnet
run works, why this is a separate subfolder from the mocked sales demo).

This app is a **static site with no backend and no live devnet calls**. It reads the
already-captured evidence JSON (mint address, wallet addresses, ElGamal pubkeys,
encrypted/decrypted balances, transaction signatures) and renders it across three tabs:
Overview, Keys & Encryption, and Privacy Groups. The only network requests it makes are
the "view on explorer" links, which open `explorer.solana.com` in a new tab if clicked.

## Running locally

```bash
npm install
npm run dev
```

The `predev`/`prebuild` scripts (`scripts/copy-evidence.mjs`) copy the public evidence
file from `../evidence/devnet-run.json` into `src/data/devnet-run.json` automatically —
you don't need to do this by hand, and it deliberately never touches `../evidence/keypairs/`
(which holds real devnet secret keys and is gitignored at the repo root).

## Deploying

Pure static output, no environment variables or secrets required:

```bash
npm run build   # runs copy-evidence, then tsc -b && vite build -> dist/
```

**If deploying on Vercel/Netlify/etc., set the project's Root Directory to
`confidential-transfer-demo/ui`** (this app lives two levels down from the actual repo
root), and keep the build command as `npm run build` with output directory `dist`. The
evidence-copy step tries `../evidence/devnet-run.json` (i.e.
`confidential-transfer-demo/evidence/devnet-run.json`) first and falls back to the
already-committed `src/data/devnet-run.json` in this folder if that's not reachable — so
it builds correctly either way, whether your host checks out the full repo or only this
subdirectory.

Want fresh on-chain evidence instead of the captured run in this repo? Run
`npm run build-devnet-demo` from `confidential-transfer-demo/` first (needs Node ≥ 24 and
a little devnet SOL) — it overwrites `evidence/devnet-run.json`, and the next `npm run
dev`/`build` in here will pick it up automatically.
