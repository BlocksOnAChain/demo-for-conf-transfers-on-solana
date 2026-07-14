export type IntegrationNodeId =
  | 'fundManagerTA'
  | 'afbcDistributor'
  | 'solanaDistributor'
  | 'afbcPlatform'
  | 'assetoModule'
  | 'afbcNetwork'
  | 'solanaNetwork'

export type IntegrationZone = 'actor' | 'afbc' | 'solana'

export interface IntegrationDiagramNode {
  id: IntegrationNodeId
  label: string
  sublabel: string
  x: number
  y: number
  zone: IntegrationZone
  icon: 'Landmark' | 'Building2' | 'Wallet' | 'Database' | 'ArrowRightLeft' | 'Lock' | 'Globe2'
}

export const INTEGRATION_NODES: Record<IntegrationNodeId, IntegrationDiagramNode> = {
  fundManagerTA: {
    id: 'fundManagerTA',
    label: 'Fund Manager / TA',
    sublabel: 'Issues the fund, on either network',
    x: 500,
    y: 68,
    zone: 'actor',
    icon: 'Landmark',
  },
  afbcDistributor: {
    id: 'afbcDistributor',
    label: 'AFBc Distributor',
    sublabel: 'Bank / wealth manager, AFBc-side',
    x: 175,
    y: 190,
    zone: 'actor',
    icon: 'Building2',
  },
  solanaDistributor: {
    id: 'solanaDistributor',
    label: 'Solana Distributor',
    sublabel: 'Wallet-based',
    x: 825,
    y: 190,
    zone: 'actor',
    icon: 'Wallet',
  },
  afbcPlatform: {
    id: 'afbcPlatform',
    label: 'AFBc Platform',
    sublabel: 'Dealing Market · fund registry · off-chain aggregation',
    x: 265,
    y: 345,
    zone: 'afbc',
    icon: 'Database',
  },
  assetoModule: {
    id: 'assetoModule',
    label: 'Asseto Module',
    sublabel: "ioBuilders' Solana tokenization layer · mint/burn · off-ramp",
    x: 735,
    y: 345,
    zone: 'solana',
    icon: 'ArrowRightLeft',
  },
  afbcNetwork: {
    id: 'afbcNetwork',
    label: 'AFBc Network',
    sublabel: 'Permissioned · smart contracts',
    x: 265,
    y: 505,
    zone: 'afbc',
    icon: 'Lock',
  },
  solanaNetwork: {
    id: 'solanaNetwork',
    label: 'Solana Network',
    sublabel: 'Public · SPL tokens · on-chain settlement',
    x: 735,
    y: 505,
    zone: 'solana',
    icon: 'Globe2',
  },
}
