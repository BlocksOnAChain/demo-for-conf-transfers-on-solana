# Wallet structure, minting, keys, and encryption — from a real run

Everything below references the actual devnet run captured in
[`evidence/devnet-run.json`](../evidence/devnet-run.json) and reproducible by running
[`scripts/build-devnet-demo.ts`](../scripts/build-devnet-demo.ts) (`npm run build-devnet-demo`,
requires Node >= 24). No numbers here are invented — they're the real output of a real
Solana devnet transaction. Click any explorer link to check it independently.

## 1. Wallet structure

Each participant is an ordinary Solana Ed25519 keypair — nothing confidential-transfer-specific
about the wallet itself:

- **Banco Alfa**: `57nf34moAeaPuAq9o7PaKafmsSWi2iHaSJr1fe78iTKd`
- **Banca Meridian**: `BAd55S3P8ycpbBFWdVuxqENF9df7XcAsjhomaf9hZ7uA`

What makes a wallet capable of confidential transfers is a **Token-2022 account** it owns for a
specific mint — an ordinary associated token account (ATA), but with the `ConfidentialTransferAccount`
extension enabled on it:

- Banco Alfa's confidential account for this mint: `FehLWG9q8QXhWDAndotkLtR3H6RHbasDLNSms4dxVpdE`
- Banca Meridian's confidential account for this mint: `A2C3BCP17wJAHcMiGAKnGVNJCzKrgwmvuxmZVGTcHT4r`

A wallet has one such account **per mint** — the same wallet can hold a fully public balance in
one token and a confidential balance in another, and its confidential accounts across different
mints use independently-derived keys (see §3).

## 2. Token minting

The mint itself — `7juBfAHhSgj45FY8SRJ4m3QyPqEytT3fma94SMoHL9z9` — is a standard Token-2022 mint
with the `ConfidentialTransferMint` extension attached at creation:

```
extension('ConfidentialTransferMint', {
  authority: some(mintAuthority),        // can update extension config
  autoApproveNewAccounts: true,          // no manual approval step per new account
  auditorElgamalPubkey: some(auditorPubkey),
})
```

`decimals = 2` for this run, so all amounts below are in base units (divide by 100 for display —
the evidence file gives both). 4,000,000 base units (40,000.00 tokens) were minted to Banco
Alfa in a completely ordinary, public `MintTo` instruction — minting itself is not confidential;
only what happens to the balance afterward is. From there:

1. **Deposit** — Banco Alfa moves her plaintext balance into the account's *pending* encrypted
   balance (`ConfidentialDeposit`). The amount is still visible in this instruction's data; this
   is the one deliberate crossover point between the public and confidential worlds.
2. **Apply pending balance** — the pending balance is merged into the *available* encrypted
   balance (`ApplyPendingBalance`). From here on, the balance field on her account is ciphertext.
3. **Transfer** — a real `ConfidentialTransfer` instruction moves 1,500,000 base units
   (15,000.00) from Banco Alfa to Banca Meridian without either amount, or the resulting
   balances, ever appearing in plaintext on-chain. Transaction:
   [`2QBeKnV...`](https://explorer.solana.com/tx/2QBeKnVXGT6eEiS9Zszi72afbT7o7g7ADgshVMj4Py5wthhYMHUJY6K2FWgRAoEDTMgajQhYwdbb9yBDPef9qCZv?cluster=devnet)

## 3. Keys

Three distinct key types are in play, and it's worth being precise about which is which:

| Key | Who holds it | Purpose | How it's obtained |
|---|---|---|---|
| Ed25519 wallet key | Each participant | Sign transactions, prove ownership | Standard Solana keypair |
| ElGamal keypair | Each confidential account owner | Encrypt/decrypt that account's own balance | **Deterministically derived** from the owner's Ed25519 signature over a fixed message — not a separate secret to back up |
| AES key | Each confidential account owner | Fast symmetric decryption of their own balance (an optimization layered on top of the ElGamal ciphertext) | Same derivation pattern as the ElGamal keypair |
| Auditor ElGamal keypair | The mint's designated auditor (e.g. a regulator) | Decrypt the *amount of any confidential transfer* on that mint | Independently generated — **not** tied to any wallet; in this run it's a standalone keypair, since a regulator doesn't need a Solana wallet to hold auditor rights |

The owner's ElGamal keypair and AES key are derived via
`@solana-program/token-2022`'s own key-derivation helpers
(`deriveElGamalKeypairForOwnerMint` / `deriveAeKeyForOwnerMint`): the owner signs a
domain-separated message seeded by `(owner address, mint address)`, and that Ed25519
signature is fed into the ZK SDK to produce the ElGamal/AES keys. Two consequences follow:

- **No extra key to custody.** Anyone who can sign as the wallet owner can always
  re-derive the same confidential-transfer keys — there's no separate secret to lose.
- **Per-(owner, mint) isolation.** The same wallet gets different confidential keys for
  different mints, so a compromise of one mint's confidential keys doesn't cascade to another.

Banco Alfa's derived ElGamal public key for this mint: `88ysCdyxkqKMLTWWc3z9ttV65skySstgNdXBPiwdGbDL`
— note this is a public key; it's safe to be visible on-chain (it is, as part of her account's
`ConfidentialTransferAccount` extension data) and is what lets others encrypt *to* her account.

## 4. Encryption

Two complementary schemes are layered together:

- **ElGamal encryption** (over the same elliptic curve Solana uses for its base
  cryptography) encrypts the account balance and transfer amounts homomorphically —
  the network can verify balance arithmetic (does this transfer keep the balance
  non-negative? does the sum still add up?) via zero-knowledge proofs *without ever
  decrypting anything*.
- **Pedersen commitments** back the zero-knowledge range proofs that accompany every
  transfer, proving the transferred and remaining amounts are valid (non-negative,
  within range) without revealing them.
- A transfer amount is actually encrypted **three times** under three different public
  keys in the same instruction — the sender's, the recipient's, and the mint's designated
  auditor's — using a "grouped ciphertext" construction. All three encrypt the *same*
  underlying value; each party can only decrypt with their own secret key.

This is what makes the auditor capability real rather than a side-channel: the auditor's
ciphertext is part of the same on-chain `ConfidentialTransfer` instruction everyone else
sees, not a separate disclosure sent out-of-band.

**Proof, not assertion**: in this run, the auditor's decrypted amount was obtained by
fetching the raw transaction `2QBeKnV...` from chain, decoding its `ConfidentialTransfer`
instruction data, extracting the auditor-ciphertext field, and decrypting it with
*only* the auditor's ElGamal secret key:

```
Auditor independently decrypted transfer amount: 1500000   (matches 15,000.00 exactly)
```

Meanwhile, the raw balance field on each account — visible to anyone via
`getAccountInfo` or a block explorer — is opaque ciphertext, e.g. Banco Alfa's final
available balance field (base64): `2An/sArSWaNnW/08RJL1iuVoeCT/NpwXAGMhsrgCYBdwgJMnqJu6Dhot2Dvb8/yJxyu6pOUoyTy6P6jhj4iPVw==`.
Feed that same on-chain data to Banco Alfa's own AES key and it decrypts to `2500000` (25,000.00);
feed it to anyone else's key and it decrypts to nothing meaningful.
