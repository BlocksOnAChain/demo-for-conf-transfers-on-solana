# Privacy groups (Besu) vs. Solana's privacy stack

Allfunds' existing blockchain runs on Hyperledger Besu with a custom privacy plugin. This
document maps that model onto Solana's, so the comparison in the technical walkthrough
isn't just "Solana has privacy too" hand-waving.

## How Allfunds' privacy groups work today

- The network is a private Hyperledger Besu deployment. Each node has two components:
  - **Servo node** — where the Allfunds product/API layer is deployed.
  - **Arrow node** — a Besu (Ethereum-compatible) client running Allfunds' own privacy plugin.
- **Privacy groups** are sets of participants who share private transactions. Only members
  of a group can see that transaction's details and the resulting smart-contract state.
  Non-members (including other nodes on the same network) see nothing — not even that a
  private transaction happened, beyond a privacy-marker transaction on the public ledger
  that carries no readable content.
- This was originally a Hyperledger-native feature (Orion/Tessera-style private transaction
  managers); Allfunds built its own plugin after Hyperledger discontinued the built-in one.
- ~900 distributors connect to the network via Allfunds Bank as the fund platform. An API
  layer abstracts the chain away from clients, who interact through callbacks into their own
  legacy systems rather than touching the ledger directly.
- The design deliberately **augments** existing transfer-agent and fund-manager workflows
  rather than replacing them.

The key property: a Besu privacy group is **all-or-nothing**. If you're not a member, the
transaction and the state it produces are invisible to you, full stop. There's no
in-between where an outsider can see *that* a position exists but not *how much*.

## Solana has no direct equivalent — and that's the point

Solana's ledger is public by default: every account and every transaction is visible to
every validator and every observer. There is no privacy-group primitive at the protocol
level. Instead, Solana composes **two independent, narrower mechanisms** that together
cover the same ground a privacy group covers — and then some:

| | **Besu privacy group** | **Solana private channel** (Layer 2) | **Solana Confidential Balances** (Layer 1) |
|---|---|---|---|
| What's hidden | Everything: existence, parties, contract state, amounts | Order flow, counterparties, which fund/product | Only the balance/amount |
| What's still visible | A privacy-marker tx on the public chain, no content | Escrow deposits/withdrawals on mainnet (the channel boundary) | The account exists and received a transfer |
| Mechanism | Private transaction manager distributes encrypted payloads only to group members; group members execute and store the private state locally | Off-chain-batched channel operated by Allfunds; members see the ledger, outsiders see nothing (no public mempool inside) | Token-2022 extension: ElGamal + Pedersen encrypt the balance on the public ledger itself |
| Auditor/regulator access | Whatever access the group grants a member added to the group | Whatever Allfunds (as operator) grants via membership/KYC gating | A designated auditor ElGamal key decrypts the amount on demand — cryptographic, not access-grant-based |
| Granularity | All-or-nothing per group | All-or-nothing per channel membership | Per-mint, independent of channel membership |
| Composability | Membership is the only lever | Combine with confidential balances for defense in depth | Combine with a private channel to also hide counterparties |

## Why this matters for Allfunds specifically

A Besu privacy group and a Solana private channel solve the same problem — restricting who
sees order flow and counterparties — with a similar trust model (Allfunds, as operator or
group admin, controls membership). That part of the migration is close to 1:1.

What Solana adds that Besu's privacy groups don't give you on their own is **Confidential
Balances at the settlement layer**: even *after* a position settles onto the base ledger
(public, permissionless, composable with the rest of Solana DeFi), the balance itself stays
encrypted. A Besu privacy group can't do this — once you're a member, you see the balance
in full; once you're not, you see nothing about the transaction at all. Solana lets Allfunds
decouple those two questions: *is this settled on a public, composable ledger* and *can an
outside observer read the amount* are answered independently, with the auditor key
providing regulator access that doesn't depend on channel membership at all.

The real devnet run in this repository demonstrates exactly that last part: the sales demo's
"Live flow" tab (separate `allfunds-demo` repo) illustrates the private-channel side (order
flow hidden from non-members); this repo's
[`scripts/build-devnet-demo.ts`](../scripts/build-devnet-demo.ts) proves the confidential-balance
side with real keys, a real mint, and a real transfer on
Solana devnet — see [`evidence/devnet-run.json`](../evidence/devnet-run.json) for the actual
addresses and transaction signatures.
