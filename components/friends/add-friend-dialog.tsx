"use client"

import { useAddFriendDialog } from "@/hooks/account/use-add-friend-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/animate-ui/radix/dialog"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { toast } from "sonner"
import { toastStyles } from "@/lib/toast-styles"

type AddFriendDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddFriendDialog({ open, onOpenChange }: AddFriendDialogProps) {
  const { query, setQuery, search, results, searching, sendRequest } =
    useAddFriendDialog()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent from="top">
        <DialogHeader>
          <DialogTitle>Add a friend</DialogTitle>
          <DialogDescription>
            Search users to send a friend request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="relative">
            <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
              <Search className="size-4" />
              <span className="sr-only">Search</span>
            </div>
            <Input
              autoFocus
              placeholder="Type a name..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                void search(e.target.value)
              }}
              className="peer ps-9 placeholder:text-muted-foreground"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2">
            {results.map((u) => (
              <div
                key={u.id}
                className="rounded-md border p-3 flex items-center gap-3"
              >
                <Avatar className="h-9 w-9">
                  <AvatarImage src={u.avatar || undefined} />
                  <AvatarFallback>{u.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.name}</div>
                  {u.title ? (
                    <div className="text-xs text-muted-foreground truncate">
                      {u.title}
                    </div>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  onClick={async () => {
                    toast.info("Sending friend request...", toastStyles.info)
                    const ok = await sendRequest(u.id)
                    if (ok) {
                      onOpenChange(false)
                      toast.success("Friend request sent", toastStyles.success)
                    } else {
                      toast.error("Failed to send friend request", toastStyles.error)
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            ))}
            {results.length === 0 && (
              <div className="text-sm text-muted-foreground">
                {searching ? "Searching..." : "Start typing to search."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
