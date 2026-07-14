// Copies ONLY the public evidence file (addresses, tx signatures, ciphertext
// blobs -- no secrets) into src/data so Vite can import it as a static asset.
// Deliberately does not expose the parent evidence/ directory (which also
// contains evidence/keypairs/, holding raw devnet secret keys) to the dev
// server in any way.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const source = join(__dirname, '..', '..', 'evidence', 'devnet-run.json');
const destDir = join(__dirname, '..', 'src', 'data');
const dest = join(destDir, 'devnet-run.json');

mkdirSync(destDir, { recursive: true });
try {
  copyFileSync(source, dest);
  console.log(`Copied ${source} -> ${dest}`);
} catch (error) {
  console.error(
    `Could not find ${source}. Run "npm run build-devnet-demo" from the repo root first to generate real evidence.`,
  );
  process.exit(1);
}
