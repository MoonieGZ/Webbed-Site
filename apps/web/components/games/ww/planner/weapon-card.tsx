"use client"

import Image from "next/image"
import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import {
  CircleHelp,
  EllipsisVertical,
  FlaskConical,
  Pencil,
  Trash2,
  Check,
  CheckCircle,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import { MotionEffect } from "@/components/animate-ui/effects/motion-effect"
import { Button } from "@/components/ui/button"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import { TargetedInventoryDialog } from "./targeted-inventory-dialog"
import { CraftingRecapDialog } from "./crafting-recap-dialog"
import { getGlow } from "@/lib/games/ww/glow"
import { EXP_MATERIALS } from "@/lib/games/ww/templates"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

type MaterialEntry = {
  type: string
  name: string
  qty: number
  rarity?: number
}

export function WeaponCard({
  name,
  icon,
  weaponType,
  rarity,
  breakdown,
  onEdit,
  onRemove,
  onMarkDone,
  availableFor,
  availableExp,
}: {
  name: string
  icon: string
  weaponType: string
  rarity: number
  breakdown: { credits: number; materials: MaterialEntry[] }
  onEdit?: () => void
  onRemove?: () => void
  onMarkDone?: () => void
  availableFor?: (type: string, name: string) => number
  availableExp?: () => number
}) {
  const mats = breakdown.materials
  const {
    getCountFor,
    getTotalExp,
    groupsByType,
    standaloneByType,
    counts,
    increment,
  } = useWwInventory()
  const iconGlow = useMemo(
    () => getGlow(Math.max(1, (rarity ?? 0) - 1)),
    [rarity],
  )

  const computeCraftableExtra = (
    entry: MaterialEntry,
    getAvail?: (type: string, name: string) => number,
  ): number => {
    if (!(entry.type === "enemy_drop" || entry.type === "talent_upgrade"))
      return 0
    const groups = groupsByType[entry.type] || []
    const group = groups.find((g) =>
      g.materials.some((m) => m.name === entry.name),
    )
    if (!group) return 0
    const matsAsc = [...group.materials].sort(
      (a, b) => (a.rarity || 0) - (b.rarity || 0),
    )
    const targetIdx = matsAsc.findIndex((m) => m.name === entry.name)
    if (targetIdx <= 0) return 0

    const available: number[] = new Array(targetIdx + 1).fill(0)
    for (let i = 0; i <= targetIdx; i++) {
      const m = matsAsc[i]
      const have = getAvail
        ? getAvail(entry.type, m.name)
        : (counts as Record<number, number>)[Number(m.id)] || 0
      const reqEntry = mats.find(
        (x) => x.type === entry.type && x.name === m.name,
      )
      const req = reqEntry ? reqEntry.qty : 0
      available[i] = Math.max(0, have - req)
    }
    for (let i = 0; i < targetIdx; i++) {
      const up = Math.floor((available[i] || 0) / 3)
      if (up > 0) {
        available[i] -= up * 3
        available[i + 1] += up
      }
    }
    return available[targetIdx] || 0
  }
  const [openDialog, setOpenDialog] = useState<null | {
    type: string
    name: string
    context?: "CHARACTER" | "WEAPON"
  }>(null)
  const [showCraftRecap, setShowCraftRecap] = useState(false)

  const { specials, others, requiredExp } = useMemo(() => {
    const specials = mats.filter(
      (s) =>
        (s.type === "other" && s.name === "Shell Credit") ||
        (s.type === "exp" && s.name === "Premium Energy Core"),
    )
    const others = mats.filter(
      (s) =>
        !(
          (s.type === "other" && s.name === "Shell Credit") ||
          (s.type === "exp" && s.name === "Premium Energy Core")
        ),
    )
    const expEntry = mats.find(
      (s) => s.type === "exp" && s.name === "Premium Energy Core",
    )
    return { specials, others, requiredExp: expEntry?.qty || 0 }
  }, [mats])

  const findStandaloneId = (type: string, name: string): number | null => {
    const list = standaloneByType[type] || []
    const m = list.find((x) => x.name === name)
    return m ? Number(m.id) : null
  }

  const findGroupedId = (type: string, name: string): number | null => {
    const groups = groupsByType[type] || []
    for (const g of groups) {
      const m = g.materials.find((x) => x.name === name)
      if (m) return Number(m.id)
    }
    return null
  }

  const handleMarkDone = () => {
    // Availability check (raw inventory)
    for (const s of others) {
      const have = getCountFor(s.type, s.name)
      if (s.type === "enemy_drop" || s.type === "talent_upgrade") {
        if (have < s.qty) {
          const extra = computeCraftableExtra(s)
          if (have + extra >= s.qty) {
            setShowCraftRecap(true)
            toast("Some materials need crafting first.", toastStyles.info)
            return
          } else {
            toast(
              "Not enough materials to complete this plan.",
              toastStyles.error,
            )
            return
          }
        }
      } else {
        if (have < s.qty) {
          toast(
            "Not enough materials to complete this plan.",
            toastStyles.error,
          )
          return
        }
      }
    }
    const haveCredits = getCountFor("other", "Shell Credit")
    const needCredits =
      specials.find((s) => s.type === "other" && s.name === "Shell Credit")
        ?.qty || 0
    if (haveCredits < needCredits) {
      toast("Not enough Shell Credits.", toastStyles.error)
      return
    }
    const haveExp = availableExp ? availableExp() : getTotalExp("WEAPON")
    if (requiredExp > 0 && haveExp < requiredExp) {
      toast("Not enough Weapon EXP.", toastStyles.error)
      return
    }

    // Deduct materials
    for (const s of others) {
      let id: number | null = null
      if (s.type === "enemy_drop" || s.type === "talent_upgrade")
        id = findGroupedId(s.type, s.name)
      else id = findStandaloneId(s.type, s.name)
      if (id == null) continue
      if (s.qty > 0) increment(id, -s.qty)
    }
    if (needCredits > 0) {
      const creditsId = 89
      increment(creditsId, -needCredits)
    }

    // Deduct EXP using weapon materials
    let remainingExp = requiredExp
    if (remainingExp > 0) {
      const sorted = [...EXP_MATERIALS.WEAPON].sort(
        (a, b) => (b.value || 0) - (a.value || 0),
      )
      for (const em of sorted) {
        if (remainingExp <= 0) break
        const id = Number(em.id)
        const have = (counts as Record<number, number>)[id] || 0
        if (have <= 0) continue
        const maxUsable = Math.floor(remainingExp / (em.value || 1))
        const use = Math.min(have, Math.max(0, maxUsable))
        if (use > 0) {
          increment(id, -use)
          remainingExp -= use * (em.value || 0)
        }
      }
      if (remainingExp > 0) {
        const asc = [...EXP_MATERIALS.WEAPON].sort(
          (a, b) => (a.value || 0) - (b.value || 0),
        )
        for (const em of asc) {
          const id = Number(em.id)
          const have = (counts as Record<number, number>)[id] || 0
          if (have > 0) {
            increment(id, -1)
            remainingExp -= em.value || 0
            if (remainingExp <= 0) break
          }
        }
      }
    }

    toast("Weapon plan applied to inventory.", toastStyles.success)
    onMarkDone?.()
  }

  return (
    <MotionEffect slide={{ direction: "down" }} fade layout>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={icon}
                alt={name}
                width={64}
                height={64}
                className="rounded-sm border"
                style={{
                  borderColor: `${iconGlow.line}80`,
                  boxShadow: `0 0 0 1px ${iconGlow.line}80 inset, 0 0 12px ${iconGlow.base}66`,
                  backgroundColor: `${iconGlow.base}33`,
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-bold">{name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                {weaponType}
              </div>
            </div>
            <div className="ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-8 w-8">
                    <EllipsisVertical />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil /> Edit Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowCraftRecap(true)}>
                    <FlaskConical /> Craft for Plan
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleMarkDone}>
                    <Check /> Complete Plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onRemove}>
                    <Trash2 /> Remove Plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            if (mats.length === 0) {
              return (
                <div className="flex flex-col items-center justify-center py-10">
                  <CheckCircle className="h-10 w-10 text-emerald-500" />
                  <div className="mt-2 text-sm text-muted-foreground">
                    Plan Complete!
                  </div>
                </div>
              )
            }

            const specials = mats.filter(
              (s) =>
                (s.type === "other" && s.name === "Shell Credit") ||
                (s.type === "exp" && s.name === "Premium Energy Core"),
            )
            const others = mats.filter(
              (s) =>
                !(
                  (s.type === "other" && s.name === "Shell Credit") ||
                  (s.type === "exp" && s.name === "Premium Energy Core")
                ),
            )

            const compactFmt = new Intl.NumberFormat(undefined, {
              notation: "compact",
              maximumFractionDigits: 1,
            })

            const renderItem = (s: MaterialEntry, key: string) => {
              const isExp = s.type === "exp" && s.name === "Premium Energy Core"
              const have = availableFor
                ? availableFor(s.type, s.name)
                : getCountFor(s.type, s.name)
              const required = s.qty
              const isCredit = s.type === "other" && s.name === "Shell Credit"
              const craftableExtra = !isExp
                ? computeCraftableExtra(s, availableFor)
                : 0
              const complete = isExp
                ? (availableExp ? availableExp() : getTotalExp("WEAPON")) >=
                  required
                : (() => {
                    if (!(required > 0)) return false
                    if (have >= required) return true
                    if (
                      s.type === "enemy_drop" ||
                      s.type === "talent_upgrade"
                    ) {
                      const covered = have + (craftableExtra || 0)
                      return covered >= required
                    }
                    return false
                  })()
              return (
                <div
                  key={key}
                  className={`group rounded-md border p-2 flex items-center justify-center overflow-hidden cursor-pointer ${complete ? "bg-background/40 grayscale-[0.6] opacity-70 hover:opacity-100 hover:grayscale-0" : "bg-background/50"}`}
                  onClick={() =>
                    setOpenDialog({
                      type: s.type,
                      name: s.name,
                      context: isExp ? "WEAPON" : undefined,
                    })
                  }
                >
                  <div className="relative flex flex-col items-center gap-1">
                    <div className="relative flex justify-center w-full">
                      {s.name === "Unknown" ? (
                        <div className="h-12.5 w-12.5 rounded-full bg-muted/30 flex items-center justify-center opacity-85 transition-opacity group-hover:opacity-100">
                          <CircleHelp className="h-8 w-8 text-muted-foreground" />
                        </div>
                      ) : (
                        <Image
                          src={getMaterialIconUrl(
                            isExp ? "exp" : s.type,
                            s.name,
                          )}
                          alt={s.name}
                          width={50}
                          height={50}
                          className="opacity-85 transition-opacity group-hover:opacity-100"
                        />
                      )}

                      {complete && (
                        <div className="absolute bg-emerald-500 text-white rounded-full h-5 w-5 flex items-center justify-center shadow -top-1 -right-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      {craftableExtra > 0 && have < required && (
                        <div className="absolute bg-orange-500 text-white rounded-full h-5 w-5 flex items-center justify-center shadow -top-1 -left-1">
                          <FlaskConical className="h-4 w-4" />
                        </div>
                      )}

                      <div className="absolute bottom-0 w-3/4">
                        <div className="relative flex w-full items-center">
                          <div className="absolute h-4 w-full -bottom-1">
                            <div
                              className="absolute bottom-0 h-1 w-full blur-lg transition-all duration-200 group-hover:h-4 group-hover:blur opacity-40"
                              style={{ background: getGlow(s.rarity).base }}
                            />
                            <div
                              className="absolute bottom-0 h-2 w-full blur transition-all duration-200 group-hover:h-2 group-hover:blur-sm opacity-60"
                              style={{ background: getGlow(s.rarity).light }}
                            />
                          </div>
                        </div>
                        <div
                          className="h-[3px] opacity-40"
                          style={{ backgroundColor: getGlow(s.rarity).line }}
                        />
                      </div>
                    </div>

                    <Tooltip key={s.name} side="bottom">
                      <TooltipTrigger>
                        <div className="text-xs">
                          {isCredit
                            ? `${compactFmt.format(Math.max(0, required - have))}`
                            : isExp
                              ? `${compactFmt.format(Math.max(0, required - (availableExp ? availableExp() : getTotalExp("WEAPON"))))}`
                              : (() => {
                                  const missing = Math.max(0, required - have)
                                  const afterCraft = Math.max(
                                    0,
                                    missing - (craftableExtra || 0),
                                  )
                                  return `${afterCraft.toLocaleString()}`
                                })()}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isExp
                          ? `${(availableExp ? availableExp() : getTotalExp("WEAPON")).toLocaleString()} / ${required.toLocaleString()} EXP`
                          : `${have.toLocaleString()}/${required.toLocaleString()}`}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )
            }

            return (
              <>
                <div className="flex flex-wrap gap-2 mx-auto justify-around mb-2">
                  {specials.map((s, idx) =>
                    renderItem(s, `spec-${idx}-${s.type}-${s.name}`),
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mx-auto justify-around">
                  {others.map((s, idx) =>
                    renderItem(s, `rest-${idx}-${s.type}-${s.name}`),
                  )}
                </div>
                <TargetedInventoryDialog
                  open={Boolean(openDialog)}
                  onOpenChange={(o) => !o && setOpenDialog(null)}
                  target={openDialog}
                />
                <CraftingRecapDialog
                  open={showCraftRecap}
                  onOpenChange={setShowCraftRecap}
                  materials={others}
                />
              </>
            )
          })()}
        </CardContent>
      </Card>
    </MotionEffect>
  )
}
