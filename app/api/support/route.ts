import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import sendEmail from "@/lib/email"
import { escapeHtml } from "@/lib/utils"
import { getUserBySession } from "@/lib/session"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import crypto from "crypto"

function normalizeIp(req: NextRequest): string {
  const ipHeader =
    req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || ""
  return ipHeader.split(",")[0].trim()
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const username = String(form.get("username") || "").trim()
    const email = String(form.get("email") || "").trim()
    const category = String(form.get("category") || "").trim()
    const subject = String(form.get("subject") || "").trim()
    const message = String(form.get("message") || "").trim()
    const attachments = form.getAll("attachments") as File[]

    if (!username || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }

    const allowedCategories = new Set(["feature", "bug", "streamer"])
    if (!allowedCategories.has(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 })
    }
    if (
      username.length > 64 ||
      email.length > 255 ||
      subject.length > 255 ||
      message.length > 5000
    ) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 })
    }

    if (attachments.some((f) => f.size > 5 * 1024 * 1024)) {
      return NextResponse.json(
        { error: "Attachments too large (max 5MB each)" },
        { status: 400 },
      )
    }

    const ip = normalizeIp(request)

    const recent = (await queryOne(
      "SELECT created_at FROM support_requests WHERE ip_address = ? AND created_at > (NOW() - INTERVAL 24 HOUR) ORDER BY created_at DESC LIMIT 1",
      [ip],
    )) as { created_at: string } | null
    if (recent) {
      return NextResponse.json(
        {
          error:
            "You've reached the daily limit. Please try again in 24 hours.",
        },
        { status: 429 },
      )
    }

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Support not configured" },
        { status: 500 },
      )
    }

    const sessionToken = request.cookies.get("session")?.value
    const requester = sessionToken ? await getUserBySession(sessionToken) : null

    const attachmentUrls: string[] = []
    const allowedExt = new Set([
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "pdf",
      "txt",
      "md",
      "log",
    ])
    if (attachments && attachments.length > 0) {
      const dir = join(
        process.cwd(),
        "private",
        "support",
        String(requester?.id || "guest"),
      )
      await mkdir(dir, { recursive: true })
      for (const f of attachments) {
        const buf = Buffer.from(await f.arrayBuffer())
        const ext = f.name.split(".").pop()?.toLowerCase() || "dat"
        if (!allowedExt.has(ext)) {
          return NextResponse.json(
            { error: "Unsupported attachment type" },
            { status: 400 },
          )
        }
        const rand = crypto.randomBytes(8).toString("hex")
        const filename = `${Date.now()}-${rand}.${ext}`
        const filePath = join(dir, filename)
        await writeFile(filePath, buf)
        const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
        attachmentUrls.push(
          `${base}/api/admin/support/attachments/${requester?.id || "guest"}/${filename}`,
        )
      }
    }

    const prettyCategory =
      category === "feature"
        ? "Feature Request"
        : category === "bug"
          ? "Bug Report"
          : category === "streamer"
            ? "Streamer Badge Request"
            : "Support"

    const safeUsername = escapeHtml(username)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>")

    const html = `
      <h2>Support Request: ${escapeHtml(prettyCategory)}</h2>
      <p><strong>From:</strong> ${safeUsername} &lt;${safeEmail}&gt;</p>
      <p><strong>Subject:</strong> ${safeSubject}</p>
      <p><strong>Message:</strong><br/>${safeMessage}</p>
      <p><small>IP: ${escapeHtml(ip)}</small></p>
      ${attachmentUrls.length ? `<p><strong>Attachments:</strong><br/>${attachmentUrls.map((u) => `<a href="${u}">${u}</a>`).join("<br/>")}</p>` : ""}
    `
    const text = `Support Request: ${prettyCategory}\nFrom: ${username} <${email}>\nSubject: ${subject}\n\n${message}\n\nIP: ${ip}${attachmentUrls.length ? `\nAttachments:\n${attachmentUrls.join("\n")}` : ""}`

    await sendEmail(
      adminEmail,
      `[Support] ${prettyCategory} - ${subject}`,
      html,
      text,
    )

    await query(
      "INSERT INTO support_requests (ip_address, email, category, subject, created_at) VALUES (?, ?, ?, ?, NOW())",
      [ip, email, category, subject],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Support request error:", error)
    return NextResponse.json(
      { error: "Failed to submit support request" },
      { status: 500 },
    )
  }
}
