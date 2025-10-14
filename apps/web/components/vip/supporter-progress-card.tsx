"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/animate-ui/radix/progress"
import { Button } from "@/components/ui/button"
import { useSupporterProgress } from "@/hooks/vip/use-supporter-progress"
import { Gift, MessagesSquare, Server, TrendingUp } from "lucide-react"

export function SupporterProgressCard() {
  const {
    loading,
    error,
    totalEuros,
    hostingGoalEuros,
    eurosPerGiveaway,
    giveawaysAchieved,
    nextGiveawayAt,
    progressToNextGiveawayPct,
  } = useSupporterProgress()

  return (
    <Card className="border-amber-500/30 h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <TrendingUp className="h-4 w-4" />
          Supporter Progress
        </CardTitle>
        <CardDescription className="text-amber-100/70">
          Cumulative donations fuel hosting and community giveaways.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 flex-1 flex flex-col">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Hosting costs
            </div>
            <div>
              €{totalEuros.toFixed(2)} / €{hostingGoalEuros}
            </div>
          </div>
          <Progress
            value={Math.min(100, (totalEuros / hostingGoalEuros) * 100)}
          />
          <p className="text-xs text-muted-foreground">
            First goal: keep the lights on. Every additional €{eurosPerGiveaway}{" "}
            triggers a community giveaway.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Giveaways
            </div>
            <div>{giveawaysAchieved} hosted</div>
          </div>
          <Progress value={progressToNextGiveawayPct} />
          <p className="text-xs text-muted-foreground">
            Next giveaway at €{nextGiveawayAt}. Join our Discord for
            announcements.
          </p>
        </div>

        {loading && (
          <p className="text-xs text-muted-foreground">Loading progress…</p>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="mt-auto flex justify-end">
          <Button
            type="button"
            className="bg-amber-500 text-black hover:bg-amber-400"
            onClick={() =>
              window.open(
                `https://discord.gg/${process.env.NEXT_PUBLIC_DISCORD_INVITE}`,
                "_blank",
                "noopener,noreferrer",
              )
            }
          >
            <MessagesSquare className="mr-2 h-4 w-4" />
            Join Discord
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
