import { Landmark, Building2, Wallet, Database, ArrowRightLeft, Lock, Globe2, type LucideIcon } from 'lucide-react'
import type { IntegrationDiagramNode } from '../data/integrationNodes'

export const INTEGRATION_ICON_MAP: Record<IntegrationDiagramNode['icon'], LucideIcon> = {
  Landmark,
  Building2,
  Wallet,
  Database,
  ArrowRightLeft,
  Lock,
  Globe2,
}
