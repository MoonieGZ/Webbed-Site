"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useMemo } from "react"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/base/toggle-group"
import { useAddCharacterFilters } from "@/hooks/wuwa/use-add-character-filters"

export function AddCharacterDialog({
  open,
  onOpenChange,
  search,
  setSearch,
  characters,
  onChoose,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  search: string
  setSearch: (v: string) => void
  characters: Array<{
    id: number
    name: string
    element: string
    icon: string
    elementIcon: string
    weaponType: string
    rarity: number
  }>
  onChoose: (c: {
    id: number
    name: string
    element: string
    icon: string
    elementIcon: string
    weaponType: string
    rarity: number
  }) => void
}) {
  const {
    elementFilter,
    setElementFilter,
    weaponFilter,
    setWeaponFilter,
    elementOptions,
    weaponOptions,
    clearFilters,
  } = useAddCharacterFilters()

  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    [characters],
  )

  const filteredCharacters = useMemo(() => {
    return sortedCharacters.filter((c) => {
      if (elementFilter && c.element !== elementFilter) return false
      if (weaponFilter && c.weaponType !== weaponFilter) return false
      return true
    })
  }, [sortedCharacters, elementFilter, weaponFilter])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Character</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <Input
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="flex flex-wrap gap-2 items-center">
            <div className="text-xs text-muted-foreground">Filter:</div>
            <ToggleGroup
              toggleMultiple
              value={elementFilter ? [elementFilter] : []}
              onValueChange={(arr) => {
                const vals = (arr as readonly string[]) || []
                const next = vals.includes("__all_el") ? "" : vals[0] || ""
                setElementFilter(next as any)
              }}
              className="flex flex-wrap"
              aria-label="Filter by element"
            >
              <ToggleGroupItem value="__all_el" aria-label="All elements">
                All Elements
              </ToggleGroupItem>
              {elementOptions.map((el) => (
                <ToggleGroupItem key={el} value={el} aria-label={el}>
                  {el}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup
              toggleMultiple
              value={weaponFilter ? [weaponFilter] : []}
              onValueChange={(arr) => {
                const vals = (arr as readonly string[]) || []
                const next = vals.includes("__all_wp") ? "" : vals[0] || ""
                setWeaponFilter(next as any)
              }}
              className="flex flex-wrap"
              aria-label="Filter by weapon"
            >
              <ToggleGroupItem value="__all_wp" aria-label="All weapons">
                All Weapons
              </ToggleGroupItem>
              {weaponOptions.map((wp) => (
                <ToggleGroupItem key={wp} value={wp} aria-label={wp}>
                  {wp}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-md border">
            {filteredCharacters.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              <ul className="divide-y">
                {filteredCharacters.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-2 hover:bg-muted/30 cursor-pointer"
                    onClick={() => onChoose(c)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Image src={c.icon} alt={c.name} width={36} height={36} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">
                          {c.name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                          <Image
                            src={c.elementIcon}
                            alt={c.element}
                            width={16}
                            height={16}
                          />
                          {c.element} {c.weaponType}
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
