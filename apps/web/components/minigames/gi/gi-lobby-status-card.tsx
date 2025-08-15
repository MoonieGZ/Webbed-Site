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
import {
  Shield,
  Crown,
  Users,
  Key,
  Plus,
  Minus,
  UserX,
  Cog,
  ChartPie,
  UserPen,
} from "lucide-react"
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
import { Counter } from "@/components/animate-ui/components/counter"

export function GILobbyStatusCard() {
  const {
    lobby,
    isHost,
    hostUserId,
    privacy,
    members,
    membersLoading,
    handleSetPrivacy,
    profiles,
    selectedProfileIndex,
    setSelectedProfileIndex,
    combineMode,
    setCombineMode,
    applyProfile,
    bossProfiles,
    selectedBossProfileIndex,
    setSelectedBossProfileIndex,
    applyBossProfile,
    availableCharacters,
    availableBosses,
    characterCount,
    bossCount,
    updateCharacterCount,
    updateBossCount,
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
  const [settingsOpen, setSettingsOpen] = React.useState(false)

  const [localProfile, setLocalProfile] = React.useState<string>("")
  const [localBossProfile, setLocalBossProfile] = React.useState<string>("")
  const [localCharCount, setLocalCharCount] = React.useState<number>(0)
  const [localBossCount, setLocalBossCount] = React.useState<number>(0)

  React.useEffect(() => {
    if (!settingsOpen) return
    setLocalProfile(
      combineMode
        ? "__combine__"
        : selectedProfileIndex
          ? String(selectedProfileIndex)
          : "",
    )
    setLocalBossProfile(
      selectedBossProfileIndex ? String(selectedBossProfileIndex) : "",
    )
    setLocalCharCount(characterCount)
    setLocalBossCount(bossCount)
  }, [settingsOpen])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Lobby
          <div className="ml-auto flex items-center gap-2">
            {isHost && (
              <Tooltip side="bottom">
                <TooltipTrigger>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Cog className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Lobby Settings</TooltipContent>
              </Tooltip>
            )}
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
                  <ChartPie className="h-4 w-4" />
                  Available
                </label>
                <div className="space-y-2 border rounded-lg p-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm justify-between w-full">
                    <span>
                      {availableCharacters}{" "}
                      <span className="text-xs text-muted-foreground">
                        Characters
                      </span>
                    </span>
                    <span>
                      {availableBosses}{" "}
                      <span className="text-xs text-muted-foreground">
                        Bosses
                      </span>
                    </span>
                  </div>
                </div>
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
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent from="top" className="max-w-md">
          <DialogHeader>
            <DialogTitle>Lobby Settings</DialogTitle>
            <DialogDescription>
              Configure profiles and roll counts for this lobby.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserPen className="h-4 w-4" />
                Profile
              </label>
              <Select
                value={localProfile}
                onValueChange={(v) => setLocalProfile(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No profiles found
                    </div>
                  ) : (
                    profiles.map((p) => (
                      <SelectItem
                        key={p.profileIndex}
                        value={String(p.profileIndex)}
                      >
                        {p.profileIndex} — {p.name || "Profile"}
                      </SelectItem>
                    ))
                  )}
                  <SelectItem value="__combine__">
                    Combine: Multiplayer Profiles
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserPen className="h-4 w-4" />
                Boss Profile
              </label>
              <Select
                value={localBossProfile}
                onValueChange={(v) => setLocalBossProfile(v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a boss profile" />
                </SelectTrigger>
                <SelectContent>
                  {bossProfiles.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No boss profiles found
                    </div>
                  ) : (
                    bossProfiles.map((p) => (
                      <SelectItem
                        key={p.profileIndex}
                        value={String(p.profileIndex)}
                      >
                        {p.profileIndex} — {p.name || "Profile"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Cog className="h-4 w-4" />
                Roll Counts
              </label>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Characters</span>
                <Counter
                  number={localCharCount}
                  setNumber={(n) =>
                    setLocalCharCount(
                      Math.max(1, Math.min(availableCharacters, n)),
                    )
                  }
                />
                <span className="text-muted-foreground">Bosses</span>
                <Counter
                  number={localBossCount}
                  setNumber={(n) =>
                    setLocalBossCount(Math.max(1, Math.min(availableBosses, n)))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setSettingsOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Apply character profile selection
                  if (localProfile === "__combine__") {
                    setCombineMode(true)
                    setSelectedProfileIndex(null)
                  } else {
                    setCombineMode(false)
                    const idx = Number(localProfile)
                    if (Number.isFinite(idx)) {
                      setSelectedProfileIndex(idx)
                      applyProfile(idx)
                    }
                  }
                  // Apply boss profile selection
                  {
                    const idx = Number(localBossProfile)
                    if (Number.isFinite(idx)) {
                      setSelectedBossProfileIndex(idx)
                      applyBossProfile(idx)
                    }
                  }
                  // Apply counts
                  updateCharacterCount(localCharCount)
                  updateBossCount(localBossCount)
                  setSettingsOpen(false)
                  toast.success("Lobby settings saved.", toastStyles.success)
                }}
              >
                Save
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
