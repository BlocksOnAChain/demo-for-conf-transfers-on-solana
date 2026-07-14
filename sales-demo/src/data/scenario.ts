import type { NodeId } from './nodes'

export type EdgeStyle = 'public' | 'private' | 'settlement'

export interface DiagramEdge {
  id: string
  from: NodeId
  to: NodeId
  style: EdgeStyle
  label: string
  amount: string
}

export interface Visibility {
  public: string[]
  channel: string[]
  regulator: string[]
}

export interface ComparisonRow {
  dimension: string
  public: string
  channel: string
  regulator: string
}

export interface ScenarioStep {
  id: string
  phase: 'Subscription' | 'Confidential settlement' | 'Redemption' | 'Recap'
  title: string
  description: string
  edges: DiagramEdge[]
  activeNodes: NodeId[]
  visibility: Visibility
  showToggle?: boolean
  showSummary?: boolean
}

export const COMPARISON_ROWS: ComparisonRow[] = [
  {
    dimension: 'A position in the fund exists',
    public: 'Yes — account is visible',
    channel: 'Yes',
    regulator: 'Yes',
  },
  {
    dimension: 'Counterparty identity',
    public: 'No',
    channel: 'Yes, within the trade',
    regulator: "No — governed by Allfunds' KYC gate, not the auditor key",
  },
  {
    dimension: 'Which fund / product',
    public: 'No',
    channel: 'Yes',
    regulator: 'Only if requested from Allfunds as channel operator',
  },
  {
    dimension: 'Position size / balance',
    public: 'No — ElGamal ciphertext',
    channel: 'Yes',
    regulator: 'Yes — decrypts on demand with the auditor key',
  },
  {
    dimension: 'Timing of trades',
    public: 'Only escrow deposits & withdrawals',
    channel: 'Yes, real time',
    regulator: 'Only escrow deposits & withdrawals',
  },
]

