"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Shield, Crown, Users, Key, Plus, Minus, UserX } from "lucide-react"
import type { GiLobbyPrivacy } from "@/types"
import { useGiLobbyStatus } from "@/hooks/minigames/gi/use-gi-lobby-status"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"
import { CopyButton } from "@/components/animate-ui/buttons/copy"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { useGiLobbyContext } from "@/hooks/minigames/gi/lobby-provider"
import { useGiMultiplayerProfileGate } from "@/hooks/minigames/gi/use-gi-multiplayer-profile-gate"

export function GILobbyStatusCard() {
  const {
    lobby,
    isHost,
    hostUserId,
    privacy,
    members,
    membersLoading,
    handleSetPrivacy,
  } = useGiLobbyStatus()
  const { joinLobby, leaveLobby, kickMember } = useGiLobbyContext()
  const { ensureHasMultiplayerProfile } = useGiMultiplayerProfileGate()

  const loading = !lobby
  const [joinOpen, setJoinOpen] = React.useState(false)
  const [joinCode, setJoinCode] = React.useState("")
  const [joining, setJoining] = React.useState(false)
  const [leaveOpen, setLeaveOpen] = React.useState(false)
  const [kickTarget, setKickTarget] = React.useState<string | null>(null)
  const [kickOpen, setKickOpen] = React.useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lobby
          <div className="ml-auto">
            <Tooltip side="bottom">
              <TooltipTrigger>
                {isHost ? (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setJoinOpen(true)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setLeaveOpen(true)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent>
                {isHost ? "Join Multiplayer Lobby" : "Leave Lobby"}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Lobby ID
                </label>
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  {lobby?.lobbyId}
                  <CopyButton
                    content={lobby?.lobbyId || ""}
                    onCopy={() => {
                      toast.success(
                        "Lobby ID copied to clipboard",
                        toastStyles.success,
                      )
                    }}
                    variant="outline"
                    size="sm"
                    className="ml-auto"
                    disabled={!lobby?.privacy || lobby.privacy === "closed"}
                  />
                </div>
                <label className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy
                </label>
                {isHost ? (
                  <Select
                    value={privacy}
                    onValueChange={(v) => handleSetPrivacy(v as GiLobbyPrivacy)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="closed">Closed (Solo)</SelectItem>
                      {/* TODO: Add friends option */}
                      {/* <SelectItem value="friends">Friends</SelectItem> */}
                      <SelectItem value="invite-only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-muted-foreground capitalize">
                    {privacy.replace("-", " ")}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </label>
                <div className="space-y-2">
                  {membersLoading && (
                    <div className="text-xs text-muted-foreground">
                      Loading...
                    </div>
                  )}
                  {members.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-md border p-2"
                    >
                      <Avatar>
                        <AvatarImage
                          src={u.avatar || undefined}
                          alt={u.name || `User ${u.id}`}
                        />
                        <AvatarFallback>
                          {String(u.name || "U")
                            .slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate flex items-center gap-2">
                          {u.name || `User ${u.id}`}
                          {String(u.id) === String(hostUserId) && (
                            <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold">
                              <Crown className="h-3 w-3 text-yellow-500" />
                              Host
                            </span>
                          )}
                        </div>
                        {u.title ? (
                          <div className="text-xs text-muted-foreground truncate">
                            {u.title}
                          </div>
                        ) : null}
                      </div>
                      {isHost && String(u.id) !== String(hostUserId) && (
                        <div className="ml-auto">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setKickTarget(String(u.id))
                              setKickOpen(true)
                            }}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  {members.length === 0 && !membersLoading && (
                    <div className="text-xs text-muted-foreground">
                      No members yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Join a Lobby</DialogTitle>
            <DialogDescription>
              Enter a lobby ID to join. You will leave your current lobby if
              different.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Lobby ID</label>
              <Input
                placeholder="xxxx-xxxx"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setJoinOpen(false)}
                disabled={joining}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!joinCode) return
                  try {
                    setJoining(true)
                    const ok = await ensureHasMultiplayerProfile()
                    if (!ok) return
                    const res = await joinLobby({ lobbyId: joinCode })
                    if (res.ok) {
                      toast.success("Joined lobby!", toastStyles.success)
                      setJoinOpen(false)
                    } else {
                      toast.error(
                        res.error || "Failed to join lobby",
                        toastStyles.error,
                      )
                    }
                  } finally {
                    setJoining(false)
                  }
                }}
                disabled={!joinCode || joining}
              >
                {joining ? "Joining..." : "Join"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={leaveOpen} onOpenChange={setLeaveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Leave Lobby</DialogTitle>
            <DialogDescription>
              Are you sure you want to leave the lobby?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLeaveOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                const res = await leaveLobby()
                if (res.ok) {
                  toast.success("Left lobby!", toastStyles.success)
                  setLeaveOpen(false)
                } else {
                  toast.error(
                    res.error || "Failed to leave lobby",
                    toastStyles.error,
                  )
                }
              }}
            >
              Leave
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={kickOpen} onOpenChange={setKickOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Kick Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from the lobby?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setKickOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!kickTarget) return
                const res = await kickMember(kickTarget)
                if (res.ok) {
                  toast.success("Member kicked.", toastStyles.success)
                  setKickOpen(false)
                } else {
                  toast.error(
                    res.error || "Failed to kick member",
                    toastStyles.error,
                  )
                }
              }}
            >
              Kick
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
