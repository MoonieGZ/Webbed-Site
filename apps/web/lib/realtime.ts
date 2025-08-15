export async function emitFriendPendingCount(userId: number, count: number) {
  try {
    const wsUrl = process.env.WS_URL
    const adminKey = process.env.WS_ADMIN_KEY
    if (!wsUrl || !adminKey) return
    await fetch(`${wsUrl}/emit/friends/pending-count`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ userId, count }),
    })
  } catch {}
}

export async function emitFriendAccepted(
  userId: number,
  friend: { id: number; name: string | null },
) {
  try {
    const wsUrl = process.env.WS_URL
    const adminKey = process.env.WS_ADMIN_KEY
    if (!wsUrl || !adminKey) return
    await fetch(`${wsUrl}/emit/friends/accepted`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminKey,
      },
      body: JSON.stringify({ userId, friend }),
    })
  } catch {}
}
