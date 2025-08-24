"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LayoutList, ListPlus, Swords, UserPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"

export function PlannerTopBar({
  totalItems,
  totalCredits,
  onAddCharacter,
  onAddWeapon,
  onManageInventory,
}: {
  totalItems: number
  totalCredits: number
  onAddCharacter: () => void
  onAddWeapon: () => void
  onManageInventory: () => void
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListPlus />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddCharacter}>
                <UserPlus />
                Add Character
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddWeapon}>
                <Swords />
                Add Weapon
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onManageInventory}>
                <LayoutList />
                Manage Inventory
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
