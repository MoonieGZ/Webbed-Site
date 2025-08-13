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
  Minus,
  Plus,
  Dices,
  Dice5,
  Users,
  Settings2,
  Filter,
  ChartPie,
  SlidersHorizontal,
  Shuffle,
  PencilRuler,
} from "lucide-react"
import React from "react"

function MetricStat({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartPie className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-start">
        <p className="text-3xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function CounterStat({
  title,
  value,
  onChange,
  min = 1,
  max = Number.MAX_SAFE_INTEGER,
}: {
  title: string
  value: number
  onChange: (n: number) => void
  min?: number
  max?: number
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SlidersHorizontal className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-end">
        <Counter
          number={value}
          setNumber={(n) => onChange(Math.max(min, Math.min(max, n)))}
        />
      </CardContent>
    </Card>
  )
}

export default function GIRandomizer() {
  const {
    loading,
    settings,
    setSettings,
    availableCharacters,
    availableBosses,
    updateCharacterCount,
    updateBossCount,
    toggleExclusion,
    includeCharacter,
    result,
    handleRandomize,
    acceptSelected,
  } = useGiRandomizer()

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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricStat
                title="Available Characters"
                value={availableCharacters}
              />
              <MetricStat title="Available Bosses" value={availableBosses} />
              <CounterStat
                title="Character count"
                value={settings.characters.count}
                onChange={(n) => updateCharacterCount(n)}
                min={1}
                max={availableCharacters}
              />
              <CounterStat
                title="Boss count"
                value={settings.bosses.count}
                onChange={(n) => updateBossCount(n)}
                min={1}
                max={availableBosses}
              />
            </div>

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
                    onClick={() => handleRandomize("characters")}
                  >
                    <Dice5 className="h-4 w-4 mr-2" />
                    Roll Characters
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleRandomize("bosses")}
                  >
                    <Dice5 className="h-4 w-4 mr-2" />
                    Roll Bosses
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => handleRandomize("combined")}
                  >
                    <Dices className="h-4 w-4 mr-2" />
                    Roll Both
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
                            setNumber={(n) =>
                              setSettings((p) => ({
                                ...p,
                                rules: {
                                  ...p.rules,
                                  maxFiveStars: Math.max(0, n),
                                },
                              }))
                            }
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
