"use client"

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  Sparkles,
  Settings,
  User,
  Loader2,
} from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/animate-ui/radix/sidebar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/animate-ui/radix/dialog"
import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/login/use-logout"
import Link from "next/link"

function displayMenu(
  isGuest: boolean,
  isMobile: boolean,
  handleLogoutClick: () => void,
) {
  if (!isGuest) {
    return (
      <DropdownMenuContent
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
        side={isMobile ? "bottom" : "right"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Sparkles />
            Become a Supporter
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/account">
            <DropdownMenuItem>
              <User />
              Account
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem>
            <Settings />
            Preferences
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleLogoutClick}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    )
  }
  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={isMobile ? "bottom" : "right"}
      align="end"
      sideOffset={4}
    >
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <Sparkles />
          Become a Supporter
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/login">
            <DropdownMenuItem asChild>
              <User />
              Login
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
    </DropdownMenuContent>
  )
}

export function NavUser({
  user,
  loading = false,
}: {
  user: {
    name: string
    title: string
    avatar: string
  }
  loading?: boolean
}) {
  const { isMobile } = useSidebar()
  const {
    logoutDialogOpen,
    setLogoutDialogOpen,
    handleLogoutClick,
    handleCancelLogout,
    handleConfirmLogout,
  } = useLogout()

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">
                    {loading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <User className="size-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {loading ? "Loading..." : user.name}
                  </span>
                  {user.title && (
                    <span className="truncate text-xs">{user.title}</span>
                  )}
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            {displayMenu(
              user.name === "Guest",
              isMobile,
              handleLogoutClick,
            )}
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Log out?</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <p>
              This will log you out of your account and you will need to log in
              again.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancelLogout}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="submit"
              onClick={handleConfirmLogout}
            >
              Log out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
