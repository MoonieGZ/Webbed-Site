import crypto from "crypto"
import { query, queryOne } from "./db"
import sendEmail from "./email"
import type { MagicLink, User } from "@/types/magic-link"

export function generateMagicLinkToken(): string {
  // Security: cryptographically strong token (256-bit). No PII embedded in token.
  return crypto.randomBytes(32).toString("hex")
}

export async function createMagicLink(
  email: string,
  userId?: number,
  ipAddress?: string | null,
  userAgent?: string | null,
): Promise<string> {
  const token = generateMagicLinkToken()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  // Parameterized insert; stores token with expiry and metadata. 'used' gate prevents replay.
  await query(
    "INSERT INTO magic_links (token, email, user_id, ip_address, user_agent, expires_at, used) VALUES (?, ?, ?, ?, ?, ?, 0)",
    [
      token,
      email,
      userId || null,
      ipAddress || null,
      userAgent || null,
      expiresAt,
    ],
  )

  return token
}

export async function validateMagicLink(token: string): Promise<{
  valid: boolean
  user?: User
  email: string
  shouldCreateUser: boolean
}> {
  // Parameterized lookup; ensures not used and not expired.
  const magicLink = (await queryOne(
    "SELECT * FROM magic_links WHERE token = ? AND used = 0 AND expires_at > NOW() LIMIT 1",
    [token],
  )) as MagicLink | null

  if (!magicLink) {
    return { valid: false, email: "", shouldCreateUser: false }
  }

  // Mark token as used to prevent replay.
  await query("UPDATE magic_links SET used = 1 WHERE id = ?", [magicLink.id])

  let user: User | undefined
  if (magicLink.user_id) {
    const userResult = (await queryOne("SELECT * FROM users WHERE id = ? LIMIT 1", [
      magicLink.user_id,
    ])) as User | null
    user = userResult || undefined
  }

  return {
    valid: true,
    user,
    email: magicLink.email,
    shouldCreateUser: !magicLink.user_id,
  }
}

export async function sendMagicLinkEmail(
  email: string,
  token: string,
): Promise<void> {
  const environment = process.env.NODE_ENV
  const url = environment === "development" ? "localhost:3000" : "mnsy.dev"
  // Magic link includes opaque token only; validated server-side with expiry & single-use.
  const magicLinkUrl = `https://${url}/login/magic?token=${token}`

  const subject = "Sign in to mnsy.dev"
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #333;">Sign in to mnsy.dev</h1>
      <p style="color: #666; font-size: 16px;">
        Click the button below to sign in to your account. This link will expire in 15 minutes.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${magicLinkUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Sign In
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you didn't request this email, you can safely ignore it.
      </p>
      <p style="color: #999; font-size: 12px; margin-top: 30px;">
        Or copy and paste this link into your browser: <br>
        <a href="${magicLinkUrl}" style="color: #007bff;">${magicLinkUrl}</a>
      </p>
    </div>
  `

  const text = `
    Sign in to mnsy.dev
    
    Click the link below to sign in to your account. This link will expire in 15 minutes.
    
    ${magicLinkUrl}
    
    If you didn't request this email, you can safely ignore it.
  `

  await sendEmail(email, subject, html, text)
}

export async function createUser(email: string, name?: string): Promise<User> {
  const result = (await query("INSERT INTO users (email, name) VALUES (?, ?)", [
    email,
    name || null,
  ])) as any

  return (await queryOne("SELECT * FROM users WHERE id = ? LIMIT 1", [
    result.insertId,
  ])) as User
}

export { queryOne }
