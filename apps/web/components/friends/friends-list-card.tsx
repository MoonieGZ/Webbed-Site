"use client"
import * as React from "react"
import { useFriendsList } from "@/hooks/account/use-friends-list"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Users } from "lucide-react"
import { FriendsManagementBar } from "@/components/friends/friends-management-bar"
import { AddFriendDialog } from "@/components/friends/add-friend-dialog"
import Link from "next/link"
import { iconForBadge } from "@/lib/icon-utils"
import { Checkbox } from "@/components/animate-ui/radix/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/animate-ui/components/tooltip"

export function FriendsListCard() {
  const {
    friends,
    q,
    setQ,
    loading,
    page,
    setPage,
    total,
    pageSize,
    selected,
    toggleSelect,
    removeSelected,
  } = useFriendsList()
  const [open, setOpen] = React.useState(false)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends
          </CardTitle>
          <CardDescription>
            Your friends, with mutual friends you can play minigames together.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
                <Search className="size-4" />
              </div>
              <Input
                id="search"
                value={q}
                placeholder="Search by username"
                onChange={(e) => setQ(e.target.value)}
                className="peer ps-9 placeholder:text-muted-foreground"
                autoComplete="off"
                inputMode="search"
                name="search"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {friends.map((f) => (
              <div
                key={f.id}
                className="rounded-md border p-3 flex items-center gap-3 select-none"
                onClick={() => toggleSelect(f.id)}
                role="button"
              >
                <Link
                  href={`/user/${f.id}`}
                  className="shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={f.avatar || undefined} />
                    <AvatarFallback>{f.name?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/user/${f.id}`}
                      className="text-sm font-medium truncate hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {f.name}
                    </Link>
                    {f.title ? (
                      <Link
                        href={`/user/${f.id}`}
                        className="block text-xs text-muted-foreground truncate hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {f.title}
                      </Link>
                    ) : null}
                  </div>
                  {f.badges.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {f.badges.slice(0, 3).map((b) => (
                        <Tooltip key={b.id} side="bottom">
                          <TooltipTrigger>
                            <div
                              key={b.id}
                              className="inline-flex h-6 w-6 items-center justify-center rounded bg-muted"
                            >
                              {iconForBadge(b.icon_url ?? undefined, "h-4 w-4")}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>{b.name}</TooltipContent>
                        </Tooltip>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected.has(f.id)}
                    onCheckedChange={() => toggleSelect(f.id)}
                    aria-label={`Select ${f.name}`}
                  />
                </div>
              </div>
            ))}
            {friends.length === 0 && (
              <div className="text-sm text-muted-foreground col-span-full">
                {loading ? "Loading friends..." : "No friends yet."}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <FriendsManagementBar
              currentPage={page}
              totalPages={Math.max(1, Math.ceil(total / Math.max(1, pageSize)))}
              onPrevPage={() => setPage(Math.max(1, page - 1))}
              onNextPage={() => setPage(page + 1)}
              onAddFriend={() => setOpen(true)}
              onRemoveSelected={() => setConfirmOpen(true)}
            />
          </div>

          <AddFriendDialog open={open} onOpenChange={setOpen} />

          <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Remove selected friends?</DialogTitle>
                <DialogDescription>
                  This will remove the selected friends from your list.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await removeSelected()
                    setConfirmOpen(false)
                  }}
                  disabled={selected.size === 0}
                >
                  Remove
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}
