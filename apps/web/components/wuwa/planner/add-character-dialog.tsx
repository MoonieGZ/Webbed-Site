"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import Image from "next/image"

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
    rarity: number
  }>
  onChoose: (c: {
    id: number
    name: string
    element: string
    icon: string
    elementIcon: string
    rarity: number
  }) => void
}) {
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
          <div className="max-h-[60vh] overflow-y-auto rounded-md border">
            {characters.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">
                No results
              </div>
            ) : (
              <ul className="divide-y">
                {characters.map((c) => (
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
                          {c.element}
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
