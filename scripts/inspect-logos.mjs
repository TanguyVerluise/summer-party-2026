#!/usr/bin/env node
/**
 * Inspect every logo in images/logos/ and classify its background:
 *  - transparent   → alpha ~0 on the 4 corners
 *  - white         → corners are ~white (RGB 240+)
 *  - colored       → corners share a non-white opaque color → report the color
 *  - mixed         → corners disagree (probably content reaches the edges)
 *
 * SVG files are inspected by looking at <svg fill="..."> / first <rect> / a
 * top-level background fill — best-effort.
 *
 * Side effect: writes lib/logo-colors.ts with a `{filename → hex}` map for
 * every logo whose corners give us a confident non-white background. Used at
 * runtime by GuestCard to tint the badge so the logo blends seamlessly.
 *
 * Usage: node scripts/inspect-logos.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.join(path.dirname(__filename), "..");
const LOGOS_DIR = path.join(PROJECT_ROOT, "images", "logos");

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")
  );
}

function isWhiteish(r, g, b) {
  // Genuine white / light grey only: all channels are bright AND nearly equal.
  // A slight tint like #FFF0F7 (very pale pink, e.g. d_lighter.jpeg) has
  // 255-240=15 between max and min — that's NOT neutral, so we don't treat it
  // as white. The badge should be tinted to match.
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min >= 240 && max - min <= 8;
}

function colorsAgree(a, b, tol = 12) {
  return (
    Math.abs(a.r - b.r) <= tol &&
    Math.abs(a.g - b.g) <= tol &&
    Math.abs(a.b - b.b) <= tol
  );
}

// A logo qualifies for badge tinting only when it is a "solid tile" — i.e.
// the four corners are opaque AND the image as a whole has almost no
// transparent pixels. Logos with significant transparent padding (e.g.
// HomeExchange, ABtasty, adeo) are visually fine on a white badge because
// the badge bg is supposed to peek through that padding — those should NOT
// be tinted, even if their corners happen to be colored.
const MAX_TRANSPARENT_PCT_FOR_TINT = 0.05;

async function inspectRaster(file) {
  const img = sharp(file).ensureAlpha();
  const meta = await img.metadata();
  const { width, height } = meta;

  // Read raw RGBA pixel data
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });

  function px(x, y) {
    const i = (y * width + x) * 4;
    return { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] };
  }

  // Sample the 4 corners (1px inset to avoid stray edge pixels)
  const corners = [
    px(1, 1),
    px(width - 2, 1),
    px(1, height - 2),
    px(width - 2, height - 2),
  ];

  // If all corners have alpha < 16, treat as transparent.
  if (corners.every((c) => c.a < 16)) {
    return { kind: "transparent" };
  }

  // If any corner is non-opaque but others are opaque → mixed-ish, but
  // count opaque corners only for the color test.
  const opaqueCorners = corners.filter((c) => c.a > 200);
  if (opaqueCorners.length === 0) {
    return { kind: "transparent" }; // semi-transparent overall
  }

  // All opaque corners white-ish?
  if (opaqueCorners.every((c) => isWhiteish(c.r, c.g, c.b))) {
    return { kind: "white" };
  }

  // Count fully transparent pixels across the whole image — if this is
  // significant, the image has transparent padding and the badge bg is
  // meant to show through. Don't tint.
  let transparentCount = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 16) transparentCount++;
  }
  const transparentPct = transparentCount / (width * height);

  // All opaque corners share roughly the same color?
  const first = opaqueCorners[0];
  if (opaqueCorners.every((c) => colorsAgree(c, first))) {
    if (transparentPct < MAX_TRANSPARENT_PCT_FOR_TINT) {
      // Solid tile → tint the badge to match.
      return {
        kind: "colored",
        hex: rgbToHex(first.r, first.g, first.b),
        rgb: `rgb(${first.r}, ${first.g}, ${first.b})`,
        transparentPct,
      };
    }
    // Colored corners but significant transparent padding → leave the
    // badge white, the padding will show through naturally.
    return {
      kind: "colored-with-padding",
      hex: rgbToHex(first.r, first.g, first.b),
      transparentPct,
    };
  }

  return { kind: "mixed", corners, transparentPct };
}

async function inspectSvg(file) {
  const text = await fs.readFile(file, "utf8");

  // Look for an explicit background-like fill: a top-level <rect ... fill="...">
  // or a style="background-color: ..." or fill on the <svg> tag itself.
  const rectFill = text.match(
    /<rect\b[^>]*\bfill=["']([^"']+)["'][^>]*\bwidth=["'](?:100%|\d+)["']/i
  );
  if (rectFill) {
    const fill = rectFill[1].toLowerCase();
    if (fill === "none" || fill === "transparent") return { kind: "transparent" };
    if (fill === "white" || fill === "#fff" || fill === "#ffffff")
      return { kind: "white" };
    return { kind: "colored", hex: fill };
  }

  const svgFill = text.match(/<svg\b[^>]*\bfill=["']([^"']+)["']/i);
  if (svgFill) {
    const fill = svgFill[1].toLowerCase();
    if (fill === "none" || fill === "transparent") return { kind: "transparent" };
    if (fill === "white" || fill === "#fff" || fill === "#ffffff")
      return { kind: "white" };
    return { kind: "colored", hex: fill };
  }

  // No explicit background → SVGs are transparent by default.
  return { kind: "transparent (default)" };
}

export async function inspectLogos({ silent = false } = {}) {
  const log = silent ? () => {} : (...a) => console.log(...a);

  const files = await fs.readdir(LOGOS_DIR);
  files.sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const transparent = [];
  const white = [];
  const colored = [];
  const coloredWithPadding = [];
  const mixed = [];

  for (const file of files) {
    if (file.startsWith(".")) continue;
    const full = path.join(LOGOS_DIR, file);
    const ext = path.extname(file).toLowerCase();

    try {
      const result =
        ext === ".svg" ? await inspectSvg(full) : await inspectRaster(full);

      const row = { file, ...result };
      if (result.kind === "transparent" || result.kind === "transparent (default)") {
        transparent.push(row);
      } else if (result.kind === "white") {
        white.push(row);
      } else if (result.kind === "colored") {
        colored.push(row);
      } else if (result.kind === "colored-with-padding") {
        coloredWithPadding.push(row);
      } else {
        mixed.push(row);
      }
    } catch (e) {
      mixed.push({ file, kind: "error", error: e.message });
    }
  }

  log(`\n=== Background scan: ${files.length} logos ===\n`);

  log(`🟦 SOLID COLORED TILE (badge will be tinted) — ${colored.length}:`);
  for (const r of colored) {
    log(`   ${r.file}\t${r.hex}${r.rgb ? "  " + r.rgb : ""}`);
  }
  if (colored.length === 0) log("   (none)");

  log(`\n🎨 Colored corners but has transparent padding (badge stays white) — ${coloredWithPadding.length}:`);
  for (const r of coloredWithPadding) {
    const pct = ((r.transparentPct ?? 0) * 100).toFixed(0);
    log(`   ${r.file}\t${r.hex}\t(${pct}% transparent)`);
  }
  if (coloredWithPadding.length === 0) log("   (none)");

  log(`\n🟫 MIXED / unclear — ${mixed.length}:`);
  for (const r of mixed) {
    log(`   ${r.file}\t${r.kind}${r.error ? " — " + r.error : ""}`);
  }
  if (mixed.length === 0) log("   (none)");

  log(`\n⬜ WHITE background — ${white.length}`);
  log(`◻️  TRANSPARENT background — ${transparent.length}`);
  log();

  // ---------- Emit lib/logo-colors.ts ----------
  const outPath = path.join(PROJECT_ROOT, "lib", "logo-colors.ts");
  const entries = colored
    .map((r) => `  ${JSON.stringify(r.file)}: ${JSON.stringify(r.hex)},`)
    .sort()
    .join("\n");

  const ts = `// AUTO-GENERATED by scripts/inspect-logos.mjs — do not edit by hand.
// Maps logo filename → dominant background colour (sampled from the four
// corner pixels). GuestCard uses this to tint the logo badge so coloured-
// background logos (mesdarons, openclassrooms2, …) don't sit inside a white
// rectangle. Re-run \`node scripts/inspect-logos.mjs\` after uploading new
// logos.

export const LOGO_BG_COLORS: Record<string, string> = {
${entries}
};
`;

  // Only write if content actually changed → avoids dirtying git on no-op runs.
  let changed = true;
  try {
    const prev = await fs.readFile(outPath, "utf8");
    changed = prev !== ts;
  } catch {
    /* file doesn't exist yet → changed = true */
  }

  if (changed) {
    await fs.writeFile(outPath, ts, "utf8");
    log(`→ Wrote ${colored.length} entries to lib/logo-colors.ts\n`);
  } else {
    log(`→ lib/logo-colors.ts unchanged (${colored.length} entries)\n`);
  }

  return { colored, mixed, white, transparent, changed };
}

// Run as CLI when invoked directly (not when imported).
const isMainModule = process.argv[1] === __filename;
if (isMainModule) {
  inspectLogos().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
