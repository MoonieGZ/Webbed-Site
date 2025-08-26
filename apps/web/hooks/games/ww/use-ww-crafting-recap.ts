"use client"

import { useCallback } from "react"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

export type CraftStep = {
  type: string
  fromName: string
  toName: string
  qty: number
  inputQty: number
}

export function useWwCraftingRecap() {
  const { groupsByType, counts, increment } = useWwInventory()

  const findMaterialId = useCallback(
    (type: string, name: string): number | null => {
      const groups = groupsByType[type] || []
      for (const g of groups) {
        const mm = g.materials.find((m) => m.name === name)
        if (mm) return Number(mm.id)
      }
      return null
    },
    [groupsByType],
  )

  const applyCraftStep = useCallback(
    (step: CraftStep): boolean => {
      const fromId = findMaterialId(step.type, step.fromName)
      const toId = findMaterialId(step.type, step.toName)
      if (fromId == null || toId == null) {
        toast("Unable to apply craft: material not found", toastStyles.error)
        return false
      }

      const availableLower = (counts as Record<number, number>)[fromId] || 0
      const possible = Math.floor(availableLower / 3)
      const produce = Math.min(step.qty, possible)
      if (produce <= 0) {
        toast("Not enough lower-tier materials to craft.", toastStyles.error)
        return false
      }

      // Subtract lower-tier inputs and add higher-tier outputs
      increment(fromId, -produce * 3)
      increment(toId, +produce)

      const msg =
        produce === step.qty
          ? `Crafted ${produce}x ${step.toName}.`
          : `Crafted ${produce}x ${step.toName} (limited by inventory).`
      toast(msg, toastStyles.success)
      return true
    },
    [counts, findMaterialId, increment],
  )

  return { applyCraftStep }
}
