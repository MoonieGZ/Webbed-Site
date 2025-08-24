"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/animate-ui/radix/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useWwInventory } from "@/hooks/games/ww/use-ww-inventory"
import { ChevronDown, CircleHelp, Search } from "lucide-react"
import { useMemo, useState, useCallback } from "react"
import Image from "next/image"
import { getMaterialIconUrl } from "@/lib/games/ww/icons"

export function InventoryDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
}) {
  const { standaloneByType, groupsByType, counts, setCount } = useWwInventory()
  const [query, setQuery] = useState("")
  const onChangeCount = useCallback(
    (materialId: number, raw: string) => {
      const cleaned = (raw || "").replace(/[^0-9]/g, "")
      setCount(materialId, cleaned ? parseInt(cleaned, 10) : 0)
    },
    [setCount],
  )

  const filter = (name: string) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return name.toLowerCase().includes(q)
  }

  const typeKeys = useMemo(() => {
    const set = new Set<string>([
      ...Object.keys(groupsByType || {}),
      ...Object.keys(standaloneByType || {}),
    ])
    const arr = Array.from(set)
    arr.sort((a, b) => {
      if (a === "exp") return -1
      if (b === "exp") return 1
      return formatType(a).localeCompare(formatType(b))
    })
    return arr
  }, [groupsByType, standaloneByType])

  const itemsForType = useCallback(
    (typeKey: string) => {
      const map = new Map<
        number,
        { id: number; name: string; rarity?: number }
      >()
      const groups = groupsByType[typeKey] || []
      for (const g of groups) {
        for (const m of g.materials) {
          if (!map.has(m.id))
            map.set(m.id, { id: m.id, name: m.name, rarity: m.rarity })
        }
      }
      const mats = standaloneByType[typeKey] || []
      for (const m of mats) {
        if (!map.has(m.id))
          map.set(m.id, { id: m.id, name: m.name, rarity: m.rarity })
      }

      if (
        typeKey === "exp" &&
        !Array.from(map.values()).some((x) => x.name === "Shell Credit")
      ) {
        map.set(-1, { id: -1, name: "Shell Credit", rarity: 2 })
      }

      let arr = Array.from(map.values())
        .filter((m) => filter(m.name))
        .sort(
          (a, b) =>
            (b.rarity || 0) - (a.rarity || 0) || a.name.localeCompare(b.name),
        )

      if (typeKey === "exp") {
        const idx = arr.findIndex((m) => m.name === "Shell Credit")
        if (idx >= 0) {
          const [sc] = arr.splice(idx, 1)
          arr.push(sc)
        }
      }
      return arr
    },
    [groupsByType, standaloneByType, query],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="shrink-0">
          <DialogTitle>Manage Inventory</DialogTitle>
        </DialogHeader>
        <div className="shrink-0">
          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
              <Search className="size-4" />
            </div>
            <Input
              placeholder="Search items..."
              onChange={(e) => setQuery(e.target.value)}
              className="ps-9"
              autoFocus
            />
          </div>
          <Separator className="my-2" />
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto -mt-4">
          {(() => {
            const typeKey = "exp"
            const items = itemsForType(typeKey)
            if (!items.length) return null
            return (
              <div key={typeKey} className="mb-3">
                <div className="flex items-center justify-between bg-muted/40 rounded-md px-2 py-1">
                  <TypeSectionTitle title={formatType(typeKey)} />
                </div>
                <div className="px-2">
                  <ul className="grid grid-cols-3 md:grid-cols-4 gap-2 py-2">
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
                                  m.name === "Shell Credit" ? "other" : typeKey,
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
                                    style={{
                                      background: getGlow(m.rarity).base,
                                    }}
                                  />
                                  <div
                                    className="absolute bottom-0 h-2 w-full blur transition-all duration-200 group-hover:h-2 group-hover:blur-sm opacity-60"
                                    style={{
                                      background: getGlow(m.rarity).light,
                                    }}
                                  />
                                </div>
                              </div>
                              <div
                                className="h-[3px] opacity-40"
                                style={{
                                  backgroundColor: getGlow(m.rarity).line,
                                }}
                              />
                            </div>
                          </div>
                          <div className="flex items-center gap-2 w-full">
                            <Input
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              value={
                                counts[m.id] != null ? String(counts[m.id]) : ""
                              }
                              onChange={(e) =>
                                onChangeCount(m.id, e.target.value)
                              }
                              className="w-24 h-8 text-center mx-auto"
                            />
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })()}

          {typeKeys
            .filter((k) => k !== "exp")
            .map((typeKey) => {
              const items = itemsForType(typeKey)
              if (!items.length) return null
              return (
                <div key={typeKey} className="mb-3">
                  <Collapsible defaultOpen={false}>
                    <div className="flex items-center justify-between bg-muted/40 rounded-md px-2 py-1">
                      <TypeSectionTitle title={formatType(typeKey)} />
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <ChevronDown className="size-4" />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                    <CollapsibleContent className="px-2">
                      <ul className="grid grid-cols-3 md:grid-cols-4 gap-2 py-2">
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
                                      m.name === "Shell Credit"
                                        ? "other"
                                        : typeKey,
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
                                        style={{
                                          background: getGlow(m.rarity).base,
                                        }}
                                      />
                                      <div
                                        className="absolute bottom-0 h-2 w-full blur transition-all duration-200 group-hover:h-2 group-hover:blur-sm opacity-60"
                                        style={{
                                          background: getGlow(m.rarity).light,
                                        }}
                                      />
                                    </div>
                                  </div>
                                  <div
                                    className="h-[3px] opacity-40"
                                    style={{
                                      backgroundColor: getGlow(m.rarity).line,
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center gap-2 w-full">
                                <Input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  value={
                                    counts[m.id] != null
                                      ? String(counts[m.id])
                                      : ""
                                  }
                                  onChange={(e) =>
                                    onChangeCount(m.id, e.target.value)
                                  }
                                  className="w-24 h-8 text-center mx-auto"
                                />
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              )
            })}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TypeSectionTitle({ title }: { title: string }) {
  return <div className="text-sm font-semibold">{title}</div>
}

function formatType(key: string) {
  switch (key) {
    case "enemy_drop":
      return "Enemy Drops"
    case "talent_upgrade":
      return "Talent Upgrade"
    case "boss_drop":
      return "Boss Drops"
    case "weekly_boss":
      return "Weekly Boss"
    case "collectible":
      return "Collectibles"
    case "exp":
      return "Consumables"
    default:
      return key
  }
}

function getGlow(rarity?: number) {
  if (rarity === 1)
    return { base: "#81e6be", light: "#c7f3e1", line: "#81e6be" }
  if (rarity === 2)
    return { base: "#8fd6fa", light: "#c9ebfd", line: "#8fd6fa" }
  if (rarity === 3)
    return { base: "#d0a2fd", light: "#e6cffd", line: "#d0a2fd" }
  if (rarity === 4)
    return { base: "#f9d852", light: "#fdeea6", line: "#f9d852" }
  return { base: "#a1a1aa", light: "#d4d4d8", line: "#a1a1aa" }
}
