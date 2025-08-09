import { NextRequest, NextResponse } from "next/server"
import { getUserBySession } from "@/lib/session"
import { readFile } from "fs/promises"
import { join, normalize } from "path"

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "png":
      return "image/png"
    case "jpg":
    case "jpeg":
      return "image/jpeg"
    case "gif":
      return "image/gif"
    case "webp":
      return "image/webp"
    case "pdf":
      return "application/pdf"
    case "txt":
      return "text/plain; charset=utf-8"
    default:
      return "application/octet-stream"
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string; filename: string } },
) {
  try {
    const sessionToken = request.cookies.get("session")?.value
    const user = sessionToken ? await getUserBySession(sessionToken) : null
    if (!user || user.id !== 1) {
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
