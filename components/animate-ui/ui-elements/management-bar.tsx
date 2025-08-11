"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  Ban,
  X,
  Command,
  IdCard,
} from "lucide-react"
import { SlidingNumber } from "@/components/animate-ui/text/sliding-number"
import { motion, type Variants, type Transition } from "motion/react"

type ManagementBarProps = {
  currentPage: number
  totalPages: number
  onPrevPage: () => void
  onNextPage: () => void
  selectedCount?: number
  onRestrictUser?: () => void
  onRestrictAvatar?: () => void
  onBan?: () => void
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
  selectedCount = 0,
  onRestrictUser,
  onRestrictAvatar,
  onBan,
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
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
          aria-label="Restrict Username Change"
          disabled={selectedCount === 0}
          onClick={onRestrictUser}
        >
          <IdCard size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Restrict Username
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-amber-200/60 dark:bg-amber-700/60 px-2.5 py-2 text-amber-700 dark:text-amber-200 disabled:opacity-50"
          aria-label="Restrict Avatar Change"
          disabled={selectedCount === 0}
          onClick={onRestrictAvatar}
        >
          <X size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Restrict Avatar
          </motion.span>
        </motion.button>

        <motion.button
          {...BUTTON_MOTION_CONFIG}
          className="flex h-10 items-center space-x-2 overflow-hidden whitespace-nowrap rounded-lg bg-red-200/60 dark:bg-red-800/80 px-2.5 py-2 text-red-700 dark:text-red-300 disabled:opacity-50"
          aria-label="Ban"
          disabled={selectedCount === 0}
          onClick={onBan}
        >
          <Ban size={20} className="shrink-0" />
          <motion.span
            variants={LABEL_VARIANTS}
            transition={LABEL_TRANSITION}
            className="invisible text-sm"
          >
            Ban
          </motion.span>
        </motion.button>
      </motion.div>
    </div>
  )
}

export { ManagementBar }
