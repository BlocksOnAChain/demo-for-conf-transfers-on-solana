import type { IntegrationNodeId } from './integrationNodes'

export type IntegrationEdgeStyle = 'action' | 'api' | 'settlement'

export interface IntegrationEdge {
  id: string
  from: IntegrationNodeId
  to: IntegrationNodeId
  style: IntegrationEdgeStyle
  label: string
}

export interface IntegrationStep {
  kind: 'integration'
  id: string
  phase: 'Integration'
  milestone: string
  title: string
  description: string
  edges: IntegrationEdge[]
  activeNodes: IntegrationNodeId[]
  notes: string[]
  showMilestoneTable?: boolean
}

export interface MilestoneRow {
  milestone: string
  focus: string
  outcome: string
  duration: string
}

export const MILESTONES: MilestoneRow[] = [
  {
    milestone: 'Milestone 0',
    focus: 'Business Design, Commercial Framework & RFP',
    outcome:
      'Strategy, product, operating model, commercial framework and RFP completed; anchor issuer and distributor confirmed as early adopters',
    duration: '5 months',
  },
  {
    milestone: 'Milestones 1 + 2',
    focus: 'AFBc-native fund extended to Solana, and Solana-native fund distributed via AFBc',
    outcome:
      'Full issuance and distribution lifecycle (subscription + redemption) for funds issued either direction, with a single unified off-chain aggregation registry',
    duration: '5 months, concurrent',
  },
  {
    milestone: 'Milestone 3',
    focus: 'First Live Issuance on Solana',
    outcome:
      'First real-world regulated investment fund issued on Solana via the AFBc–Asseto integration, with at least one live subscription or redemption confirmed on-chain',
    duration: '1 month',
  },
]

