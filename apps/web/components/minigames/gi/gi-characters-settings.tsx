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
import { Switch } from "@/components/animate-ui/radix/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useGiSettingsCharacters } from "@/hooks/minigames/gi/use-gi-settings-characters"
import { buildCharacterIconPath } from "@/lib/minigames/gi/icon-path"
import { Users } from "lucide-react"

export default function GICharactersSettings() {
  const {
    loading,
    grouped,
    enabledMap,
    toggleEnabled,
    profiles,
    selectedProfile,
    loadProfile,
    saveProfile,
  } = useGiSettingsCharacters()

  if (loading) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Characters
            </div>
          </CardTitle>
          <CardDescription>
            Manage enabled characters in your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="ml-auto flex items-center gap-2">
              <Select
                value={selectedProfile?.toString() ?? ""}
                onValueChange={(v) => loadProfile(parseInt(v))}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Load profile" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }).map((_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                      Profile {(i + 1).toString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => saveProfile(selectedProfile ?? 1)}>
                Save
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([element, chars]) => (
              <div key={element} className="space-y-2">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <img
                    src={`/minigames/gi/elements/${element}.webp`}
                    alt={element}
                    className="h-5 w-5 rounded-sm"
                    loading="lazy"
                  />
                  {element}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {chars.map((c) => (
                    <div
                      key={c.name}
                      className={`flex items-center justify-between p-2 rounded-lg border bg-background/50 cursor-pointer ${
                        c.fiveStar
                          ? "ring-1 ring-yellow-500/40"
                          : "ring-1 ring-purple-500/30"
                      } ${(enabledMap[c.name] ?? true) ? "" : "opacity-75 grayscale"}`}
                      onClick={() =>
                        toggleEnabled(c.name, !(enabledMap[c.name] ?? true))
                      }
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-full overflow-hidden ring-2 ${
                            c.fiveStar
                              ? "ring-yellow-500/60 bg-yellow-500/10"
                              : "ring-purple-500/50 bg-purple-500/10"
                          }`}
                          title={c.name}
                        >
                          <img
                            src={buildCharacterIconPath(c.name, c.element)}
                            alt={c.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {c.name}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {c.weaponType} &bull; {c.fiveStar ? "5★" : "4★"}
                          </div>
                        </div>
                      </div>
                      <Switch
                        checked={enabledMap[c.name] ?? true}
                        className="pointer-events-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
