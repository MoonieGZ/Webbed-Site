"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Swords, UserPlus } from "lucide-react"

export function PlannerTopBar({
  totalItems,
  totalCredits,
  onAddCharacter,
  onAddWeapon,
}: {
  totalItems: number
  totalCredits: number
  onAddCharacter: () => void
  onAddWeapon: () => void
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-3 p-3">
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-muted-foreground">Total Items:</span>{" "}
            <span className="font-medium">{totalItems}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Credits:</span>{" "}
            <span className="font-medium">{totalCredits.toLocaleString()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onAddCharacter}>
            <UserPlus />
            Add Character
          </Button>
          <Button onClick={onAddWeapon}>
            <Swords />
            Add Weapon
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
