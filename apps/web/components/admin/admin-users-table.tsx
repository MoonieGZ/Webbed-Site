import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/animate-ui/radix/checkbox"
import { ManagementBar } from "@/components/admin/management-bar"
import { useAdminUsers } from "@/hooks/admin/use-admin-users"
import { Search, Users } from "lucide-react"

export function AdminUsersTable() {
  const {
    users,
    page,
    setPage,
    totalPages,
    q,
    setQ,
    loading,
    selected,
    toggleSelect,
    performBulk,
  } = useAdminUsers()

  const selectedUsers = users.filter((u) => selected.has(u.id))
  const anySelected = selectedUsers.length > 0
  const canRestrictUser =
    anySelected &&
    selectedUsers.some((u) => u.permissions.can_change_user === 1)
  const canRestrictAvatar =
    anySelected &&
    selectedUsers.some((u) => u.permissions.can_change_avatar === 1)
  const canBan =
    anySelected && selectedUsers.some((u) => u.permissions.is_banned === 0)
  const canAllowUser =
    anySelected &&
    selectedUsers.some((u) => u.permissions.can_change_user === 0)
  const canAllowAvatar =
    anySelected &&
    selectedUsers.some((u) => u.permissions.can_change_avatar === 0)
  const canUnban =
    anySelected && selectedUsers.some((u) => u.permissions.is_banned === 1)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Users
        </CardTitle>
        <CardDescription>Manage users and their permissions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-3">
          <div className="w-full max-w-md">
            <div className="relative">
              <div className="text-muted-foreground pointer-events-none absolute inset-y-0 start-0 flex items-center justify-end ps-3 peer-disabled:opacity-50">
                <Search className="size-4" />
                <span className="sr-only">Search</span>
              </div>
              <Input
                id="search"
                value={q}
                placeholder="Search by username or email"
                onChange={(e) => setQ(e.target.value)}
                className="peer ps-9 placeholder:text-muted-foreground"
              />
            </div>
          </div>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="grid grid-cols-[40px_40px_1fr_1fr_1fr] items-center gap-3 px-3 py-2 text-xs font-medium bg-muted/50">
            <div className="text-center">Select</div>
            <div>Avatar</div>
            <div>Username</div>
            <div>Email</div>
            <div>Permissions</div>
          </div>
          <div>
            {users.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[40px_40px_1fr_1fr_1fr] items-center gap-3 px-3 py-2 border-t"
              >
                <div className="flex items-center justify-center">
                  <Checkbox
                    checked={selected.has(u.id)}
                    onCheckedChange={() => toggleSelect(u.id)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={u.avatar || undefined} />
                    <AvatarFallback>{u.name?.[0] ?? "U"}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="truncate text-sm">{u.name}</div>
                <div className="truncate text-sm">{u.email}</div>
                <div className="text-xs">
                  {u.permissions.is_banned ? (
                    <span className="mr-2 rounded bg-destructive/10 px-2 py-0.5 text-destructive">
                      Banned
                    </span>
                  ) : null}
                  {!u.permissions.can_change_avatar ? (
                    <span className="mr-2 rounded bg-amber-500/10 px-2 py-0.5 text-amber-500">
                      Avatar Restricted
                    </span>
                  ) : null}
                  {!u.permissions.can_change_user ? (
                    <span className="mr-2 rounded bg-amber-500/10 px-2 py-0.5 text-amber-500">
                      Name Restricted
                    </span>
                  ) : null}

                  {u.permissions.is_banned ||
                  !u.permissions.can_change_user ||
                  !u.permissions.can_change_avatar ? null : (
                    <span className="rounded bg-muted px-2 py-0.5 text-green-500">
                      Normal
                    </span>
                  )}
                </div>
              </div>
            ))}
            {users.length === 0 && (
              <div className="px-3 py-8 text-sm text-muted-foreground">
                {loading ? "Loading users..." : "No users found."}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 -mb-2">
          <ManagementBar
            currentPage={page}
            totalPages={totalPages}
            onPrevPage={() => setPage(Math.max(1, page - 1))}
            onNextPage={() => setPage(page + 1)}
            onRestrictUser={() => performBulk("restrict_user")}
            onRestrictAvatar={() => performBulk("restrict_avatar")}
            onBan={() => performBulk("ban")}
            onAllowUser={() => performBulk("allow_user")}
            onAllowAvatar={() => performBulk("allow_avatar")}
            onUnban={() => performBulk("unban")}
            canRestrictUser={canRestrictUser}
            canRestrictAvatar={canRestrictAvatar}
            canBan={canBan}
            canAllowUser={canAllowUser}
            canAllowAvatar={canAllowAvatar}
            canUnban={canUnban}
          />
        </div>
      </CardContent>
    </Card>
  )
}
