"use client"

import Image from "next/image"
import { useState } from "react"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"
import { getGlow } from "@/lib/games/ww/glow"
import { TargetedInventoryDialog } from "./targeted-inventory-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/animate-ui/components/tooltip"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import { CircleHelp } from "lucide-react"

export function MaterialSummaryCard({
  items,
  loading,
}: {
  items: Array<{ type: string; name: string; qty: number; rarity?: number }>
  loading: boolean
}) {
  const [target, setTarget] = useState<null | { type: string; name: string }>(
    null,
  )
  const { getCountFor, getTotalExp } = useWwInventory()

  const body = (
    <>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading summary…</div>
      ) : items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          All set! No remaining materials.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {items.map(
            (
              s: { type: string; name: string; qty: number; rarity?: number },
              idx: number,
            ) => (
              <div
                key={`${s.type}-${s.name}-${idx}`}
                className="group rounded-md border p-2 flex items-center justify-center overflow-hidden cursor-pointer bg-background/50"
                onClick={() => setTarget({ type: s.type, name: s.name })}
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
                          s.type === "exp" ? "exp" : s.type,
                          s.name,
                        )}
                        alt={s.name}
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
                      <div className="text-xs">{s.qty.toLocaleString()}</div>
                    </TooltipTrigger>
                    <TooltipContent>
                      {(() => {
                        if (s.type === "exp") {
                          const category = s.name.includes("Resonance")
                            ? "CHARACTER"
                            : "WEAPON"
                          const owned = getTotalExp(category as any) || 0
                          const total = owned + (s.qty || 0)
                          return `${owned.toLocaleString()} / ${total.toLocaleString()} EXP`
                        }
                        const owned = getCountFor(s.type, s.name) || 0
                        const total = owned + (s.qty || 0)
                        return `${owned.toLocaleString()} / ${total.toLocaleString()}`
                      })()}
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ),
          )}
        </div>
      )}
      <TargetedInventoryDialog
        open={Boolean(target)}
        onOpenChange={(o) => !o && setTarget(null)}
        target={target}
      />
    </>
  )

  return <TooltipProvider>{body}</TooltipProvider>
}
