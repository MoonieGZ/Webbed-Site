"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  CircleSlash,
  Image,
  UserPen,
} from "lucide-react"
import { SlidingNumber } from "@/components/animate-ui/text/sliding-number"
import { motion, type Variants, type Transition } from "motion/react"

type ManagementBarProps = {
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  onRestrictUser?: () => void
  onRestrictAvatar?: () => void
  onBan?: () => void
  onAllowUser?: () => void
  onAllowAvatar?: () => void
  onUnban?: () => void
  canRestrictUser?: boolean
  canRestrictAvatar?: boolean
  canBan?: boolean
  canAllowUser?: boolean
  canAllowAvatar?: boolean
  canUnban?: boolean
}

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

function ManagementBar({
  currentPage,
  totalPages,
  onPrevPage,
  onNextPage,
  onRestrictUser,
  onRestrictAvatar,
  onBan,
  onAllowUser,
  onAllowAvatar,
  onUnban,
  canRestrictUser = false,
  canRestrictAvatar = false,
  canBan = false,
  canAllowUser = false,
  canAllowAvatar = false,
  canUnban = false,
}: ManagementBarProps) {
  return (
    <div className="flex w-fit flex-wrap items-center gap-y-2 rounded-2xl border border-border bg-background p-2 shadow-lg">
      <div className="mx-auto flex shrink-0 items-center">
        <button
          disabled={currentPage <= 1}
          className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
          onClick={onPrevPage}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mx-2 flex items-center space-x-1 text-sm tabular-nums">
          <SlidingNumber
            className="text-foreground"
            padStart
            number={currentPage}
          />
          <span className="text-muted-foreground">/ {totalPages}</span>
        </div>
        <button
          disabled={currentPage >= totalPages}
          className="p-1 text-muted-foreground transition-colors hover:text-foreground disabled:text-muted-foreground/30 disabled:hover:text-muted-foreground/30"
          onClick={onNextPage}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="mx-3 h-6 w-px bg-border rounded-full" />

      <motion.div
        layout
        layoutRoot
        className="mx-auto flex flex-wrap space-x-2 sm:flex-nowrap"
      >
        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-200/60 dark:bg-green-800/60 px-2.5 py-2 text-green-700 dark:text-green-200 disabled:opacity-50"
          aria-label="Allow Username Change"
          disabled={!canAllowUser}
          onClick={onAllowUser}
        >
          <UserPen size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Allow Username
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-200/60 dark:bg-green-800/60 px-2.5 py-2 text-green-700 dark:text-green-200 disabled:opacity-50"
          aria-label="Allow Avatar Change"
          disabled={!canAllowAvatar}
          onClick={onAllowAvatar}
        >
          <Image size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Allow Avatar
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-green-200/60 dark:bg-green-800/60 px-2.5 py-2 text-green-700 dark:text-green-200 disabled:opacity-50"
          aria-label="Unban"
          disabled={!canUnban}
          onClick={onUnban}
        >
          <CircleSlash size={20} className="shrink-0 rotate-180" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Unban
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
          aria-label="Ban Username"
          disabled={!canRestrictUser}
          onClick={onRestrictUser}
        >
          <UserPen size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Ban Username
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
          aria-label="Ban Avatar"
          disabled={!canRestrictAvatar}
          onClick={onRestrictAvatar}
        >
          <Image size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Ban Avatar
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-red-200/60 dark:bg-red-800/80 px-2.5 py-2 text-red-700 dark:text-red-300 disabled:opacity-50"
          aria-label="Ban Account"
          disabled={!canBan}
          onClick={onBan}
        >
          <CircleSlash size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Ban Account
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export { ManagementBar }
