import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Toast styling utilities
export const toastStyles = {
  success: {
    style: {
      '--normal-bg': 'color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))',
      '--normal-text': 'light-dark(var(--color-green-600), var(--color-green-400))',
      '--normal-border': 'light-dark(var(--color-green-600), var(--color-green-400))'
    } as React.CSSProperties
  },
  error: {
    style: {
      '--normal-bg': 'var(--background)',
      '--normal-text': 'var(--destructive)',
      '--normal-border': 'var(--destructive)'
    } as React.CSSProperties
  }
} as const;
