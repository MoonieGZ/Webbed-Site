export async function emitFriendPendingCount(userId: number, count: number) {
  try {
    // Security: Admin-only emit with HMAC (x-timestamp + x-signature, canonical JSON body).
    // This endpoint carries non-sensitive metadata (count) and targets a user room.
    const wsUrl = process.env.WS_URL
    const adminKey = process.env.WS_ADMIN_KEY
    if (!wsUrl || !adminKey) return
    const timestamp = Date.now()
    const bodyObj = { userId, count }
    const canonicalBody = JSON.stringify(
      Object.keys(bodyObj)
        .sort()
        .reduce((acc, k) => {
          // @ts-expect-error index
          acc[k] = bodyObj[k]
          return acc
        }, {} as Record<string, unknown>),
    )
    const encoder = new TextEncoder()
    const data = `POST.${timestamp}.${canonicalBody}`
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(adminKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )
    const signatureBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
    const signature = Array.from(new Uint8Array(signatureBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${wsUrl}/emit/friends/pending-count`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminKey,
        "x-timestamp": String(timestamp),
        "x-signature": signature,
      },
      body: canonicalBody,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      // swallow but log server-side for visibility
      console.error("emitFriendPendingCount failed", res.status)
    }
  } catch {}
}

export async function emitFriendAccepted(
  userId: number,
  friend: { id: number; name: string | null },
) {
  try {
    // Security: Admin-only emit with HMAC. Payload is minimal (friend id/name) for UX notification.
    const wsUrl = process.env.WS_URL
    const adminKey = process.env.WS_ADMIN_KEY
    if (!wsUrl || !adminKey) return
    const timestamp = Date.now()
    const bodyObj = { userId, friend }
    const canonicalBody = JSON.stringify(
      Object.keys(bodyObj)
        .sort()
        .reduce((acc, k) => {
          // @ts-expect-error index
          acc[k] = bodyObj[k]
          return acc
        }, {} as Record<string, unknown>),
    )
    const encoder = new TextEncoder()
    const data = `POST.${timestamp}.${canonicalBody}`
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(adminKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    )
    const signatureBuf = await crypto.subtle.sign("HMAC", key, encoder.encode(data))
    const signature = Array.from(new Uint8Array(signatureBuf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(`${wsUrl}/emit/friends/accepted`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-admin-key": adminKey,
        "x-timestamp": String(timestamp),
        "x-signature": signature,
      },
      body: canonicalBody,
      signal: controller.signal,
    })
    clearTimeout(timeout)
    if (!res.ok) {
      console.error("emitFriendAccepted failed", res.status)
    }
  } catch {}
}
