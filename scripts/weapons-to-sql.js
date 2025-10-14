/*
  Generic converter: HTML weapon table -> SQL INSERTs for ww_weapons
  Usage examples:
    node scripts/weapons-to-sql.js --in database/sword.html --type Sword --out database/sword.sql
    node scripts/weapons-to-sql.js --in database/pistols.html --type Pistol --out database/pistols.sql
*/

const fs = require("fs")
const path = require("path")

function parseArgs(argv) {
  const args = { in: null, out: null, type: null }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--in") args.in = argv[++i]
    else if (a === "--out") args.out = argv[++i]
    else if (a === "--type") args.type = argv[++i]
  }
  if (!args.in || !args.out || !args.type) {
    throw new Error(
      "Usage: node scripts/weapons-to-sql.js --in <input.html> --type <Pistol|Sword|Broadblade|Rectifier|Gauntlets> --out <output.sql>",
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
  if (dataSrcMatch) return dataSrcMatch[1]
  const srcMatch = iconCellHtml.match(/\ssrc="([^"]+)"/i)
  if (srcMatch) return srcMatch[1]
  return null
}

function extractName(nameCellHtml) {
  const innerText = nameCellHtml
    .replace(/\n/g, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim()
  return innerText
}

function extractRarity(rarityCellHtml) {
  // Matches Icon_5_Stars.png and Icon_1_Star.png
  const match = rarityCellHtml.match(/Icon_(\d+)_Star/)
  if (!match) return null
  return parseInt(match[1], 10)
}

function sqlEscape(value) {
  return value.replace(/'/g, "''")
}

function buildInsert(values, weaponType, sourceRelativePath) {
  if (values.length === 0) {
    return `-- No rows parsed from ${sourceRelativePath}\n`
  }
  const header = [
    `-- Auto-generated from ${sourceRelativePath}`,
    "START TRANSACTION;",
    "INSERT IGNORE INTO ww_weapons (name, weapon_type, rarity) VALUES",
  ].join("\n")

  const rows = values
    .map(
      ({ name, rarity }) =>
        `  ('${sqlEscape(name)}', '${weaponType}', ${rarity})`,
    )
    .join(",\n")
  const footer = "\n;\nCOMMIT;\n"
  return header + "\n" + rows + footer
}

function main() {
  const args = parseArgs(process.argv)
  const inputPath = path.isAbsolute(args.in)
    ? args.in
    : path.join(process.cwd(), args.in)
  const outputPath = path.isAbsolute(args.out)
    ? args.out
    : path.join(process.cwd(), args.out)
  const weaponType = args.type

  const html = readHtml(inputPath)
  const rows = extractTableRows(html)

  const values = []
  const imageUrls = []
  for (const row of rows) {
    const cells = extractTdCells(row)
    if (cells.length < 3) continue // need at least Icon, Name, Rarity

    const iconUrl = extractIconUrl(cells[0] || "")
    const name = extractName(cells[1] || "")
    const rarity = extractRarity(cells[2] || "")

    if (!name || !rarity) continue
    values.push({ name, rarity })
    if (iconUrl) imageUrls.push(iconUrl)
  }

  const sql = buildInsert(
    values,
    weaponType,
    path.relative(process.cwd(), inputPath),
  )
  fs.writeFileSync(outputPath, sql, "utf8")
  process.stdout.write(
    `Wrote ${values.length} rows to ${path.relative(process.cwd(), outputPath)}\n`,
  )

  // Write images file next to SQL output
  const outDir = path.dirname(outputPath)
  const imagesFile = path.join(outDir, `${weaponType.toLowerCase()}-images.txt`)
  fs.writeFileSync(
    imagesFile,
    imageUrls.join("\n") + (imageUrls.length ? "\n" : ""),
    "utf8",
  )
  process.stdout.write(
    `Wrote ${imageUrls.length} image URLs to ${path.relative(process.cwd(), imagesFile)}\n`,
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
