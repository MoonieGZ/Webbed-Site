import { NextRequest, NextResponse } from "next/server"
import { query, queryOne } from "@/lib/db"
import { getUserBySession } from "@/lib/session"
import type { GiRandomizerSettings } from "@/types"
import { DEFAULT_GI_SETTINGS } from "@/types"
import { z } from "zod"

async function getRequesterId(request: NextRequest): Promise<number | null> {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) return null
  const user = await getUserBySession(sessionToken)
  return user?.id ?? null
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getRequesterId(request)
    if (!userId) return NextResponse.json(DEFAULT_GI_SETTINGS)

    const row = (await queryOne(
      "SELECT settings FROM gi_user_settings WHERE user_id = ?",
      [userId],
    )) as { settings: any } | null

    if (!row) return NextResponse.json(DEFAULT_GI_SETTINGS)

    const settings =
      typeof row.settings === "string"
        ? (JSON.parse(row.settings) as GiRandomizerSettings)
        : (row.settings as GiRandomizerSettings)

    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load settings" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await getRequesterId(request)
    const schema = z.object({
      characters: z.object({
        count: z.number().int().min(0).max(10),
        enabled: z.record(z.string(), z.boolean()),
        excluded: z.array(z.string()).max(100),
      }),
      bosses: z.object({
        count: z.number().int().min(0).max(20),
        enabled: z.record(z.string(), z.boolean()),
      }),
      enableExclusion: z.boolean(),
      rules: z.object({
        coopMode: z.boolean(),
        limitFiveStars: z.boolean(),
        maxFiveStars: z.number().int().min(0).max(7),
      }),
    })
    const parsed = schema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid settings" }, { status: 400 })
    }
    const body = parsed.data as GiRandomizerSettings

    if (!userId) return NextResponse.json(body)

    const settingsJson = JSON.stringify(body)
    await query(
      "INSERT INTO gi_user_settings (user_id, settings) VALUES (?, ?) ON DUPLICATE KEY UPDATE settings = VALUES(settings)",
      [userId, settingsJson],
    )

    return NextResponse.json(body)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 },
    )
  }
}
