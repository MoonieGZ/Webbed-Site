"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ArrowDown, ArrowUp } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

export function ReorderPlansDialog({
  open,
  onOpenChange,
  plans,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  plans: Array<{
    characterId: number
    characterName: string
    characterIcon: string
  }>
  onConfirm: (order: number[]) => void
}) {
  const initialOrder = useMemo(() => plans.map((_, i) => i), [plans])
  const [order, setOrder] = useState<number[]>(initialOrder)

  useEffect(() => {
    if (open) setOrder(plans.map((_, i) => i))
  }, [open, plans])

  const move = (from: number, to: number) => {
    setOrder((prev) => {
      const arr = [...prev]
      const [removed] = arr.splice(from, 1)
      arr.splice(to, 0, removed)
      return arr
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Re-order Plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {plans.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No plans to reorder.
            </div>
          ) : (
            <ol className="space-y-2">
              {order.map((origIdx, pos) => {
                const p = plans[origIdx]
                const canUp = pos > 0
                const canDown = pos < order.length - 1
                return (
                  <li
                    key={`${p.characterId}-${origIdx}`}
                    className="rounded-md border bg-background/50 p-2 flex items-center gap-3"
                  >
                    <div className="text-xs text-muted-foreground w-6 text-center">
                      {pos + 1}
                    </div>
                    <Image
                      src={p.characterIcon}
                      alt={p.characterName}
                      width={36}
                      height={36}
                      className="rounded-sm"
                    />
                    <div className="text-sm font-medium truncate flex-1">
                      {p.characterName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => move(pos, pos - 1)}
                        disabled={!canUp}
                        aria-label="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => move(pos, pos + 1)}
                        disabled={!canDown}
                        aria-label="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          <div className="flex justify-end gap-2">
            <button
              className="rounded-md border px-3 py-2 text-sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </button>
            <button
              className="rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground"
              onClick={() => onConfirm(order)}
              disabled={plans.length <= 1}
            >
              Save Order
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
