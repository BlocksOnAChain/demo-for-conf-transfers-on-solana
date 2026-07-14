export interface WalletEvidence {
  owner: string
  explorer: string
  tokenAccount: string
  tokenAccountExplorer: string
  elgamalPubkey: string
  finalDecryptedBalance: string
  finalDecryptedBalanceDisplay: string
  rawEncryptedAvailableBalanceBase64: string
}

export interface DevnetRunEvidence {
  network: string
  generatedAt: string
  decimals: number
  mint: {
    address: string
    explorer: string
    authority: string
    auditorElgamalPubkey: string
  }
  wallets: {
    bancoAlfa: WalletEvidence
    bancaMeridian: WalletEvidence
  }
  transfer: {
    amount: string
    amountDisplay: string
    signature: string
    explorer: string
    auditorDecryptedAmount: string
    auditorDecryptedAmountDisplay: string
  }
  transactions: Record<string, string[]>
}
