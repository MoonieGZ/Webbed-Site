/*
  Generic HTML <img> URL extractor
  Usage:
    node scripts/extract-images.js --in <input.html> --out <output.txt>
  Behavior:
    - Prefer data-src over src if present
    - Trim anything after .png (inclusive)
    - De-duplicate while preserving order
*/

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const args = { in: null, out: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--in') args.in = argv[++i];
    else if (a === '--out') args.out = argv[++i];
  }
  if (!args.in || !args.out) {
    throw new Error('Usage: node scripts/extract-images.js --in <input.html> --out <output.txt>');
  }
  return args;
}

function readHtml(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function trimAtPng(url) {
  const idx = url.toLowerCase().indexOf('.png');
  return idx >= 0 ? url.slice(0, idx + 4) : url;
}

function extractAllImageUrls(html) {
  const results = [];
  const seen = new Set();
  const imgRegex = /<img\b[^>]*>/gi;
  const tags = html.match(imgRegex) || [];

  for (const tag of tags) {
    const dataSrcMatch = tag.match(/data-src="([^"]+)"/i);
    const srcMatch = tag.match(/\ssrc="([^"]+)"/i);
    const rawUrl = dataSrcMatch ? dataSrcMatch[1] : (srcMatch ? srcMatch[1] : null);
    if (!rawUrl) continue;
    const cleanUrl = trimAtPng(rawUrl);
    if (!seen.has(cleanUrl)) {
      seen.add(cleanUrl);
      results.push(cleanUrl);
    }
  }
  return results;
}

function main() {
  const args = parseArgs(process.argv);
  const inputPath = path.isAbsolute(args.in) ? args.in : path.join(process.cwd(), args.in);
  const outputPath = path.isAbsolute(args.out) ? args.out : path.join(process.cwd(), args.out);

  const html = readHtml(inputPath);
  const urls = extractAllImageUrls(html);
  fs.writeFileSync(outputPath, urls.join('\n') + (urls.length ? '\n' : ''), 'utf8');
  process.stdout.write(`Wrote ${urls.length} image URLs to ${path.relative(process.cwd(), outputPath)}\n`);
}

if (require.main === module) {
  try {
    main();
  } catch (err) {
    console.error(err.message || err);
    process.exit(1);
  }
}


