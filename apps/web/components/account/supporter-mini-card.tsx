import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BadgeCheck, Crown, MessagesSquare } from "lucide-react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"

export function SupporterMiniCard() {
  const router = useRouter()

  return (
    <Card className="relative overflow-hidden border-amber-500/30 bg-gradient-to-br from-zinc-900 via-zinc-900 to-amber-900/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <Crown className="h-4 w-4" />
          Supporter Perks
        </CardTitle>
        <CardDescription className="text-amber-100/70">
          Donate <strong>€5 or more</strong> to unlock your Supporter badge and
          access the VIP area. Thanks for helping keep this project running -
          more exclusive perks are coming soon!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 justify-end">
        <Button variant="outline" onClick={() => router.push("/vip")} className="w-[125px]">
          <>
            <BadgeCheck className="h-4 w-4" />
            VIP Page
          </>
        </Button>
        <Button variant="outline" onClick={() => window.open(`https://discord.gg/${process.env.NEXT_PUBLIC_DISCORD_INVITE}`, "_blank")} className="w-[125px]">
          <>
            <MessagesSquare className="h-4 w-4" />
            Join Discord
          </>
        </Button>
        </div>
      </CardContent>
    </Card>
  )
}

