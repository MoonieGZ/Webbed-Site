"use client"

import { useGiRandomizer } from "@/hooks/games/gi/use-gi-randomizer"
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
  X,
  RotateCcw,
} from "lucide-react"
import Image from "next/image"
import { buildCharacterIconPath } from "@/lib/games/gi/icon-path"
import React from "react"
import { useGiLobbyContext } from "@/hooks/games/gi/lobby-provider"
import { useGiLobbyStatus } from "@/hooks/games/gi/use-gi-lobby-status"
import { useGiDataContext } from "@/hooks/games/gi/gi-data-provider"
import { GIRollResultCard } from "@/components/games/gi/gi-roll-result"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import type { GiBoss, GiCharacter, GiRandomizerSettings } from "@/types"

export default function GIRandomizer() {
  const {
    loading,
    settings,
    setSettings,
    getCandidateCharacters,
    getCandidateBosses,
    toggleExclusion,
    includeCharacter,
    setResult,
  } = useGiRandomizer()
  const { lobby, isHost, rollCharacters, rollBoss } = useGiLobbyContext()
  const { combineMode, refreshCombine } = useGiLobbyStatus()
  const { characters, bosses } = useGiDataContext()

  React.useEffect(() => {
    if (!lobby) return
    const names = lobby.currentRoll?.characters || null
    const bossName = lobby.currentRoll?.boss || null
    if (!names && !bossName) return
    const charObjs = Array.isArray(names)
      ? (characters || [])
          .filter((c: GiCharacter) => names.includes(c.name))
          .map((c: GiCharacter) => ({ ...c, selected: false, visible: false }))
      : []
    const bossObjs = bossName
      ? (bosses || [])
          .filter((b: GiBoss) => b.name === bossName)
          .map((b: GiBoss) => ({ ...b, visible: false }))
      : []
    if (charObjs.length > 0 || bossObjs.length > 0) {
      setResult({ characters: charObjs, bosses: bossObjs })
    }
  }, [lobby?.currentRoll, characters, bosses])

  if (loading) return null

  const excluded = new Set<string>(settings.characters.excluded)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="randomizer" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="randomizer" className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            Randomizer
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="excluded" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
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
                      const candidates = getCandidateCharacters()
                      await rollCharacters({
                        lobbyId: lobby.lobbyId,
                        characters: candidates,
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
                      const candidates = getCandidateBosses()
                      await rollBoss({
                        lobbyId: lobby.lobbyId,
                        bosses: candidates,
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
                      const c = getCandidateCharacters()
                      const b = getCandidateBosses()
                      await rollCharacters({
                        lobbyId: lobby.lobbyId,
                        characters: c,
                        settings,
                      })
                      await rollBoss({
                        lobbyId: lobby.lobbyId,
                        bosses: b,
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

            <GIRollResultCard />
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
                          setSettings((prev: GiRandomizerSettings) => ({
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
                              setSettings((p: GiRandomizerSettings) => ({
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
                            setSettings((prev: GiRandomizerSettings) => ({
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
                    <Filter className="h-5 w-5" />
                    Excluded ({settings.characters.excluded.length})
                  </div>
                  <div className="flex items-center space-x-2 justify-end">
                    {settings.enableExclusion &&
                      settings.characters.excluded.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSettings((p: GiRandomizerSettings) => ({
                              ...p,
                              characters: { ...p.characters, excluded: [] },
                            }))
                          }
                        >
                          <RotateCcw className="h-4 w-4" />
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
                {!settings.enableExclusion ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Exclusion is disabled.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Enable it above to use this feature.
                    </p>
                  </div>
                ) : excluded.size === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No characters have been excluded yet.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {Array.from(excluded).map((name: string) => {
                      const info = (characters || []).find(
                        (c: GiCharacter) => c.name === name,
                      )
                      const thumb = info
                        ? buildCharacterIconPath(info.name, info.element)
                        : null
                      const gradient = info?.fiveStar
                        ? "rarity-5-gradient"
                        : "rarity-4-gradient"
                      const border = info?.fiveStar
                        ? "border-accent-5"
                        : "border-accent-4"
                      return (
                        <div
                          key={name}
                          className="relative group cursor-pointer rounded-md overflow-hidden border border-border hover:border-primary transition-colors h-18 flex items-center gap-2 px-3"
                          onClick={() => {
                            includeCharacter(name)
                            toast.success(
                              "Character re-enabled.",
                              toastStyles.success,
                            )
                          }}
                        >
                          <div
                            className={`relative h-12 w-12 rounded-sm overflow-hidden flex-shrink-0 mr-2 border-2 ${border}`}
                          >
                            <div className={`absolute inset-0 ${gradient}`} />
                            {thumb && (
                              <Image
                                src={thumb}
                                alt={name}
                                fill
                                className="object-cover relative z-10"
                                sizes="48px"
                              />
                            )}
                          </div>
                          <span className="truncate text-sm flex-1 select-none">
                            {name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation()
                              includeCharacter(name)
                              toast.success(
                                "Character re-enabled.",
                                toastStyles.success,
                              )
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
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
