import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { MessagesSquare, Save } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDiscordId } from "@/hooks/account/use-discord-id"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function DiscordIdCard() {
  const { discordId, saveDiscordId, setDiscordId, isSaving, isLoading } =
    useDiscordId()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          Discord ID
        </CardTitle>
        <CardDescription>
          Enter your ID to allow notifications for various services.
          <br />
          Not sure how to get your ID?{" "}
          <Link
            className="text-primary hover:underline"
            href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"
            target="_blank"
          >
            Check this guide!
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-36 bg-muted animate-pulse rounded" />
            <Skeleton className="h-10 w-full bg-muted animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor={`discord`}>Discord ID</Label>
            <div className="flex rounded-md shadow-xs">
              <Input
                id={`discord`}
                type="text"
                placeholder="123456123456"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                className="-me-px rounded-e-none shadow-none focus-visible:z-1"
                disabled={isSaving || isLoading}
              />
              <Button
                className="rounded-s-none"
                onClick={() => saveDiscordId()}
                disabled={isSaving || isLoading}
              >
                {isSaving ? (
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
        )}
      </CardContent>
    </Card>
  )
}
