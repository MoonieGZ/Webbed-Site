"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import type { RandomResult } from "@/hooks/minigames/gi/use-gi-randomizer"

export default function GIResultsDialog({
  open,
  onOpenChange,
  result,
  onSelectAll,
  allSelected,
  onAccept,
  onClose,
  canSelect,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  result: RandomResult | null
  onSelectAll: () => void
  allSelected: boolean
  onAccept: () => void
  onClose: () => void
  canSelect: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Randomization Results</DialogTitle>
        </DialogHeader>
        {result && (
          <div className="space-y-6 p-1">
            {result.bosses.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Bosses ({result.bosses.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {result.bosses.map((b) => (
                    <div key={b.name} className="rounded-md border p-2">
                      <div
                        className="text-sm font-medium truncate"
                        title={b.name}
                      >
                        {b.name.replace("⭐ - ", "")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {b.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.characters.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Characters ({result.characters.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {result.characters.map((c, idx) => (
                    <div
                      key={c.name}
                      className={`rounded-md border p-2 cursor-pointer ${c.selected ? "ring-2 ring-primary" : ""}`}
                      onClick={() =>
                        canSelect &&
                        (result.characters[idx].selected = !c.selected)
                      }
                    >
                      <div
                        className="text-sm font-medium truncate"
                        title={c.name}
                      >
                        {c.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.fiveStar ? "⭐⭐⭐⭐⭐" : "⭐⭐⭐⭐"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {canSelect && result.characters.length > 0 && (
                <Button variant="outline" onClick={onSelectAll}>
                  {allSelected ? "Unselect All" : "Select All"}
                </Button>
              )}
              <Button
                onClick={
                  canSelect && result.characters.length > 0 ? onAccept : onClose
                }
              >
                {canSelect && result.characters.length > 0 ? "Accept" : "Close"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
