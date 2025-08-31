import { NextRequest, NextResponse } from "next/server"
import { createReadStream, statSync } from "fs"
import { join, normalize } from "path"

function getContentType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  }
  return (ext && map[ext]) || "application/octet-stream"
}

export async function GET(_request: NextRequest, context: any) {
  const { params } = context as { params: Promise<{ userId: string; name: string }> }
  const { userId, name } = await params

  if (!/^[0-9]+$/.test(userId) || !/^[A-Za-z0-9._-]+$/.test(name)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  try {
    const filePath = normalize(
      join(process.cwd(), "uploads", "avatars", String(userId), name),
    )
    const stats = statSync(filePath)

    const headers = new Headers()
    headers.set("Content-Type", getContentType(name))
    headers.set("Content-Length", String(stats.size))
    headers.set("Cache-Control", "public, max-age=60, immutable")

    // Node.js Readable stream -> Web ReadableStream
    const nodeStream = createReadStream(filePath)
    const stream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk))
        nodeStream.on("end", () => controller.close())
        nodeStream.on("error", () =>
          controller.error(new Error("Stream error")),
        )
      },
      cancel() {
        try {
          nodeStream.destroy()
        } catch {}
      },
    })

    return new NextResponse(stream as unknown as BodyInit, {
      status: 200,
      headers,
    })
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
}
