export const toastStyles = {
  success: {
    style: {
      "--normal-bg":
        "color-mix(in oklab, light-dark(var(--color-green-600), var(--color-green-400)) 10%, var(--background))",
      "--normal-text":
        "light-dark(var(--color-green-600), var(--color-green-400))",
      "--normal-border":
        "light-dark(var(--color-green-600), var(--color-green-400))",
    } as React.CSSProperties,
  },
  warning: {
    style: {
      "--normal-bg":
        "color-mix(in oklab, light-dark(var(--color-amber-600), var(--color-amber-400)) 10%, var(--background))",
      "--normal-text":
        "light-dark(var(--color-amber-600), var(--color-amber-400))",
      "--normal-border":
        "light-dark(var(--color-amber-600), var(--color-amber-400))",
    } as React.CSSProperties,
  },
  error: {
    style: {
      "--normal-bg": "var(--background)",
      "--normal-text": "var(--destructive)",
      "--normal-border": "var(--destructive)",
    } as React.CSSProperties,
  },
  info: {
    style: {
      "--normal-bg": "var(--background)",
      "--normal-text": "light-dark(var(--color-sky-600), var(--color-sky-400))",
      "--normal-border": "light-dark(var(--color-sky-600), var(--color-sky-400))",
    } as React.CSSProperties,
  },
} as const
