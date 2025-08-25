"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LayoutList,
  ListPlus,
  NotebookPen,
  Swords,
  TriangleAlert,
  UserPlus,
  ListOrdered,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"

export function PlannerTopBar({
  onAddCharacter,
  onAddWeapon,
  onManageInventory,
  onReorderPlans,
}: {
  onAddCharacter: () => void
  onAddWeapon: () => void
  onManageInventory: () => void
  onReorderPlans: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="w-4 h-4" />
          Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Plan your <strong>Wuthering Waves</strong> ascensions with this tool.
          <br />
          Add characters, manage your inventory, and see exactly what materials
          you need to collect.
          <br />
          <span className="text-amber-500 flex items-center gap-1">
            <TriangleAlert className="w-4 h-4" />
            Weapons are coming soon!
            <TriangleAlert className="w-4 h-4" />
          </span>
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
              <DropdownMenuItem onClick={onAddWeapon} disabled>
                <Swords />
                Add Weapon
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onManageInventory}>
                <LayoutList />
                Manage Inventory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onReorderPlans}>
                <ListOrdered />
                Re-order Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
