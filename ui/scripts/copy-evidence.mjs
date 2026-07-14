// Keeps src/data/devnet-run.json (a public-evidence-only file -- addresses, tx
// signatures, ciphertext blobs, no secrets) in sync with the real source of
// truth at ../evidence/devnet-run.json when both are present (local monorepo
// dev/build).
//
// When only this checked-out `ui/` directory is available -- e.g. a Vercel
// deployment scoped to this subdirectory, or someone downloading just this
// folder -- the parent `evidence/` directory won't exist. In that case
// src/data/devnet-run.json is itself a committed, tracked fallback copy, so
// the app still builds correctly; this script just leaves it alone rather
// than failing the build.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, '..', '..', 'evidence', 'devnet-run.json');
const destDir = join(__dirname, '..', 'src', 'data');
const dest = join(destDir, 'devnet-run.json');

if (existsSync(source)) {
  mkdirSync(destDir, { recursive: true });
  copyFileSync(source, dest);
  console.log(`Copied ${source} -> ${dest}`);
} else if (existsSync(dest)) {
  console.log(`${source} not present (standalone ui/ checkout) -- using committed ${dest} as-is.`);
} else {
  console.error(
    `Neither ${source} nor ${dest} exist. Run "npm run build-devnet-demo" from the repo root first to generate real evidence.`,
  );
  process.exit(1);
}