export const SCENARIO: ScenarioStep[] = [
  {
    id: 'overview',
    phase: 'Subscription',
    title: "Allfunds' distribution network, translated onto Solana",
    description:
      'Allfunds already runs a permissioned B2B network of roughly 900 distributors, banks and fund houses. This is that network on-chain: a private channel Allfunds operates for settlement, with direct access to Solana mainnet liquidity and confidential balances at the token layer.',
    edges: [],
    activeNodes: [],
    visibility: {
      public: ['No activity to observe yet.'],
      channel: ['Banco Alfa, Banca Meridian and Atlas Global Fund are connected members of the channel.'],
      regulator: ['Holds standing auditor keys for every confidential mint it supervises.'],
    },
  },
  {
    id: 'deposit',
    phase: 'Subscription',
    title: '1. Banco Alfa funds the channel',
    description:
      "Banco Alfa locks 2,000,000 USDC into the channel's mainnet escrow — an ordinary, public on-chain transfer. This is the only step in the whole flow where an outside observer sees a real amount.",
    edges: [
      { id: 'e1', from: 'bankAlfa', to: 'escrow', style: 'public', label: 'Deposit', amount: '2,000,000 USDC' },
    ],
    activeNodes: ['bankAlfa', 'escrow'],
    visibility: {
      public: ['Sees: Banco Alfa → Channel Escrow, 2,000,000 USDC.', 'The one moment in this flow with a visible amount.'],
      channel: ['Same deposit — recognized as collateral for upcoming subscription activity.'],
      regulator: ['Sees the same public on-chain transfer as everyone else.'],
    },
  },
  {
    id: 'credit',
    phase: 'Subscription',
    title: '2. Channel credit issued',
    description:
      "Inside the channel, Banco Alfa is credited 2,000,000 against its escrowed collateral. This ledger update is internal to the channel — no public mempool, no on-chain footprint, ~100ms settlement batch, zero per-transaction fee.",
    edges: [
      { id: 'e2', from: 'escrow', to: 'bankAlfa', style: 'private', label: 'Channel credit', amount: '2,000,000' },
    ],
    activeNodes: ['escrow', 'bankAlfa'],
    visibility: {
      public: ['Nothing new — this is an off-chain, channel-internal ledger update.'],
      channel: ["Members see Banco Alfa's channel balance: 2,000,000."],
      regulator: ["No visibility — channel-internal balances aren't published on mainnet."],
    },
  },
  {
    id: 'subscribe',
    phase: 'Subscription',
    title: '3. Subscription order, entirely inside the channel',
    description:
      'Banco Alfa subscribes its client into the Atlas Global Fund. Counterparty, fund identity and order size all stay channel-private — this is exactly the layer that hides who is buying what.',
    edges: [
      { id: 'e3', from: 'bankAlfa', to: 'fund', style: 'private', label: 'Subscribe', amount: 'Atlas Global Fund · 2,000,000' },
    ],
    activeNodes: ['bankAlfa', 'fund'],
    visibility: {
      public: ['Nothing. There is no public mempool inside the channel.'],
      channel: ['Members with visibility into this trade see the counterparty and the fund.'],
      regulator: ["Still nothing — order flow is governed by Allfunds' own compliance/KYC gate as operator, not by the auditor key."],
    },
  },
  {
    id: 'settle',
    phase: 'Confidential settlement',
    title: '4. Settlement mints straight into a confidential balance',
    description:
      "The channel settles: fund shares mint directly into Banco Alfa's Token-2022 account on Solana mainnet, with the ConfidentialTransferMint extension enabled. The account and the transfer are public. The amount is not.",
    edges: [
      { id: 'e4', from: 'fund', to: 'mintAlfa', style: 'settlement', label: 'Mint shares', amount: 'Confidential balance' },
    ],
    activeNodes: ['fund', 'mintAlfa'],
    visibility: {
      public: ['Sees a token account exist and receive a transfer.', 'Balance is ElGamal-encrypted ciphertext — unreadable without a decryption key.'],
      channel: ['Knows the real economics — they were counterparty to the order.'],
      regulator: ['Holds the auditor key for this mint and can decrypt the balance on demand.'],
    },
  },
  {
    id: 'toggle',
    phase: 'Confidential settlement',
    title: '5. Same account, two views',
    description:
      "Toggle between what a public block explorer shows and what the regulator sees after applying the auditor key. Nothing about the on-chain data changes between the two views — only who is allowed to decrypt it.",
    edges: [],
    activeNodes: ['mintAlfa'],
    showToggle: true,
    visibility: {
      public: ['Account exists. Balance field is ciphertext.'],
      channel: ['Knows the underlying position from having traded it.'],
      regulator: ['Applies its auditor key to this mint and reads the real balance.'],
    },
  },
  {
    id: 'redeemOrder',
    phase: 'Redemption',
    title: '6. Banca Meridian redeems, inside the channel',
    description:
      "Banca Meridian instructs a redemption. The burn order for the channel-side shares routes to Atlas Global Fund entirely inside the channel — invisible outside it, just like the original subscription.",
    edges: [
      { id: 'e5', from: 'bankMeridian', to: 'fund', style: 'private', label: 'Redeem', amount: 'Burn channel shares' },
    ],
    activeNodes: ['bankMeridian', 'fund'],
    visibility: {
      public: ['Nothing.'],
      channel: ['Members see the redemption order and the fund involved.'],
      regulator: ['No visibility into the in-channel burn instruction.'],
    },
  },
  {
    id: 'redeemCash',
    phase: 'Redemption',
    title: '7. Cash released on mainnet',
    description:
      "The corresponding cash leaves the channel's escrow straight to Banca Meridian on Solana mainnet — the one part of the redemption an outside observer ever sees, and assets are always withdrawable this way.",
    edges: [
      { id: 'e6', from: 'escrow', to: 'bankMeridian', style: 'public', label: 'Release', amount: 'USDC' },
    ],
    activeNodes: ['escrow', 'bankMeridian'],
    visibility: {
      public: ['Sees: Channel Escrow → Banca Meridian, USDC.'],
      channel: ['Same transfer, already understood as the settlement of the redemption order.'],
      regulator: ['Sees the same public on-chain transfer as everyone else.'],
    },
  },
  {
    id: 'summary',
    phase: 'Recap',
    title: '8. Who actually sees what',
    description:
      'Across the full subscription-to-redemption lifecycle, this is the real visibility each party has — and why Allfunds needs both layers, not one or the other.',
    edges: [],
    activeNodes: [],
    showSummary: true,
    visibility: {
      public: ['Escrow deposits/withdrawals and encrypted account balances only.'],
      channel: ['Full order flow, counterparties, funds and amounts — under Allfunds-defined membership rules.'],
      regulator: ['Full decryption rights over confidential balances via the auditor key, on demand.'],
    },
  },
]
