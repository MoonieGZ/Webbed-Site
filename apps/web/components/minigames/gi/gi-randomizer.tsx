"use client"

import { useGiRandomizer } from "@/hooks/minigames/gi/use-gi-randomizer"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/tabs"
import { Counter } from "@/components/animate-ui/components/counter"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/animate-ui/radix/switch"
import {
  Dices,
  Dice5,
  Users,
  Settings2,
  Filter,
  Shuffle,
  PencilRuler,
} from "lucide-react"
import React from "react"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { useGiLobbyStatus } from "@/hooks/minigames/gi/use-gi-lobby-status"
import { useGiData } from "@/hooks/minigames/gi/use-gi-data"

export default function GIRandomizer() {
  const {
    loading,
    settings,
    setSettings,
    toggleExclusion,
    includeCharacter,
    result,
    setResult,
  } = useGiRandomizer()
  const { lobby, isHost, rollCharacters, rollBoss } = useGiLobbyContext()
  const { combineMode, refreshCombine } = useGiLobbyStatus()
  const { characters, bosses } = useGiData()

  React.useEffect(() => {
    if (!lobby) return
    const names = lobby.currentRoll?.characters || null
    const bossName = lobby.currentRoll?.boss || null
    if (!names && !bossName) return
    const charObjs = Array.isArray(names)
      ? (characters || [])
          .filter((c) => names.includes(c.name))
          .map((c) => ({ ...c, selected: false, visible: false }))
      : []
    const bossObjs = bossName
      ? (bosses || [])
          .filter((b) => b.name === bossName)
          .map((b) => ({ ...b, visible: false }))
      : []
    if (charObjs.length > 0 || bossObjs.length > 0) {
      setResult({ characters: charObjs, bosses: bossObjs })
    }
  }, [lobby?.currentRoll, characters, bosses])

  if (loading) return null

  const excluded = new Set(settings.characters.excluded)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="randomizer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="randomizer" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Randomizer
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Excluded
          </TabsTrigger>
        </TabsList>

        <TabsContents>
          <TabsContent value="randomizer" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shuffle className="h-5 w-5" />
                  Randomizer
                </CardTitle>
                <CardDescription>
                  Roll characters and bosses for your Genshin Impact team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {settings.rules.coopMode && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Co-op mode
                    </Badge>
                  )}
                  {settings.rules.limitFiveStars && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      5★ limit ({settings.rules.maxFiveStars})
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                  <Button
                    className="flex-1"
                    disabled={!!lobby && !isHost}
                    onClick={async () => {
                      if (!lobby || !isHost || !characters) return
                      if (combineMode) await refreshCombine()
                      await rollCharacters({
                        lobbyId: lobby.lobbyId,
                        characters,
                        settings,
                      })
                    }}
                  >
                    <Dice5 className="h-4 w-4 mr-2" />
                    {lobby && !isHost
                      ? "Waiting for host..."
                      : "Roll Characters"}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!!lobby && !isHost}
                    onClick={async () => {
                      if (!lobby || !isHost || !bosses) return
                      if (combineMode) await refreshCombine()
                      await rollBoss({
                        lobbyId: lobby.lobbyId,
                        bosses,
                        settings,
                      })
                    }}
                  >
                    <Dice5 className="h-4 w-4 mr-2" />
                    {lobby && !isHost ? "Waiting for host..." : "Roll Bosses"}
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!!lobby && !isHost}
                    onClick={async () => {
                      if (!lobby || !isHost || !characters || !bosses) return
                      if (combineMode) await refreshCombine()
                      await rollCharacters({
                        lobbyId: lobby.lobbyId,
                        characters,
                        settings,
                      })
                      await rollBoss({
                        lobbyId: lobby.lobbyId,
                        bosses,
                        settings,
                      })
                    }}
                  >
                    <Dices className="h-4 w-4 mr-2" />
                    {lobby && !isHost ? "Waiting for host..." : "Roll Both"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PencilRuler className="h-5 w-5" />
                  Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {settings.rules.coopMode && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span className="h-2 w-2 rounded-full bg-green-500" />
                          Co-op mode
                        </Badge>
                      )}
                      {settings.rules.limitFiveStars && (
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          5★ limit ({settings.rules.maxFiveStars})
                        </Badge>
                      )}
                      {!settings.rules.coopMode &&
                        !settings.rules.limitFiveStars && (
                          <span className="text-sm text-muted-foreground">
                            No active rules
                          </span>
                        )}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">Co-op Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Only roll bosses that support co-op.
                        </p>
                      </div>
                      <Switch
                        checked={settings.rules.coopMode}
                        onCheckedChange={(checked) =>
                          setSettings((prev) => ({
                            ...prev,
                            rules: { ...prev.rules, coopMode: checked },
                          }))
                        }
                        disabled={!isHost}
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <h4 className="text-base font-medium">5-star limit</h4>
                        <p className="text-sm text-muted-foreground">
                          Limit the number of five-star characters in a roll.
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {settings.rules.limitFiveStars && (
                          <Counter
                            number={settings.rules.maxFiveStars}
                            setNumber={(n) => {
                              if (!isHost) return
                              setSettings((p) => ({
                                ...p,
                                rules: {
                                  ...p.rules,
                                  maxFiveStars: Math.max(0, n),
                                },
                              }))
                            }}
                          />
                        )}
                        <Switch
                          checked={settings.rules.limitFiveStars}
                          onCheckedChange={(checked) =>
                            setSettings((prev) => ({
                              ...prev,
                              rules: { ...prev.rules, limitFiveStars: checked },
                            }))
                          }
                          disabled={!isHost}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="excluded">
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Excluded ({settings.characters.excluded.length})
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    {settings.enableExclusion &&
                      settings.characters.excluded.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSettings((p) => ({
                              ...p,
                              characters: { ...p.characters, excluded: [] },
                            }))
                          }
                        >
                          Reset All
                        </Button>
                      )}
                    <div className="flex items-center space-x-2 justify-end">
                      <Switch
                        id="enable-exclusion"
                        checked={settings.enableExclusion}
                        onCheckedChange={toggleExclusion}
                        disabled={!isHost}
                      />
                      <label
                        htmlFor="enable-exclusion"
                        className="text-sm cursor-pointer"
                      >
                        Enable character exclusion
                      </label>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {settings.characters.excluded.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No characters have been excluded yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {Array.from(excluded).map((name) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-2 rounded-lg border"
                      >
                        <span className="truncate text-sm flex-1 select-none">
                          {name}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => includeCharacter(name)}
                        >
                          Re-enable
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  )
}
