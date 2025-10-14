/*
  Extract first-column image URLs from element HTML tables (e.g., aero.html)
  Usage:
    node scripts/extract-element-images.js --in database/aero.html --out database/aero-images.txt
  If --out is omitted, defaults to <input-basename>-images.txt in the same directory as input.
*/

const fs = require("fs")
const path = require("path")

function parseArgs(argv) {
  const args = { in: null, out: null }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--in") args.in = argv[++i]
    else if (a === "--out") args.out = argv[++i]
  }
  if (!args.in) {
    throw new Error(
      "Usage: node scripts/extract-element-images.js --in <input.html> [--out <output.txt>]",
    )
  }
  return args
}

function readHtml(filePath) {
  return fs.readFileSync(filePath, "utf8")
}

function extractTableRows(html) {
  const rowRegex = /<tr[\s\S]*?>[\s\S]*?<\/tr>/gi
  return Array.from(html.matchAll(rowRegex)).map((m) => m[0])
}

function extractTdCells(rowHtml) {
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi
  return Array.from(rowHtml.matchAll(tdRegex)).map((m) => m[1])
}

function extractIconUrl(iconCellHtml) {
  if (!iconCellHtml) return null
  // Prefer data-src if present (lazyloaded), else src
  const dataSrcMatch = iconCellHtml.match(/data-src="([^"]+)"/i)
  if (dataSrcMatch) {
    const url = dataSrcMatch[1]
    const idx = url.toLowerCase().indexOf(".png")
    return idx >= 0 ? url.slice(0, idx + 4) : url
  }
  const srcMatch = iconCellHtml.match(/\ssrc="([^"]+)"/i)
  if (srcMatch) {
    const url = srcMatch[1]
    const idx = url.toLowerCase().indexOf(".png")
    return idx >= 0 ? url.slice(0, idx + 4) : url
  }
  return null
}

function main() {
  const args = parseArgs(process.argv)
  const inputPath = path.isAbsolute(args.in)
    ? args.in
    : path.join(process.cwd(), args.in)
  const html = readHtml(inputPath)
  const rows = extractTableRows(html)

  const imageUrls = []
  const seen = new Set()
  for (const row of rows) {
    const cells = extractTdCells(row)
    if (cells.length === 0) continue
    const iconUrl = extractIconUrl(cells[0])
    if (iconUrl && !seen.has(iconUrl)) {
      seen.add(iconUrl)
      imageUrls.push(iconUrl)
    }
  }

  const outPath = args.out
    ? path.isAbsolute(args.out)
      ? args.out
      : path.join(process.cwd(), args.out)
    : path.join(
        path.dirname(inputPath),
        `${path.basename(inputPath, path.extname(inputPath))}-images.txt`,
      )

  fs.writeFileSync(
    outPath,
    imageUrls.join("\n") + (imageUrls.length ? "\n" : ""),
    "utf8",
  )
  process.stdout.write(
    `Wrote ${imageUrls.length} image URLs to ${path.relative(process.cwd(), outPath)}\n`,
  )
}

if (require.main === module) {
  try {
    main()
  } catch (err) {
    console.error(err.message || err)
    process.exit(1)
  }
}
