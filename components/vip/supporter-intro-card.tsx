import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  BadgeCheck,
  Crown,
  ExternalLink,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export function SupporterIntroCard() {
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
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-4">
            <div className="flex gap-3">
              <BadgeCheck className="h-5 w-5 text-amber-300 self-center" />
              <div className="flex flex-col">
                <div className="text-sm font-medium text-amber-300">Badge</div>
                <div className="text-sm text-amber-100/80">
                  Golden Supporter flair
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-4">
            <div className="flex gap-3">
              <ShieldCheck className="h-5 w-5 text-amber-300 self-center" />
              <div className="flex flex-col">
                <div className="text-sm font-medium text-amber-300">
                  VIP Area
                </div>
                <div className="text-sm text-amber-100/80">
                  Exclusive role and area in Discord
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-4">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-amber-300 self-center" />
              <div className="flex flex-col">
                <div className="text-sm font-medium text-amber-300">
                  ... and more!
                </div>
                <div className="text-sm text-amber-100/80">
                  More perks coming soon
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-amber-100/70">
            Donations are processed via PayPal. After donating, submit your
            details below. Badge assignment may take up to 24 hours.
          </p>
          <Button
            asChild
            variant="default"
            className="bg-amber-500 text-black hover:bg-amber-400"
          >
            <Link
              href="https://www.paypal.com/donate/?hosted_button_id=N6L8X5DZTZ762"
              target="_blank"
              rel="noopener noreferrer"
            >
              Donate via PayPal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
