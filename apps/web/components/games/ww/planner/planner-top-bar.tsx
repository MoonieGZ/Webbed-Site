"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LayoutList,
  ListPlus,
  NotebookPen,
  Swords,
  UserPlus,
  ListOrdered,
  ClipboardCheck,
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
  summaryOpen,
  setSummaryOpen,
}: {
  onAddCharacter: () => void
  onAddWeapon: () => void
  onManageInventory: () => void
  onReorderPlans: () => void
  summaryOpen: boolean
  setSummaryOpen: (o: boolean) => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="h-5 w-5" />
          Planner
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Plan your <strong>Wuthering Waves</strong> ascensions with this tool.
          <br />
          Add characters, weapons, and manage your inventory, and see exactly
          what materials you need to collect.
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
              <DropdownMenuItem onClick={onReorderPlans}>
                <ListOrdered />
                Re-order Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSummaryOpen(!summaryOpen)}>
                <ClipboardCheck />
                Toggle Material Summary
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
