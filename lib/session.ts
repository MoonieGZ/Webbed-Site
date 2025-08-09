import crypto from "crypto"
import { query, queryOne } from "./db"
import type { UserSession } from "@/types/session"

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function createSession(userId: number): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await query(
    "INSERT INTO user_sessions (user_id, token, expires_at) VALUES (?, ?, ?)",
    [userId, token, expiresAt],
  )

  return token
}

export async function validateSession(
  token: string,
): Promise<UserSession | null> {
  const session = (await queryOne(
    "SELECT * FROM user_sessions WHERE token = ? AND expires_at > NOW()",
    [token],
  )) as UserSession | null

  return session
}

export async function extendSession(token: string): Promise<void> {
  const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  await query("UPDATE user_sessions SET expires_at = ? WHERE token = ?", [
    newExpiresAt,
    token,
  ])
}

export async function deleteSession(token: string): Promise<void> {
  await query("DELETE FROM user_sessions WHERE token = ?", [token])
}

export async function getUserBySession(token: string): Promise<any> {
  const session = await validateSession(token)
  if (!session) return null

  const user = await queryOne("SELECT * FROM users WHERE id = ?", [
    session.user_id,
  ])

  return user
}
