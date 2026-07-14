export interface StackLayer {
  id: 'token' | 'channel'
  layerNumber: number
  name: string
  tagline: string
  bullets: string[]
  status: string
  recommended: boolean
  icon: 'Lock' | 'Network'
}

export const STACK_LAYERS: StackLayer[] = [
  {
    id: 'token',
    layerNumber: 1,
    name: 'Confidential Balances / Confidential Transfers',
    tagline: 'Token-2022 extension',
    bullets: [
      'Encrypts amounts and balances on-chain: ElGamal + Pedersen commitments + ZK range proofs.',
      'Auditor key lets regulators decrypt without breaking privacy for the public.',
      'Live on mainnet today. Franklin Templeton and Spiko already use similar patterns.',
      'Composable with the other Token-2022 extensions Allfunds would want: freeze, permanent delegate, transfer hooks, metadata.',
    ],
    status: 'Live on mainnet',
    recommended: true,
    icon: 'Lock',
  },
  {
    id: 'channel',
    layerNumber: 2,
    name: 'Private Channels (Contra / Solana Private Channels)',
    tagline: 'Permissioned batching layer, direct mainnet access',
    bullets: [
      'Operators — Allfunds, plus participating banks and fund managers — control who joins, what rules apply, what is visible.',
      'No public mempool inside the channel. 100ms settlement batches. Zero per-transaction fees inside.',
      'Assets are locked in a mainnet escrow and are always withdrawable to mainnet.',
      'Reference implementation exists and is open source — audit and productization are ongoing.',
    ],
    status: 'Reference impl live, audit pending',
    recommended: true,
    icon: 'Network',
  },
]
