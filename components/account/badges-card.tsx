"use client"

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
import { motion } from "motion/react"
import { Save } from "lucide-react"

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
          <CardTitle>Badges</CardTitle>
          <CardDescription>
            Manage and feature your profile badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badges</CardTitle>
        <CardDescription>
          Choose up to 3 badges to feature on your public profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-medium mb-2">Featured Badges</div>
          <div className="grid grid-cols-3 gap-2">
            {([0, 1, 2] as const).map((idx) => {
              const badge = featuredBadges[idx]
              return (
                <div
                  key={idx}
                  className="rounded-md border p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        {badge ? iconFor(badge.icon_url) : null}
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">
                          {badge ? badge.name : `Empty Slot ${idx + 1}`}
                        </div>
                        <div className="text-muted-foreground text-xs">
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
          <div className="text-sm font-medium">Your Badges</div>
          {ownedBadges.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              You haven't earned any badges yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {ownedBadges.map((b) => {
                const isFeaturedIndex = featuredSlots.findIndex(
                  (id) => id === b.id,
                )
                return (
                  <motion.button
                    key={b.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const emptyIndex = featuredSlots.findIndex(
                        (id) => id == null,
                      )
                      const targetIndex =
                        isFeaturedIndex >= 0
                          ? (isFeaturedIndex + 1) % 3
                          : emptyIndex >= 0
                            ? emptyIndex
                            : 0
                      assignBadgeToSlot(b.id, targetIndex)
                    }}
                    className="rounded-md border p-3 text-left hover:bg-accent/50 flex items-center gap-3"
                  >
                    <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                      {iconFor(b.icon_url)}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {b.name}
                        {isFeaturedIndex >= 0 ? (
                          <span className="text-xs text-muted-foreground">
                            (Slot {isFeaturedIndex + 1})
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {b.description}
                      </div>
                    </div>
                  </motion.button>
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
