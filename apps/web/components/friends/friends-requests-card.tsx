"use client"

import { useFriendRequests } from "@/hooks/account/use-friend-requests"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/animate-ui/components/tabs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  UserPlus,
  Inbox,
  Send,
  ShieldBan,
  Check,
  X,
  CircleSlash,
} from "lucide-react"
import { motion, type Variants, type Transition } from "motion/react"

const BUTTON_MOTION_CONFIG = {
  initial: "rest",
  whileHover: "hover",
  whileTap: "tap",
  variants: {
    rest: { maxWidth: "40px" },
    hover: {
      maxWidth: "140px",
      transition: { type: "spring", stiffness: 200, damping: 35, delay: 0.15 },
    },
    tap: { scale: 0.95 },
  },
  transition: { type: "spring", stiffness: 250, damping: 25 },
} as const

const LABEL_VARIANTS: Variants = {
  rest: { opacity: 0, x: 4 },
  hover: { opacity: 1, x: 0, visibility: "visible" },
  tap: { opacity: 1, x: 0, visibility: "visible" },
}

const LABEL_TRANSITION: Transition = {
  type: "spring",
  stiffness: 200,
  damping: 25,
}

export function FriendsRequestsCard() {
  const { received, sent, blocked, respondToRequest, unblockUser } =
    useFriendRequests()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Friend Requests
        </CardTitle>
        <CardDescription>
          Manage received, sent, and blocked friend requests
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="received">
          <TabsList>
            <TabsTrigger
              value="received"
              className="flex items-center gap-2 w-25"
            >
              <Inbox className="h-4 w-4 mr-1" /> Received
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center gap-2 w-25">
              <Send className="h-4 w-4 mr-1" /> Sent
            </TabsTrigger>
            <TabsTrigger
              value="blocked"
              className="flex items-center gap-2 w-25"
            >
              <ShieldBan className="h-4 w-4 mr-1" /> Blocked
            </TabsTrigger>
          </TabsList>

          <TabsContents>
            <TabsContent value="received" className="space-y-2 mt-3">
              {received.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No received requests.
                </div>
              ) : (
                received.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border p-3 flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.user?.avatar || undefined} />
                      <AvatarFallback>
                        {r.user?.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.user?.name || "User #" + r.user?.id}
                      </div>
                      {r.user?.title ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.user.title}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-200/60 dark:bg-green-800/60 px-2.5 py-2 text-green-700 dark:text-green-200 disabled:opacity-50"
                        aria-label="Accept"
                        onClick={() => respondToRequest(r.id, "accept")}
                      >
                        <Check size={20} className="shrink-0" />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Accept
                        </motion.span>
                      </motion.button>

                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
                        aria-label="Decline"
                        onClick={() => respondToRequest(r.id, "decline")}
                      >
                        <X size={20} className="shrink-0" />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Decline
                        </motion.span>
                      </motion.button>

                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-red-200/60 dark:bg-red-800/60 px-2.5 py-2 text-red-700 dark:text-red-300 disabled:opacity-50"
                        aria-label="Block"
                        onClick={() => respondToRequest(r.id, "block")}
                      >
                        <ShieldBan size={20} className="shrink-0" />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Block
                        </motion.span>
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="sent" className="space-y-2 mt-3">
              {sent.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No sent requests.
                </div>
              ) : (
                sent.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border p-3 flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.user?.avatar || undefined} />
                      <AvatarFallback>
                        {r.user?.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.user?.name}
                      </div>
                      {r.user?.title ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.user.title}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
                        aria-label="Cancel"
                        onClick={() => respondToRequest(r.id, "cancel")}
                      >
                        <X size={20} className="shrink-0" />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Cancel
                        </motion.span>
                      </motion.button>

                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-red-200/60 dark:bg-red-800/80 px-2.5 py-2 text-red-700 dark:text-red-300 disabled:opacity-50"
                        aria-label="Block"
                        onClick={() => respondToRequest(r.id, "block")}
                      >
                        <ShieldBan size={20} className="shrink-0" />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Block
                        </motion.span>
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>

            <TabsContent value="blocked" className="space-y-2 mt-3">
              {blocked.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No blocked users.
                </div>
              ) : (
                blocked.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-md border p-3 flex items-center gap-3"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={r.user?.avatar || undefined} />
                      <AvatarFallback>
                        {r.user?.name?.[0] ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {r.user?.name}
                      </div>
                      {r.user?.title ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {r.user?.title}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2">
                      <motion.button
                        {...BUTTON_MOTION_CONFIG}
                        className="flex h-9 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-200/60 dark:bg-green-800/60 px-2.5 py-2 text-green-700 dark:text-green-200 disabled:opacity-50"
                        aria-label="Unblock"
                        onClick={() => unblockUser(r.id)}
                      >
                        <CircleSlash
                          size={20}
                          className="shrink-0 rotate-180"
                        />
                        <motion.span
                          variants={LABEL_VARIANTS}
                          transition={LABEL_TRANSITION}
                          className="invisible text-sm"
                        >
                          Unblock
                        </motion.span>
                      </motion.button>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </TabsContents>
        </Tabs>
      </CardContent>
    </Card>
  )
}
