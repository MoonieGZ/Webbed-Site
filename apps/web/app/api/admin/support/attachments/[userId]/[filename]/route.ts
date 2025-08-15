import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { ADMIN_USER_ID } from "@/lib/admin"
import { readFile } from "fs/promises"

import { join, normalize } from "path"

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    pdf: "application/pdf",
    txt: "text/plain; charset=utf-8",
    md: "text/markdown; charset=utf-8",
    log: "text/plain; charset=utf-8",
    m4a: "audio/mp4",
  }
  return (ext && map[ext]) || "application/octet-stream"
}

export async function GET(request: NextRequest, context: any) {
  try {
    const { params } = context as { params: { userId: string; filename: string } }
    const sessionToken = request.cookies.get("session")?.value
    const user = sessionToken ? await getUserBySession(sessionToken) : null
    if (!user || user.id !== ADMIN_USER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId, filename } = params

    const validUserId = /^[0-9]+$/.test(userId) || userId === "guest"
    const validFilename = /^[A-Za-z0-9._-]+$/.test(filename)
    if (
      !validUserId ||
      !validFilename ||
      filename.includes("..") ||
      filename.includes("/") ||
      filename.includes("\\")
    ) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    const filePath = normalize(
      join(process.cwd(), "private", "support", String(userId), filename),
    )

    const data = await readFile(filePath)
    const contentType = getContentType(filename)
    return new NextResponse(data, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
