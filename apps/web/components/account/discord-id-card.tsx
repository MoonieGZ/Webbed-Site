import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MessagesSquare } from "lucide-react"

export function DiscordIdCard() {
  return (
    <Card>
      <CardHeader>
      <CardTitle className="flex items-center gap-2">
          <MessagesSquare className="h-4 w-4" />
          Discord ID
        </CardTitle>
        <CardDescription>Your Discord ID</CardDescription>
      </CardHeader>
      <CardContent>
        
      </CardContent>
    </Card>
  )
}
