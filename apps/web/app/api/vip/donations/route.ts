import { NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

export async function GET() {
  try {
    const filePath = join(process.cwd(), "private", "vip", "donations.json")
    const buf = await readFile(filePath, "utf8")
    const json = JSON.parse(buf) as { totalEuros?: unknown }
    const total = Number(json.totalEuros)
    if (!Number.isFinite(total) || total < 0) {
      return NextResponse.json(
        { error: "Invalid donations data" },
        { status: 500 },
      )
    }
    return NextResponse.json({ totalEuros: total })
  } catch (err) {
    console.error("Failed to read donations.json", err)
    return NextResponse.json(
      { error: "Donations unavailable" },
      { status: 500 },
    )
  }
}
