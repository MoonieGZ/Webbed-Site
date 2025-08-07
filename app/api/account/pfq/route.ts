import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { PFQApiService } from "@/services/pfq-api"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get PFQ API key for user
    const apiKeyRecord = (await queryOne(
      "SELECT api_key, created_at, last_validated FROM pfq_apikeys WHERE user_id = ?",
      [user.id],
    )) as { api_key: string; created_at: Date; last_validated: Date } | null

    if (!apiKeyRecord) {
      return NextResponse.json({ hasApiKey: false })
    }

    // Fetch PFQ user data
    const pfqUserResult = await PFQApiService.whoAmI(apiKeyRecord.api_key)

    return NextResponse.json({
      hasApiKey: true,
      created_at: apiKeyRecord.created_at,
      last_validated: apiKeyRecord.last_validated,
      pfqUser: pfqUserResult.success ? pfqUserResult.data : null,
      // Don't return the actual API key for security
    })
  } catch (error) {
    console.error("PFQ API key fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch PFQ API key" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { apiKey } = await request.json()

    if (!apiKey || typeof apiKey !== "string") {
      return NextResponse.json(
        { error: "API key is required" },
        { status: 400 },
      )
    }

    // Validate the API key with PFQ
    const validationResult = await PFQApiService.whoAmI(apiKey)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error || "Invalid API key" },
        { status: 400 },
      )
    }

    // Check if user already has an API key
    const existingKey = await queryOne(
      "SELECT id FROM pfq_apikeys WHERE user_id = ?",
      [user.id],
    )

    if (existingKey) {
      // Update existing API key
      await query(
        "UPDATE pfq_apikeys SET api_key = ?, last_validated = NOW() WHERE user_id = ?",
        [apiKey, user.id],
      )
    } else {
      // Insert new API key
      await query(
        "INSERT INTO pfq_apikeys (user_id, api_key, created_at, last_validated) VALUES (?, ?, NOW(), NOW())",
        [user.id, apiKey],
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PFQ API key save error:", error)
    return NextResponse.json(
      { error: "Failed to save PFQ API key" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get("session")?.value

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user from session
    const user = (await queryOne(
      "SELECT u.id, u.email FROM users u JOIN user_sessions s ON u.id = s.user_id WHERE s.token = ? AND s.expires_at > NOW()",
      [sessionToken],
    )) as { id: number; email: string } | null

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete PFQ API key
    await query("DELETE FROM pfq_apikeys WHERE user_id = ?", [user.id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("PFQ API key delete error:", error)
    return NextResponse.json(
      { error: "Failed to delete PFQ API key" },
      { status: 500 },
    )
  }
}
