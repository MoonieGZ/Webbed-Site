"use client"

import React from "react"
import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useGiRollResult } from "@/hooks/games/gi/use-gi-roll-result"
import {
  buildBossIconPath,
  buildCharacterIconPath,
} from "@/lib/games/gi/icon-path"
import { cn } from "@/lib/utils"
import { Shuffle, Loader2, Save } from "lucide-react"
import { Checkbox } from "@/components/animate-ui/radix/checkbox"
import { Button } from "@/components/ui/button"
import { useGiRandomizer } from "@/hooks/games/gi/use-gi-randomizer"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { useGiLobbyContext } from "@/hooks/games/gi/lobby-provider"

export function GIRollResultCard() {
  const { hasResult, rolledCharacters, rolledBosses } = useGiRollResult()
  const { excludeCharacter } = useGiRandomizer()
  const { isHost } = useGiLobbyContext()
  const [revealedCharCount, setRevealedCharCount] = React.useState(0)
  const [revealedBossCount, setRevealedBossCount] = React.useState(0)
  const [charRollId, setCharRollId] = React.useState(0)
  const [bossRollId, setBossRollId] = React.useState(0)
  const [selectedChars, setSelectedChars] = React.useState<
    Record<string, boolean>
  >({})

  const charSig = React.useMemo(
    () =>
      rolledCharacters.length
        ? rolledCharacters.map((c) => c.name).join("|")
        : "",
    [rolledCharacters],
  )
  const bossSig = React.useMemo(
    () =>
      rolledBosses.length ? rolledBosses.map((b) => b.name).join("|") : "",
    [rolledBosses],
  )

  React.useEffect(() => {
    if (!hasResult) return
    setCharRollId((id) => id + 1)
    setRevealedCharCount(0)
    let idx = 0
    const total = rolledCharacters.length
    const timer = window.setInterval(() => {
      idx += 1
      setRevealedCharCount((n) => Math.min(total, Math.max(n, idx)))
      if (idx >= total) window.clearInterval(timer)
    }, 500)
    return () => window.clearInterval(timer)
  }, [hasResult, charSig])

  React.useEffect(() => {
    if (!hasResult) return
    setBossRollId((id) => id + 1)
    setRevealedBossCount(0)
    let idx = 0
    const total = rolledBosses.length
    const timer = window.setInterval(() => {
      idx += 1
      setRevealedBossCount((n) => Math.min(total, Math.max(n, idx)))
      if (idx >= total) window.clearInterval(timer)
    }, 500)
    return () => window.clearInterval(timer)
  }, [hasResult, bossSig])
  if (!hasResult) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Roll Result
        </CardTitle>
        <CardDescription>Latest rolled characters and bosses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {rolledBosses.length > 0 && (
            <section>
              <div className="text-xl font-medium flex items-center gap-2 mb-3">
                Bosses ({rolledBosses.length})
              </div>
              <div className="results-grid">
                {rolledBosses.map((b, idx) => {
                  const bossImg = buildBossIconPath(b.name, b.location)
                  return (
                    <div
                      key={`${bossRollId}-${b.name}`}
                      className="relative group"
                    >
                      {idx < revealedBossCount ? (
                        <div
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-md ring-1 ring-border boss-card animate-appear",
                            b.legendary && "legend-gradient",
                          )}
                        >
                          <Image
                            src={bossImg}
                            alt={b.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                          />
                          {b.legendary && (
                            <div className="absolute top-1 right-1">
                              <Badge variant="secondary">Legend</Badge>
                            </div>
                          )}
                          <div className="boss-info-overlay">
                            <p
                              className="font-medium text-white truncate"
                              title={b.name}
                            >
                              {b.name}
                            </p>
                            <p className="text-xs text-white/75 truncate">
                              {b.location}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-square overflow-hidden rounded-md ring-1 ring-border boss-card flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {rolledCharacters.length > 0 && (
            <section>
              <div className="text-xl font-medium flex items-center gap-2 mb-3">
                Characters ({rolledCharacters.length})
              </div>
              <div className="results-grid">
                {rolledCharacters.map((c, idx) => {
                  const charImg = buildCharacterIconPath(c.name, c.element)
                  const isSelected = !!selectedChars[c.name]
                  return (
                    <div
                      key={`${charRollId}-${c.name}`}
                      className="relative group"
                    >
                      {idx < revealedCharCount ? (
                        <div
                          className={cn(
                            "relative aspect-square overflow-hidden rounded-md ring-1 ring-border character-card animate-appear",
                            c.fiveStar
                              ? "rarity-5-gradient"
                              : "rarity-4-gradient",
                          )}
                          onClick={() => {
                            if (!isHost) return
                            setSelectedChars((prev) => ({
                              ...prev,
                              [c.name]: !isSelected,
                            }))
                          }}
                          role={isHost ? "button" : undefined}
                          aria-pressed={isHost ? isSelected : undefined}
                          style={{ cursor: isHost ? "pointer" : undefined }}
                        >
                          {isHost && (
                            <div className="card-corner-element right">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  setSelectedChars((prev) => ({
                                    ...prev,
                                    [c.name]: Boolean(checked),
                                  }))
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                          <Image
                            src={charImg}
                            alt={c.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                          />
                          <div className="character-info-overlay">
                            <p
                              className="font-medium text-white truncate"
                              title={c.name}
                            >
                              {c.name}
                            </p>
                            <p className="text-xs text-white/75 truncate">
                              {c.element}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-square overflow-hidden rounded-md ring-1 ring-border character-card flex items-center justify-center">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
              {isHost && Object.values(selectedChars).some(Boolean) && (
                <div className="flex justify-end mt-4">
                  <Button
                    size="sm"
                    onClick={() => {
                      const names = Object.entries(selectedChars)
                        .filter(([, v]) => v)
                        .map(([k]) => k)
                      if (names.length === 0) return
                      excludeCharacter(names)
                      setSelectedChars({})
                      toast.success(
                        "Saved selection. These characters will be excluded from future rolls.",
                        toastStyles.success,
                      )
                    }}
                  >
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
