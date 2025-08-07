"use client"

import { User, Camera, Download } from "lucide-react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AvatarGroup } from "@/components/animate-ui/components/avatar-group"
import { useAvatar } from "@/hooks/account/use-avatar"

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
          <Camera className="h-5 w-5" />
          Avatar
        </CardTitle>
        <CardDescription>Upload a new profile picture</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              disabled={isUploadingAvatar}
              className="w-full text-muted-foreground file:border-input file:text-foreground p-0 pr-3 italic file:me-3 file:h-full file:border-0 file:border-e file:border-solid file:bg-primary file:text-primary-foreground file:px-3 file:text-sm file:font-medium file:not-italic file:leading-none file:py-2.25 file:hover:bg-primary/90 file:transition-colors"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleGravatarImport}
                disabled={isUploadingAvatar}
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

        {recentAvatars.length > 0 && (
          <div className="space-y-3">
            <div className="space-y-2">
              <CardTitle>Recent Avatars</CardTitle>
              <AvatarGroup
                invertOverlap
                className="h-16 -space-x-4.5 flex items-center justify-center"
              >
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

              <p className="text-xs text-muted-foreground text-center">
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
