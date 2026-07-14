import type { Address, MessagePartialSigner } from '@solana/kit';
import { deriveElGamalKeypairForOwnerMint, deriveAeKeyForOwnerMint } from '@solana-program/token-2022/confidential';
import { AeKey, ElGamalKeypair, ElGamalSecretKey } from '@solana/zk-sdk/bundler';

export type ConfidentialKeys = {
  elgamalKeypair: ElGamalKeypair;
  aesKey: AeKey;
};

/**
 * Deterministically derives an account's confidential-transfer keys from its
 * owner's signature, using @solana-program/token-2022's own (owner, mint)
 * derivation rather than reimplementing it -- the library's exported helpers
 * return raw bytes (meant for storage), so we reconstruct live WASM class
 * instances from them since that's what the confidential instruction-plan
 * helpers require as input.
 */
export async function deriveConfidentialKeys(
  signer: MessagePartialSigner,
  owner: Address,
  mint: Address,
): Promise<ConfidentialKeys> {
  const { secretKey } = await deriveElGamalKeypairForOwnerMint({ signer, owner, mint });
  const elgamalSecretKey = ElGamalSecretKey.fromBytes(secretKey);
  const elgamalKeypair = ElGamalKeypair.fromSecretKey(elgamalSecretKey);

  const aesKeyBytes = await deriveAeKeyForOwnerMint({ signer, owner, mint });
  const aesKey = AeKey.fromBytes(aesKeyBytes);

  return { elgamalKeypair, aesKey };
}
