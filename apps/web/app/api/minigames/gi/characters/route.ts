import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import type { GiCharacter, GiElement } from "@/types"

export async function GET() {
  try {
    const rows = (await query(
      "SELECT name, element, five_star FROM gi_characters ORDER BY name ASC",
    )) as Array<{ name: string; element: string; five_star: number }>

    const characters: GiCharacter[] = rows.map((r) => ({
      name: r.name,
      element: r.element as GiElement,
      fiveStar: Boolean(r.five_star),
    }))

    return NextResponse.json(characters)
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load characters" },
      { status: 500 },
    )
  }
}
