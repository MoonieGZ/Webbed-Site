"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/base/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import { getGlow } from "@/lib/games/ww/glow"
import { useAddCharacterFilters } from "@/hooks/games/ww/use-add-character-filters"

export function AddWeaponDialog({
  open,
  onOpenChange,
  search,
  setSearch,
  weapons,
  onChoose,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  search: string
  setSearch: (v: string) => void
  weapons: Array<{
    id: number
    name: string
    type: string
    icon: string
    rarity: number
  }>
  onChoose: (w: {
    id: number
    name: string
    type: string
    icon: string
    rarity: number
  }) => void
}) {
  const { weaponOptions, weaponFilters, setWeaponFilters } =
    useAddCharacterFilters()

  const baseWeapons = useMemo(
    () => weapons.filter((w) => (w.rarity ?? 0) >= 4),
    [weapons],
  )
  const sorted = useMemo(
    () => [...baseWeapons].sort((a, b) => a.name.localeCompare(b.name)),
    [baseWeapons],
  )

  const orderedWeaponOptions = useMemo(() => {
    const set = new Set<string>()
    for (const w of baseWeapons) set.add(w.type)
    return weaponOptions.filter((t) => set.has(t as any))
  }, [baseWeapons, weaponOptions])

  const filtered = useMemo(() => {
    const q = (search || "").trim().toLowerCase()
    return sorted.filter((w) => {
      if (weaponFilters.length && !weaponFilters.includes(w.type as any))
        return false
      if (q && !w.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [sorted, weaponFilters, search])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl h-[75vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Weapon</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-end mt-0">
            <ToggleGroup
              toggleMultiple
              value={weaponFilters as any}
              onValueChange={(arr) =>
                setWeaponFilters([...(arr as any[] as any)])
              }
              className="flex flex-wrap"
              aria-label="Filter by weapon type"
            >
              {orderedWeaponOptions.map((wp) => (
                <Tooltip key={wp}>
                  <TooltipTrigger>
                    <ToggleGroupItem value={wp} aria-label={wp}>
                      <Image
                        src={`/games/ww/weapon_types/${wp}_Icon.png`}
                        alt={wp}
                        width={24}
                        height={24}
                      />
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{wp}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
              <Search className="size-4" />
            </div>
            <Input
              placeholder="Search weapons..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-md border h-[55vh]">
            {filtered.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((w) => (
                  <li
                    key={w.id}
                    className="flex items-center justify-between gap-3 p-2 hover:bg-muted/30 cursor-pointer"
                    onClick={() => onChoose(w)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {(() => {
                        const glow = getGlow(Math.max(0, (w.rarity ?? 0) - 1))
                        return (
                          <Image
                            src={w.icon}
                            alt={w.name}
                            width={36}
                            height={36}
                            className="rounded-sm border"
                            style={{
                              borderColor: `${glow.line}80`,
                              boxShadow: `0 0 0 1px ${glow.line}80 inset, 0 0 12px ${glow.base}66`,
                              backgroundColor: `${glow.base}33`,
                            }}
                          />
                        )
                      })()}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {w.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Image
                            src={`/games/ww/weapon_types/${w.type}_Icon.png`}
                            alt={w.type}
                            width={16}
                            height={16}
                          />
                          {w.type}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
