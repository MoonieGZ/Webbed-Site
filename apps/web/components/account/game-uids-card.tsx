"use client"

import { Gamepad2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useGameUIDs, GAME_INFO } from "@/hooks/account/use-game-uids"
import type { GameType } from "@/types/game-uid"

export function GameUIDsCard() {
  const {
    loading,
    uidInputs,
    saveGameUID,
    updateUidInput,
    getGameUID,
    isSaving,
  } = useGameUIDs()

  const title = "Game UIDs"
  const description = "Manage your UIDs for various games"

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gamepad2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          {(Object.keys(GAME_INFO) as GameType[]).map((game) => {
            const gameUID = getGameUID(game)
            const gameInfo = GAME_INFO[game]
            const currentUid = uidInputs[game]

            return (
              <div key={game} className="space-y-2">
                <Label htmlFor={`uid-${game}`}>{gameInfo.name}</Label>
                <div className="flex rounded-md shadow-xs">
                  <Input
                    id={`uid-${game}`}
                    type="text"
                    placeholder={gameInfo.placeholder}
                    value={currentUid}
                    onChange={(e) => updateUidInput(game, e.target.value)}
                    className="-me-px rounded-e-none shadow-none focus-visible:z-1"
                    disabled={isSaving(game)}
                  />
                  <Button
                    className="rounded-s-none"
                    onClick={() => saveGameUID(game)}
                    disabled={isSaving(game)}
                  >
                    {isSaving(game) ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
