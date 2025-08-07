"use client"

import { User, Save } from "lucide-react"
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
import { useProfileInformation } from "@/hooks/account/use-profile-information"

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

          <p
            className={`text-xs ${canChangeUsername() ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
          >
            {canChangeUsername()
              ? "You can change your display name now"
              : `You can change your display name again in ${getDaysUntilUsernameChange()} days`}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user?.email} disabled />
          <p className="text-xs text-muted-foreground">
            Email address cannot be changed, contact{" "}
            <a href="/feedback" className="text-primary hover:underline">
              support
            </a>{" "}
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
