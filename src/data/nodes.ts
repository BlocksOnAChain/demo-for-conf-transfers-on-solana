export type NodeId =
  | 'public'
  | 'regulator'
  | 'bankAlfa'
  | 'allfunds'
  | 'fund'
  | 'bankMeridian'
  | 'escrow'
  | 'mintAlfa'
  | 'mintMeridian'

export type Zone = 'outside' | 'channel' | 'mainnet'

export interface DiagramNode {
  id: NodeId
  label: string
  sublabel: string
  x: number
  y: number
  zone: Zone
  icon: 'EyeOff' | 'ShieldCheck' | 'Building2' | 'Network' | 'Landmark' | 'Lock' | 'Wallet'
}

export const NODES: Record<NodeId, DiagramNode> = {
  public: {
    id: 'public',
    label: 'Public',
    sublabel: 'Competitors watching mainnet',
    x: 130,
    y: 55,
    zone: 'outside',
    icon: 'EyeOff',
  },
  regulator: {
    id: 'regulator',
    label: 'Regulator',
    sublabel: 'CNMV · ESMA · FCA',
    x: 870,
    y: 55,
    zone: 'outside',
    icon: 'ShieldCheck',
  },
  bankAlfa: {
    id: 'bankAlfa',
    label: 'Banco Alfa',
    sublabel: 'Wealth manager · subscribing',
    x: 175,
    y: 232,
    zone: 'channel',
    icon: 'Building2',
  },
  allfunds: {
    id: 'allfunds',
    label: 'Allfunds',
    sublabel: 'Channel operator',
    x: 500,
    y: 158,
    zone: 'channel',
    icon: 'Network',
  },
  fund: {
    id: 'fund',
    label: 'Atlas Global Fund',
    sublabel: 'Fund manager / transfer agent',
    x: 500,
    y: 305,
    zone: 'channel',
    icon: 'Landmark',
  },
  bankMeridian: {
    id: 'bankMeridian',
    label: 'Banca Meridian',
    sublabel: 'Wealth manager · redeeming',
    x: 825,
    y: 232,
    zone: 'channel',
    icon: 'Building2',
  },
  escrow: {
    id: 'escrow',
    label: 'Channel Escrow',
    sublabel: 'USDC · mainnet, always withdrawable',
    x: 500,
    y: 448,
    zone: 'mainnet',
    icon: 'Lock',
  },
  mintAlfa: {
    id: 'mintAlfa',
    label: 'Banco Alfa',
    sublabel: 'Confidential Token-2022 account',
    x: 235,
    y: 548,
    zone: 'mainnet',
    icon: 'Wallet',
  },
  mintMeridian: {
    id: 'mintMeridian',
    label: 'Banca Meridian',
    sublabel: 'Confidential Token-2022 account',
    x: 765,
    y: 548,
    zone: 'mainnet',
    icon: 'Wallet',
  },
}
