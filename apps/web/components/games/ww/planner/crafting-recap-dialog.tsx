"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import Image from "next/image"
import { useMemo } from "react"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import { Button } from "@/components/ui/button"
import { useWwCraftingRecap } from "@/hooks/games/ww/use-ww-crafting-recap"

type MaterialEntry = {
  type: string
  name: string
  qty: number
  rarity?: number
}

export function CraftingRecapDialog({
  open,
  onOpenChange,
  materials,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  materials: MaterialEntry[]
}) {
  const { groupsByType, counts } = useWwInventory()
  const { applyCraftStep } = useWwCraftingRecap()

  const itemsToCraft = useMemo(() => {
    const result: Array<{
      type: string
      fromName: string
      fromRarity?: number
      toName: string
      toRarity?: number
      qty: number
      inputQty: number
    }> = []

    const processType = (type: string) => {
      const matsForType = materials.filter((m) => m.type === type)
      if (matsForType.length === 0) return
      const allGroups = groupsByType[type] || []
      const grp = allGroups.find((g) =>
        g.materials.some((gm) => matsForType.some((mm) => mm.name === gm.name)),
      )
      if (!grp) return
      const asc = [...grp.materials].sort(
        (a, b) => (a.rarity || 0) - (b.rarity || 0),
      )
      const T = asc.length - 1
      const req: number[] = new Array(asc.length).fill(0)
      const have: number[] = new Array(asc.length).fill(0)
      for (let i = 0; i < asc.length; i++) {
        const m = asc[i]
        const entry = matsForType.find((x) => x.name === m.name)
        req[i] = entry?.qty || 0
        have[i] = (counts as any)[Number(m.id)] || 0
      }
      const deficit: number[] = req.map((r, i) => Math.max(0, r - have[i]))
      const excess: number[] = req.map((r, i) => Math.max(0, have[i] - r))
      const craftsStep: number[] = new Array(asc.length).fill(0) // needed crafts from i->i+1 stored at index i

      // Each deficit at tier i must be crafted from tier i-1 (do not consume same-tier excess here)
      for (let i = T; i >= 1; i--) {
        const need = deficit[i]
        if (need > 0) craftsStep[i - 1] += need
      }

      // Feasible crafts limited by available excess stock and chained outputs
      const craftsFeasible: number[] = new Array(asc.length).fill(0)
      const availUse = excess.slice()
      for (let i = 0; i < T; i++) {
        const craftable = Math.floor((availUse[i] || 0) / 3)
        const produce = Math.min(craftsStep[i], craftable)
        if (produce > 0) {
          craftsFeasible[i] = produce
          availUse[i] -= produce * 3
          availUse[i + 1] = (availUse[i + 1] || 0) + produce
        }
      }

      // Convert feasible crafts per step to output entries (i>=1)
      for (let i = 1; i <= T; i++) {
        const qty = craftsFeasible[i - 1]
        if (qty > 0) {
          result.push({
            type,
            fromName: asc[i - 1].name,
            fromRarity: asc[i - 1].rarity,
            toName: asc[i].name,
            toRarity: asc[i].rarity,
            qty,
            inputQty: qty * 3,
          })
        }
      }
    }

    processType("enemy_drop")
    processType("talent_upgrade")

    // Sort by rarity descending then name
    // Order by toRarity ascending (lowest step first)
    return result.sort(
      (a, b) =>
        (a.toRarity || 0) - (b.toRarity || 0) ||
        a.toName.localeCompare(b.toName),
    )
  }, [materials, groupsByType, counts])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crafting Recap</DialogTitle>
        </DialogHeader>
        <div>
          <p className="text-sm text-muted-foreground mb-3">
            This shows how many higher-tier materials you can make using extra
            lower-tier ones.
            <br />
            Crafting takes 3 of a lower tier to make 1 higher, and only uses
            leftovers after this character's own needs are met.
          </p>
          {itemsToCraft.length === 0 ? (
            <ol className="space-y-3 py-2">
              <li className="rounded-md border bg-background/50 p-3">
                <div className="text-sm text-muted-foreground py-6 text-center">
                  Nothing to craft. You're all set!
                </div>
              </li>
            </ol>
          ) : (
            <ol className="space-y-3 py-2">
              {itemsToCraft.map((m, idx) => (
                <li
                  key={`${m.type}:${m.toName}:${idx}`}
                  className="rounded-md border bg-background/50 p-3"
                >
                  <div className="text-xs text-muted-foreground mb-2">
                    Step {idx + 1}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">Use</span>
                          <span className="inline-flex items-center gap-1">
                            <Image
                              src={getMaterialIconUrl(m.type, m.fromName)}
                              alt={m.fromName}
                              width={36}
                              height={36}
                              className="rounded-sm shrink-0"
                            />
                            <span className="text-sm leading-none">
                              x {m.inputQty.toLocaleString()}
                            </span>
                          </span>
                          <span className="text-sm">to craft</span>
                          <span className="inline-flex items-center gap-1">
                            <Image
                              src={getMaterialIconUrl(m.type, m.toName)}
                              alt={m.toName}
                              width={36}
                              height={36}
                              className="rounded-sm shrink-0"
                            />
                            <span className="text-sm leading-none">
                              x {m.qty.toLocaleString()}
                            </span>
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        Craft {m.qty.toLocaleString()} {m.toName} using{" "}
                        {m.inputQty.toLocaleString()} {m.fromName}
                      </TooltipContent>
                    </Tooltip>
                    <div className="ml-auto">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          applyCraftStep({
                            type: m.type,
                            fromName: m.fromName,
                            toName: m.toName,
                            qty: m.qty,
                            inputQty: m.inputQty,
                          })
                        }
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
