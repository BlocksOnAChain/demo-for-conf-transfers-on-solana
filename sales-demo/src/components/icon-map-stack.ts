import { Lock, Network, type LucideIcon } from 'lucide-react'
import type { StackLayer } from '../data/stack'

export const STACK_ICON_MAP: Record<StackLayer['icon'], LucideIcon> = {
  Lock,
  Network,
}
