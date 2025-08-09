"use client"

import type { DragEvent } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useBadges } from "@/hooks/account/use-badges"
import * as LucideIcons from "lucide-react"
import { Award, Save } from "lucide-react"

export function BadgesCard() {
  const {
    ownedBadges,
    featuredSlots,
    featuredBadges,
    loading,
    saving,
    hasUnsavedChanges,
    assignBadgeToSlot,
    clearSlot,
    moveFeaturedBadge,
    saveFeatured,
  } = useBadges()

  const iconFor = (iconName?: string) => {
    if (!iconName) return null
    const Icon = (LucideIcons as any)[iconName]
    if (!Icon) return null
    return <Icon className="h-4 w-4" />
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges
          </CardTitle>
          <CardDescription>
            Manage and feature your profile badges
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <CardTitle className="flex items-center gap-2">Featured Badges</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-md border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-md" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">Your Badges</CardTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-md border p-3 flex items-center gap-3"
                >
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Badges
        </CardTitle>
        <CardDescription>
          Feature up to 3 badges on your public profile (drag and drop
          available)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <CardTitle className="flex items-center gap-2">Featured Badges</CardTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
            {([0, 1, 2] as const).map((idx) => {
              const badge = featuredBadges[idx]
              return (
                <div
                  key={idx}
                  className="rounded-md border p-3 flex flex-col gap-2"
                  draggable={!!badge}
                  onDragStart={(e: DragEvent<HTMLDivElement>) => {
                    if (!badge) return
                    e.dataTransfer.setData("text/source", "slot")
                    e.dataTransfer.setData("text/fromIndex", String(idx))
                  }}
                  onDragOver={(e: DragEvent<HTMLDivElement>) => {
                    e.preventDefault()
                  }}
                  onDrop={(e: DragEvent<HTMLDivElement>) => {
                    const sourceType = e.dataTransfer.getData("text/source")
                    const badgeIdStr = e.dataTransfer.getData("text/badgeId")
                    const fromIndexStr =
                      e.dataTransfer.getData("text/fromIndex")
                    if (sourceType === "owned" && badgeIdStr) {
                      const badgeId = Number(badgeIdStr)
                      assignBadgeToSlot(badgeId, idx)
                    } else if (sourceType === "slot" && fromIndexStr) {
                      const fromIndex = Number(fromIndexStr)
                      moveFeaturedBadge(fromIndex, idx)
                    }
                  }}
                >
                  <div className="flex items-center justify-between gap-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {badge ? iconFor(badge.icon_url) : null}
                      </div>
                      <div className="text-sm min-w-0">
                        <div className="font-medium truncate">
                          {badge ? badge.name : `Empty Slot ${idx + 1}`}
                        </div>
                        <div className="text-muted-foreground text-xs line-clamp-2">
                          {badge ? badge.description : "Select a badge below"}
                        </div>
                      </div>
                    </div>
                    {badge ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => clearSlot(idx)}
                      >
                        Clear
                      </Button>
                    ) : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Slot {idx + 1}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <CardTitle className="flex items-center gap-2">Your Badges</CardTitle>
          {ownedBadges.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You haven't earned any badges yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {ownedBadges.map((b) => {
                const isFeaturedIndex = featuredSlots.findIndex(
                  (id) => id === b.id,
                )
                return (
                  <button
                    key={b.id}
                    draggable
                    onDragStart={(e: DragEvent<HTMLButtonElement>) => {
                      e.dataTransfer.setData("text/source", "owned")
                      e.dataTransfer.setData("text/badgeId", String(b.id))
                    }}
                    onClick={() => {
                      if (isFeaturedIndex >= 0) {
                        clearSlot(isFeaturedIndex)
                        return
                      }
                      const emptyIndex = featuredSlots.findIndex(
                        (id) => id == null,
                      )
                      if (emptyIndex >= 0) {
                        assignBadgeToSlot(b.id, emptyIndex)
                      }
                    }}
                    className="rounded-md border p-3 text-left hover:bg-accent/50 flex items-center gap-3 active:scale-[0.98] transition-transform min-w-0"
                  >
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {iconFor(b.icon_url)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium flex items-center gap-2 truncate">
                        {b.name}
                        {isFeaturedIndex >= 0 ? (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            (Slot {isFeaturedIndex + 1})
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {b.description}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            onClick={saveFeatured}
            disabled={!hasUnsavedChanges || saving}
          >
            {saving ? (
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
      </CardContent>
    </Card>
  )
}
