import { existsSync, readFileSync } from 'node:fs';
import { createKeyPairSignerFromBytes, generateKeyPairSigner, writeKeyPairSigner, type KeyPairSigner } from '@solana/kit';

/**
 * Loads a persisted devnet keypair if one exists at `path`, otherwise
 * generates a new one and persists it. Keeps wallet addresses stable across
 * re-runs so a failed run doesn't burn a fresh devnet airdrop every retry.
 */
export async function loadOrCreateSigner(path: string): Promise<KeyPairSigner> {
  if (existsSync(path)) {
    const secretKey = new Uint8Array(JSON.parse(readFileSync(path, 'utf8')));
    return createKeyPairSignerFromBytes(secretKey);
  }

  const signer = await generateKeyPairSigner(true);
  await writeKeyPairSigner(signer, path);
  return signer;
}
