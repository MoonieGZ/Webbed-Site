"use client"

import { useState } from "react"
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
  const [menuOpen, setMenuOpen] = useState(false)

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
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <ListPlus />
                Menu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onAddCharacter()
                }}
              >
                <UserPlus />
                Add Character
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onAddWeapon()
                }}
              >
                <Swords />
                Add Weapon
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onManageInventory()
                }}
              >
                <LayoutList />
                Manage Inventory
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  onReorderPlans()
                }}
              >
                <ListOrdered />
                Re-order Plans
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault()
                  setMenuOpen(false)
                  setSummaryOpen(!summaryOpen)
                }}
              >
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
