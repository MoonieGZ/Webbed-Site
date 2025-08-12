"use client"

import { User, Camera, Download, TriangleAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/animate-ui/components/avatar-group"
import { useAvatar } from "@/hooks/account/use-avatar"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function AvatarCard() {
  const {
    user,
    loading,
    isUploadingAvatar,
    recentAvatars,
    onAvatarFileChange,
    handleGravatarImport,
    handleSetRecentAvatar,
  } = useAvatar()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Avatar
          </CardTitle>
          <CardDescription>Upload a new profile picture</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-9 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-40" />
              </div>
              <Skeleton className="h-3 w-52 ms-auto" />
            </div>
          </div>
          <Separator className="mx-2" />
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <div className="flex gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="size-16 rounded-full" />
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
          <Camera className="h-5 w-5" />
          Avatar
        </CardTitle>
        <CardDescription>Upload a new profile picture</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {user &&
        (user as any).permissions &&
        !(user as any).permissions.can_change_avatar ? (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm flex items-center text-amber-500">
            <TriangleAlert className="h-4 w-4 mr-2 text-amber-500" />
            <span>
              Changing profile picture has been restricted for your account.
              <br />
              If you think this is an error, please contact{" "}
              <Link href="/support" className="text-primary hover:underline">
                support
              </Link>
              .
            </span>
          </div>
        ) : null}
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 shrink-0">
            <AvatarImage src={user?.avatar} alt={user?.name} />
            <AvatarFallback>
              <User className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2 flex-1">
            <Input
              id="avatar-upload"
              type="file"
              accept="image/*"
              onChange={onAvatarFileChange}
              disabled={
                isUploadingAvatar ||
                !(user as any)?.permissions?.can_change_avatar
              }
              className="w-full text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-e file:border-solid file:bg-primary file:text-primary-foreground file:px-3 file:text-sm file:font-medium file:not-italic file:leading-none file:py-2.25 file:hover:bg-primary/90 file:transition-colors"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleGravatarImport}
                disabled={
                  isUploadingAvatar ||
                  !(user as any)?.permissions?.can_change_avatar
                }
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {isUploadingAvatar ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Import Gravatar
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-end">
              JPG, PNG, GIF, WEBP up to 5MB &bull; Or import from{" "}
              <a
                href="https://gravatar.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Gravatar
              </a>
            </p>
          </div>
        </div>

        <Separator className="mx-2" />

        {recentAvatars.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <CardTitle>Recent Avatars</CardTitle>
              <AvatarGroup invertOverlap className="h-16 -space-x-4.5 flex">
                {recentAvatars.map((avatar, index) => (
                  <Avatar
                    key={index}
                    className="size-16 border-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0 hover:scale-110 hover:z-10"
                    onClick={() => handleSetRecentAvatar(avatar.filename)}
                  >
                    <AvatarImage src={avatar.src} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>

              <p className="text-xs text-muted-foreground">
                Click any avatar to set it as your current profile picture
                &bull; Last 5 avatars are shown here
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