export const INTEGRATION_SCENARIO: IntegrationStep[] = [
  {
    kind: 'integration',
    id: 'int-overview',
    phase: 'Integration',
    milestone: 'Overview',
    title: 'A second track: the Asseto ↔ AFBc integration, already underway',
    description:
      "The other tabs sketch an illustrative privacy architecture. This one is different: ioBuilders has scoped the exact Asseto ↔ Allfunds Blockchain (AFBc) integration as a funded grant program — \"Harmonia\" — with a real, milestoned build plan. Three components: AFBc Platform (Allfunds' own fund registry and Dealing Market), Asseto Module (ioBuilders' Solana tokenization layer), and the Solana network itself.",
    edges: [],
    activeNodes: [],
    notes: [
      'AFBc: an institutional-grade permissioned ledger purpose-built for fund distribution — issuance, subscription, redemption and transfer, governed by smart contracts.',
      'Asseto: ioBuilders’ institutional tokenization platform on Solana — SPL token issuance, mint/burn, investor whitelisting, compliance controls.',
      'The two are connected by API, with AFBc able to act as the consolidated registry regardless of which network a fund actually settles on.',
    ],
  },
  {
    kind: 'integration',
    id: 'int-uc1-issue',
    phase: 'Integration',
    milestone: 'M1',
    title: 'Use Case 1 — a fund issued on AFBc, extended to Solana',
    description:
      'A Transfer Agent operating within AFBc issues a fund and selects Solana as an additional network. AFBc calls Asseto via API, which mints the corresponding SPL token on Solana mainnet — AFBc remains the primary registry.',
    edges: [
      { id: 'i1', from: 'fundManagerTA', to: 'afbcPlatform', style: 'action', label: 'Issue fund · select AFBc + Solana' },
      { id: 'i2', from: 'afbcPlatform', to: 'assetoModule', style: 'api', label: 'Issuance instruction (API)' },
      { id: 'i3', from: 'assetoModule', to: 'solanaNetwork', style: 'settlement', label: 'Create SPL Token' },
    ],
    activeNodes: ['fundManagerTA', 'afbcPlatform', 'assetoModule', 'solanaNetwork'],
    notes: [
      'The TA chooses networks at fund-creation time — AFBc only, Solana only, or both.',
      'Selecting Solana triggers an issuance instruction to Asseto via API.',
      'Asseto creates the SPL Token on-chain in response.',
    ],
  },
  {
    kind: 'integration',
    id: 'int-uc1-link',
    phase: 'Integration',
    milestone: 'M1',
    title: 'Token address linked back — one consolidated registry',
    description:
      "Asseto confirms the new token's address back to AFBc, which binds it to the fund's class record and initialises an off-chain aggregator — a single source of truth for activity across both networks going forward.",
    edges: [
      { id: 'i4', from: 'solanaNetwork', to: 'assetoModule', style: 'settlement', label: 'Token creation confirmed' },
      { id: 'i5', from: 'assetoModule', to: 'afbcPlatform', style: 'api', label: 'Confirm issuance · token address' },
    ],
    activeNodes: ['solanaNetwork', 'assetoModule', 'afbcPlatform'],
    notes: [
      'The SPL token address is bound to the fund’s class record inside AFBc.',
      'AFBc initialises the off-chain registry for this fund now that multi-network issuance is complete.',
      'From here, the fund is live and orderable on both networks.',
    ],
  },
  {
    kind: 'integration',
    id: 'int-uc1-distribute',
    phase: 'Integration',
    milestone: 'M1',
    title: 'Both distributor types can now subscribe or redeem',
    description:
      "An AFBc distributor subscribes entirely within AFBc's existing flow, unchanged. A Solana distributor subscribes directly from a wallet — Asseto mints on-chain and notifies AFBc, which updates the very same off-chain record either way.",
    edges: [
      { id: 'i6', from: 'afbcDistributor', to: 'afbcPlatform', style: 'action', label: 'Subscribe · Dealing Market' },
      { id: 'i7', from: 'solanaDistributor', to: 'assetoModule', style: 'action', label: 'Subscribe · Solana wallet' },
      { id: 'i8', from: 'assetoModule', to: 'solanaNetwork', style: 'settlement', label: 'Mint tokens' },
    ],
    activeNodes: ['afbcDistributor', 'afbcPlatform', 'solanaDistributor', 'assetoModule', 'solanaNetwork'],
    notes: [
      'AFBc-side subscription/redemption uses standard, unmodified AFBc logic.',
      'Solana-side orders are notified back to AFBc via API webhooks and recorded in the same registry.',
      'Redemption mirrors this exactly, in reverse (burn instead of mint).',
    ],
  },
  {
    kind: 'integration',
    id: 'int-uc2-issue',
    phase: 'Integration',
    milestone: 'M2',
    title: 'Use Case 2 — a fund issued natively on Solana, distributed via AFBc',
    description:
      'The reverse pattern: a fund manager issues directly on Solana through the Asseto Module — no contract is ever deployed on the AFBc network. Asseto simply informs AFBc, which registers the fund off-chain and lists it on the Dealing Market.',
    edges: [
      { id: 'i9', from: 'fundManagerTA', to: 'assetoModule', style: 'action', label: 'Issue directly on Solana' },
      { id: 'i10', from: 'assetoModule', to: 'solanaNetwork', style: 'settlement', label: 'Create SPL Token' },
      { id: 'i11', from: 'assetoModule', to: 'afbcPlatform', style: 'api', label: 'Inform AFBc (API) · off-chain only' },
    ],
    activeNodes: ['fundManagerTA', 'assetoModule', 'solanaNetwork', 'afbcPlatform'],
    notes: [
      'No smart contract is deployed on the AFBc network for this fund — registration is off-chain only.',
      'The fund becomes visible and orderable in AFBc’s Dealing Market immediately after registration.',
      'AFBc distributors get access to a Solana-native fund without needing a Solana wallet themselves.',
    ],
  },
  {
    kind: 'integration',
    id: 'int-uc2-redirect',
    phase: 'Integration',
    milestone: 'M2',
    title: "AFBc orders are redirected — AFBc never executes this fund's logic itself",
    description:
      "An AFBc distributor still orders through the familiar Dealing Market — but because this fund has no AFBc-side contract, AFBc validates the order and redirects the entire order to Asseto for on-chain execution, then simply records the confirmed result.",
    edges: [
      { id: 'i12', from: 'afbcDistributor', to: 'afbcPlatform', style: 'action', label: 'Subscribe · Dealing Market' },
      { id: 'i13', from: 'afbcPlatform', to: 'assetoModule', style: 'api', label: 'Redirect order (API)' },
      { id: 'i14', from: 'assetoModule', to: 'solanaNetwork', style: 'settlement', label: 'Mint tokens' },
    ],
    activeNodes: ['afbcDistributor', 'afbcPlatform', 'assetoModule', 'solanaNetwork'],
    notes: [
      'AFBc validates the order but does not execute any logic on its own network for this fund.',
      'Asseto executes the mint or burn on-chain and confirms back to AFBc.',
      'Solana distributors, meanwhile, order directly against Asseto — same as Use Case 1.',
    ],
  },
  {
    kind: 'integration',
    id: 'int-recap',
    phase: 'Integration',
    milestone: 'Recap',
    title: 'One off-chain registry, two issuance paths — already a funded program',
    description:
      "Whichever direction a fund is issued, AFBc's off-chain registry ends up with the same complete picture: transaction hashes, timestamps, amounts and distributor identifiers from both networks. This isn't hypothetical — ioBuilders scoped it as the \"Harmonia\" grant program, running across a six-month delivery timeline.",
    edges: [],
    activeNodes: [],
    showMilestoneTable: true,
    notes: [
      'Milestone 0 is the prerequisite: without confirmed fund types, an agreed settlement model and at least one anchor issuer and distributor, the technical build has nothing real to validate against.',
      'Milestones 1 and 2 run concurrently — they’re the same underlying architecture, used in each direction.',
      'Milestone 3 is the proof point: a real regulated fund, issued for real, with at least one live on-chain subscription or redemption.',
    ],
  },
]
