export function canChangeUsernameSince(lastChangedAt?: string | null): boolean {
  if (!lastChangedAt) return true
  const last = new Date(lastChangedAt)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  return last < thirtyDaysAgo
}

export function daysUntilUsernameChange(lastChangedAt?: string | null): number {
  if (!lastChangedAt) return 0
  const last = new Date(lastChangedAt)
  const nextAllowed = new Date(last.getTime() + 30 * 24 * 60 * 60 * 1000)
  const diff = Math.ceil(
    (nextAllowed.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  )
  return Math.max(0, diff)
}
