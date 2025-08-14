"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/animate-ui/radix/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import { useGiSettingsBosses } from "../../../hooks/minigames/gi/use-gi-settings-bosses"
import { ChevronDown, ShieldUser } from "lucide-react"
import type { GiBoss } from "@/types"
import { buildBossIconPath } from "@/lib/minigames/gi/icon-path"

export default function GIBossesSettings() {
  const {
    settings,
    filter,
    setFilter,
    enabledMap,
    groupKeys,
    filteredGroups,
    setEnabled,
    toggleLegendBosses,
    toggleAll,
  } = useGiSettingsBosses()

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldUser className="h-5 w-5" />
              Bosses
            </div>
          </CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>Manage enabled bosses by region</CardDescription>
            <div className="flex items-center gap-2">
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search bosses"
                className="h-8 w-[200px]"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="inline-flex items-center gap-1"
                  >
                    Toggles
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toggleAll(true)}>
                    Enable All
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleAll(false)}>
                    Disable All
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toggleLegendBosses(true)}>
                    Enable Legends
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleLegendBosses(false)}>
                    Disable Legends
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groupKeys.map((region: string) => {
            const bosses = (filteredGroups.get(region) ?? []) as GiBoss[]
            if (bosses.length === 0) return null
            return (
              <div key={region} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">{region}</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {bosses.map((b) => (
                    <div
                      key={b.name}
                      className={`flex items-center justify-between p-2 rounded-lg border bg-background/50 cursor-pointer ${
                        b.legendary
                          ? "ring-1 ring-yellow-500/40"
                          : "ring-1 ring-muted-foreground/20"
                      } ${(enabledMap[b.name] ?? true) ? "" : "opacity-75 grayscale"}`}
                      onClick={() =>
                        setEnabled(b.name, !(enabledMap[b.name] ?? true))
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-9 w-9 shrink-0 rounded overflow-hidden ring-2 ${
                            b.legendary
                              ? "ring-yellow-500/60 bg-yellow-500/10"
                              : "ring-muted-foreground/40 bg-muted/20"
                          }`}
                          title={b.name}
                        >
                          <img
                            src={buildBossIconPath(b.name, b.location)}
                            alt={b.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {b.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {b.legendary ? "Legend" : ""}
                            {b.legendary && !b.coop ? " • " : ""}
                            {!b.coop ? "Co-Op N/A" : ""}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={enabledMap[b.name] ?? true}
                        className="pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
