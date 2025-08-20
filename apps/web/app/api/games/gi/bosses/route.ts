export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { GiBoss } from "@/types"

export async function GET() {
  try {
    const rows = (await query(
      "SELECT name, location, legendary, coop, wiki_url FROM gi_bosses ORDER BY location, name",
    )) as Array<{
      name: string
      location: string
      legendary: number
      coop: number
      wiki_url: string | null
    }>

    const bosses: GiBoss[] = rows.map((r) => ({
      name: r.name,
      location: r.location,
      legendary: Boolean(r.legendary),
      coop: Boolean(r.coop),
      wikiUrl: r.wiki_url,
    }))

    return NextResponse.json(bosses)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load bosses" },
      { status: 500 },
    )
  }
}
