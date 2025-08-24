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
import { useAddCharacterFilters } from "@/hooks/games/ww/use-add-character-filters"
import { Search } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"

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
    elementFilters,
    setElementFilters,
    weaponFilters,
    setWeaponFilters,
    elementOptions,
    weaponOptions,
  } = useAddCharacterFilters()

  const sortedCharacters = useMemo(
    () => [...characters].sort((a, b) => a.name.localeCompare(b.name)),
    [characters],
  )

  const filteredCharacters = useMemo(() => {
    return sortedCharacters.filter((c) => {
      if (elementFilters.length && !elementFilters.includes(c.element as any))
        return false
      if (weaponFilters.length && !weaponFilters.includes(c.weaponType as any))
        return false
      return true
    })
  }, [sortedCharacters, elementFilters, weaponFilters])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl h-[75vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Add Character</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-muted-foreground">Filters:</div>
            <div className="flex flex-wrap items-center gap-2 justify-end">
              <ToggleGroup
                toggleMultiple
                value={elementFilters}
                onValueChange={(arr) => setElementFilters([...(arr as any[])])}
                className="flex flex-wrap"
                aria-label="Filter by element"
              >
                {/* TODO: fix tooltip to not create one per element */}
                {elementOptions.map((el) => (
                  <Tooltip key={el}>
                    <TooltipTrigger>
                      <ToggleGroupItem value={el} aria-label={el}>
                        <Image
                          src={`/games/ww/elements/${el}.webp`}
                          alt={el}
                          width={24}
                          height={24}
                        />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{el}</TooltipContent>
                  </Tooltip>
                ))}
              </ToggleGroup>
              <ToggleGroup
                toggleMultiple
                value={weaponFilters}
                onValueChange={(arr) => setWeaponFilters([...(arr as any[])])}
                className="flex flex-wrap"
                aria-label="Filter by weapon"
              >
                {weaponOptions.map((wp) => (
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
          </div>
          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
              <Search className="size-4" />
            </div>
            <Input
              placeholder="Search characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ps-9"
              autoFocus
            />
          </div>

          <div className="max-h-[60vh] overflow-y-auto rounded-md border h-[45vh]">
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
