import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HeartHandshake, Send } from "lucide-react"
import { useVIPSupport } from "@/hooks/vip/use-vip-support"

export function SupporterCard() {
  const {
    donationId,
    setDonationId,
    paypalEmail,
    setPaypalEmail,
    discordUsername,
    setDiscordUsername,
    submitting,
    submit,
  } = useVIPSupport()

  return (
    <Card className="border-amber-500/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <HeartHandshake className="h-4 w-4" />
          Become a Supporter
        </CardTitle>
        <CardDescription className="text-amber-100/70">
          Submit your donation details to unlock the Supporter badge and access
          to the VIP area.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="donationId">PayPal Donation ID</Label>
            <Input
              id="donationId"
              placeholder="e.g., 3FH12345AB6789012"
              value={donationId}
              onChange={(e) => setDonationId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="paypalEmail">PayPal Email</Label>
            <Input
              id="paypalEmail"
              type="email"
              placeholder="your-paypal-email@example.com"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discordUsername">Discord Username (optional)</Label>
            <Input
              id="discordUsername"
              type="text"
              placeholder="your-discord-username"
              value={discordUsername}
              onChange={(e) => setDiscordUsername(e.target.value)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Once submitted, we&apos;ll validate your donation and manually
            assign your Supporter badge. This can take up to 24 hours.
          </p>
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={submitting || !donationId || !paypalEmail}
              className="bg-amber-500 text-black hover:bg-amber-400"
            >
              <Send className="mr-2 h-4 w-4" />
              {submitting ? "Submitting..." : "Submit Details"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
