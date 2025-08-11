import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { query } from "@/lib/db"
import sendEmail from "@/lib/email"
import { escapeHtml } from "@/lib/utils"
import { DiscordWebhookService } from "@/services/discord-webhook"

export async function POST(request: NextRequest) {
  try {
    const { donationId, paypalEmail, discordUsername } =
      (await request.json()) as {
        donationId?: string
        paypalEmail?: string
        discordUsername?: string
      }

    const id = String(donationId || "").trim()
    const email = String(paypalEmail || "").trim()
    const discord = String(discordUsername || "").trim()

    if (!id || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      )
    }
    if (id.length > 64 || email.length > 255) {
      return NextResponse.json({ error: "Input too long" }, { status: 400 })
    }
    if (discord && discord.length > 255) {
      return NextResponse.json(
        { error: "Discord username too long" },
        { status: 400 },
      )
    }

    const sessionToken = request.cookies.get("session")?.value
    const requester = sessionToken ? await getUserBySession(sessionToken) : null

    const adminEmail = process.env.ADMIN_EMAIL
    if (!adminEmail) {
      return NextResponse.json(
        { error: "Support not configured" },
        { status: 500 },
      )
    }

    const safeId = escapeHtml(id)
    const safeEmail = escapeHtml(email)
    const safeDiscord = discord ? escapeHtml(discord) : ""
    const safeUser = requester
      ? `${escapeHtml(requester.name)} (#${requester.id})`
      : "Guest"

    const html = `
      <h2>VIP Donation Verification</h2>
      <p><strong>User:</strong> ${safeUser}</p>
      <p><strong>Donation ID:</strong> ${safeId}</p>
      <p><strong>PayPal Email:</strong> ${safeEmail}</p>
      ${discord ? `<p><strong>Discord Username:</strong> ${safeDiscord}</p>` : ""}
      <p>Please verify the donation (≥ €5) and assign the Supporter badge manually.</p>
    `
    const text = `VIP Donation Verification\nUser: ${requester ? `${requester.name} (#${requester.id})` : "Guest"}\nDonation ID: ${id}\nPayPal Email: ${email}${discord ? `\nDiscord Username: ${discord}` : ""}\nPlease verify the donation (≥ €5) and assign the Supporter badge manually.`

    await sendEmail(
      adminEmail,
      "[VIP] Donation verification request",
      html,
      text,
    )

    if (discord) {
      try {
        await DiscordWebhookService.notifyDonationRequest(
          requester,
          id,
          email,
          discord,
        )
      } catch (err) {
        // ignore if method not present or webhook not configured
      }
    }

    try {
      await query(
        "INSERT INTO vip_donation_requests (user_id, donation_id, paypal_email, discord_username, created_at) VALUES (?, ?, ?, ?, NOW())",
        [requester?.id || null, id, email, discord || null],
      )
    } catch (error) {
      console.error("Error inserting VIP donation request:", error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit details" },
      { status: 500 },
    )
  }
}
