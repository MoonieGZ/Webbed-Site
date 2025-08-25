"use client"

import Image from "next/image"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import { CircleHelp, EllipsisVertical, Pencil, Trash2 } from "lucide-react"
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
import { Check } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import { TargetedInventoryDialog } from "./targeted-inventory-dialog"
import { getGlow } from "@/lib/games/ww/glow"

type MaterialEntry = {
  type: string
  name: string
  qty: number
  rarity?: number
}

export function CharacterCard({
  name,
  icon,
  elementIcon,
  elementName,
  weaponType,
  breakdown,
  onEdit,
  onRemove,
}: {
  name: string
  icon: string
  elementIcon: string
  elementName: string
  weaponType: string
  breakdown: { credits: number; materials: MaterialEntry[] }
  onEdit?: () => void
  onRemove?: () => void
}) {
  const mats = breakdown.materials
  const { getCountFor, getTotalExp } = useWwInventory()
  const [openDialog, setOpenDialog] = useState<null | {
    type: string
    name: string
    context?: "CHARACTER" | "WEAPON"
  }>(null)

  return (
    <MotionEffect slide={{ direction: "down" }} fade>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-6">
            <Image
              src={icon}
              alt={name}
              width={64}
              height={64}
              className="rounded-sm"
            />
            <div className="flex flex-col gap-1">
              <div className="font-bold">{name}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Image
                  src={elementIcon}
                  alt={elementName}
                  width={24}
                  height={24}
                />
                {elementName} {weaponType}
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
                    <Pencil /> Edit plan
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={onRemove}>
                    <Trash2 /> Remove plan
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const specials = mats.filter(
              (s) =>
                (s.type === "other" && s.name === "Shell Credit") ||
                (s.type === "exp" && s.name === "Premium Resonance Potion"),
            )
            const others = mats.filter(
              (s) =>
                !(
                  (s.type === "other" && s.name === "Shell Credit") ||
                  (s.type === "exp" && s.name === "Premium Resonance Potion")
                ),
            )

            const compactFmt = new Intl.NumberFormat(undefined, {
              notation: "compact",
              maximumFractionDigits: 1,
            })

            const renderItem = (s: MaterialEntry, key: string) => {
              const isExp =
                s.type === "exp" && s.name === "Premium Resonance Potion"
              const have = getCountFor(s.type, s.name)
              const required = s.qty
              const complete = isExp
                ? getTotalExp("CHARACTER") >= required
                : have >= required && required > 0
              const isCredit = s.type === "other" && s.name === "Shell Credit"
              return (
                <div
                  key={key}
                  className={`group rounded-md border p-2 flex items-center justify-center overflow-hidden cursor-pointer ${complete ? "bg-background/40 grayscale-[0.6] opacity-70 hover:opacity-100 hover:grayscale-0" : "bg-background/50"}`}
                  onClick={() =>
                    setOpenDialog({
                      type: s.type,
                      name: s.name,
                      context: isExp ? "CHARACTER" : undefined,
                    })
                  }
                >
                  <div className="relative flex flex-col items-center gap-1">
                    <div className="relative flex justify-center w-full">
                      {s.name === "Unknown" ? (
                        <div className="h-12 w-12 rounded-full bg-muted/30 flex items-center justify-center opacity-85 transition-opacity group-hover:opacity-100">
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
                              ? `${compactFmt.format(Math.max(0, required - getTotalExp("CHARACTER")))}`
                              : `${Math.max(0, required - have).toLocaleString()}`}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isExp
                          ? `${getTotalExp("CHARACTER").toLocaleString()} / ${required.toLocaleString()} EXP`
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
              </>
            )
          })()}
        </CardContent>
      </Card>
    </MotionEffect>
  )
}
