"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import { useMemo, useCallback } from "react"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import Image from "next/image"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import { CircleHelp } from "lucide-react"
import { getGlow } from "@/lib/games/ww/glow"

type Target = { type: string; name: string; context?: "CHARACTER" | "WEAPON" }

export function TargetedInventoryDialog({
  open,
  onOpenChange,
  target,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  target: Target | null
}) {
  const { groupsByType, standaloneByType, counts, setCount } = useWwInventory()

  const onChangeCount = useCallback(
    (materialId: number, raw: string) => {
      const cleaned = (raw || "").replace(/[^0-9]/g, "")
      setCount(materialId, cleaned ? parseInt(cleaned, 10) : 0)
    },
    [setCount],
  )

  const items = useMemo(() => {
    if (!target)
      return [] as Array<{
        id: number
        name: string
        rarity?: number
        type: string
      }>
    const t = target.type
    const n = target.name

    // For grouped types: talent_upgrade, enemy_drop, exp
    const groupedTypes = new Set([
      "talent_upgrade",
      "enemy_drop",
      "exp",
    ]) as Set<string>
    if (groupedTypes.has(t)) {
      // Special-case EXP: pick by known group ids (12 for CHARACTER, 13 for WEAPON)
      if (t === "exp") {
        const grpArr = groupsByType["exp"] || []
        const groupId = target.context === "WEAPON" ? 13 : 12
        const group = grpArr.find((g) => g.groupId === groupId)
        const mats = (group?.materials || [])
          .slice()
          .sort((a, b) => (b.rarity || 0) - (a.rarity || 0))
        return mats.map((m) => ({
          id: m.id,
          name: m.name,
          rarity: m.rarity,
          type: "exp",
        }))
      }

      // For enemy_drop and talent_upgrade: find the group that contains the clicked item
      const grpArr = groupsByType[t] || []
      const group = grpArr.find((g) =>
        (g.materials || []).some((m) => m.name === n),
      )
      if (group) {
        const mats = (group.materials || [])
          .slice()
          .sort((a, b) => (b.rarity || 0) - (a.rarity || 0))
        return mats.map((m) => ({
          id: m.id,
          name: m.name,
          rarity: m.rarity,
          type: t,
        }))
      }
    }

    // Fallback: single item resolution from standalone or groups
    const fromStandalone = (standaloneByType[t] || []).find((m) => m.name === n)
    if (fromStandalone)
      return [
        {
          id: fromStandalone.id,
          name: fromStandalone.name,
          rarity: fromStandalone.rarity,
          type: t,
        },
      ]
    for (const g of groupsByType[t] || []) {
      const m = g.materials.find((x) => x.name === n)
      if (m) return [{ id: m.id, name: m.name, rarity: m.rarity, type: t }]
    }
    // Special-case Shell Credit id (89)
    if (t === "other" && n === "Shell Credit") {
      return [{ id: 89, name: n, rarity: 2, type: t }]
    }
    return [] as Array<{
      id: number
      name: string
      rarity?: number
      type: string
    }>
  }, [target, groupsByType, standaloneByType])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
        </DialogHeader>
        <div className="px-1">
          {items.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              {target?.name === "Unknown"
                ? "This item is unknown, so counts can't be updated yet."
                : "This item isn't part of a known group or standalone list yet, so counts can't be updated here."}
            </div>
          ) : (
            <ul className="grid grid-cols-4 gap-3 py-2">
              {items.map((m) => (
                <li
                  key={m.id}
                  className="group rounded-md border bg-background/50 p-2 flex items-center justify-center overflow-hidden"
                >
                  <div className="relative flex flex-col items-center gap-2 w-full">
                    <div className="relative flex justify-center w-full">
                      {m.name === "Unknown" ? (
                        <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center opacity-85 transition-opacity group-hover:opacity-100">
                          <CircleHelp className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <Image
                          src={getMaterialIconUrl(
                            m.type === "other" && m.name === "Shell Credit"
                              ? "other"
                              : target?.type || "other",
                            m.name,
                          )}
                          alt={m.name}
                          width={50}
                          height={50}
                          className="opacity-85 transition-opacity group-hover:opacity-100"
                        />
                      )}
                      <div className="absolute bottom-0 w-3/4">
                        <div className="relative flex w-full items-center">
                          <div className="absolute h-4 w-full -bottom-1">
                            <div
                              className="absolute bottom-0 h-1 w-full blur-lg transition-all duration-200 group-hover:h-4 group-hover:blur opacity-40"
                              style={{ background: getGlow(m.rarity).base }}
                            />
                            <div
                              className="absolute bottom-0 h-2 w-full blur transition-all duration-200 group-hover:h-2 group-hover:blur-sm opacity-60"
                              style={{ background: getGlow(m.rarity).light }}
                            />
                          </div>
                        </div>
                        <div
                          className="h-[3px] opacity-40"
                          style={{ backgroundColor: getGlow(m.rarity).line }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full">
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9,]*"
                        value={
                          counts[m.id] != null
                            ? Number(counts[m.id]).toLocaleString()
                            : ""
                        }
                        onChange={(e) => onChangeCount(m.id, e.target.value)}
                        className="w-28 h-8 text-center mx-auto"
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
