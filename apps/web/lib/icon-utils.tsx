"use client"

import * as LucideIcons from "lucide-react"
import { Award } from "lucide-react"

export function iconForBadge(iconName?: string, className = "h-4 w-4") {
  const Fallback = (LucideIcons as any)["Award"] || Award
  if (!iconName) return <Fallback className={className} />
  const Icon = (LucideIcons as any)[iconName]
  if (!Icon) return <Fallback className={className} />
  return <Icon className={className} />
}
