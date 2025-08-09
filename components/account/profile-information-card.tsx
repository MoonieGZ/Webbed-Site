"use client"

import { User, Save, Check, Clock } from "lucide-react"
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useProfileInformation } from "@/hooks/account/use-profile-information"
import Link from "next/link"

export function ProfileInformationCard() {
  const {
    user,
    loading,
    newUsername,
    setNewUsername,
    isChangingUsername,
    canChangeUsername,
    getDaysUntilUsernameChange,
    handleUsernameChange,
  } = useProfileInformation()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-40 ms-auto" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-3 w-20" />
          </div>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Information
        </CardTitle>
        <CardDescription>
          Manage your account details and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Display Name</Label>
          <div className="flex rounded-md shadow-xs">
            <Input
              id="username"
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder={
                user?.name.startsWith("User #")
                  ? "Enter new username"
                  : user?.name
              }
              maxLength={32}
              className="-me-px rounded-e-none shadow-none focus-visible:z-1"
              disabled={!canChangeUsername()}
              autoComplete="off"
              spellCheck={false}
              aria-describedby="username-help username-count"
            />
            <Button
              className="rounded-s-none"
              onClick={handleUsernameChange}
              disabled={
                isChangingUsername ||
                !canChangeUsername() ||
                newUsername.trim() === user?.name ||
                newUsername.trim() === ""
              }
            >
              {isChangingUsername ? (
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
          <div className="flex items-center justify-between">
            <p
              id="username-help"
              aria-live="polite"
              className="text-xs text-muted-foreground"
            >
              {canChangeUsername() ? (
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400">
                  <Check className="h-3.5 w-3.5" /> You can change your display
                  name now
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
                  <Clock className="h-3.5 w-3.5" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="underline underline-offset-2 decoration-dotted cursor-help">
                        Available in {getDaysUntilUsernameChange()} days
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      You can change your display name once every 30 days.
                    </TooltipContent>
                  </Tooltip>
                </span>
              )}
            </p>
            <p id="username-count" className="text-xs text-muted-foreground">
              {newUsername.trim().length}/32
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email} disabled />
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed, contact{" "}
            <Link href="/support" className="text-primary hover:underline">
              support
            </Link>{" "}
            if you need to change it
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rank">Rank</Label>
          <Input id="rank" value={user?.rank || "User"} disabled />
          <p className="text-xs text-muted-foreground">
            Rank is managed by administrators
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
