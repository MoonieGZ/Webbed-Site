"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/animate-ui/radix/switch"
import { useGiSettingsForm } from "@/hooks/minigames/gi/use-gi-settings-form"
import { ToggleRight, Search } from "lucide-react"

export default function GISettingsForm({
  type,
}: {
  type: "characters" | "bosses"
}) {
  const {
    items,
    filter,
    setFilter,
    enabledMap,
    groupKeys,
    filteredGroups,
    setEnabled,
    toggleGroup,
    disableLegendBosses,
    isGroupAllEnabled,
  } = useGiSettingsForm(type)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-3xl font-medium">
            {type === "characters" ? "Characters" : "Bosses"}
          </span>
          <div className="flex items-center gap-2">
            {type === "bosses" && (
              <Button variant="outline" size="sm" onClick={disableLegendBosses}>
                Disable Legends
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-8 w-full"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {groupKeys.map((group) => (
            <div key={group} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium flex items-center gap-2">
                  {group}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleGroup(group, true)}
                    disabled={isGroupAllEnabled(group)}
                  >
                    Enable All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleGroup(group, false)}
                    disabled={!isGroupAllEnabled(group)}
                  >
                    Disable All
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2">
                {(filteredGroups.get(group) ?? []).map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted cursor-pointer"
                    onClick={() =>
                      setEnabled(item.name, !enabledMap[item.name])
                    }
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex flex-col min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${!enabledMap[item.name] ? "text-muted-foreground" : ""}`}
                          title={item.name}
                        >
                          {item.name.replace("⭐ - ", "")}
                        </p>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={!!enabledMap[item.name]}
                        onCheckedChange={(checked) =>
                          setEnabled(item.name, checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
