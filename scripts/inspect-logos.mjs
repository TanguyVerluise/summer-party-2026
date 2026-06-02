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
import sharp from "sharp";

const LOGOS_DIR = path.join(process.cwd(), "images", "logos");

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")
  );
}

function isWhiteish(r, g, b) {
  return r >= 240 && g >= 240 && b >= 240;
}

function colorsAgree(a, b, tol = 12) {
  return (
    Math.abs(a.r - b.r) <= tol &&
    Math.abs(a.g - b.g) <= tol &&
    Math.abs(a.b - b.b) <= tol
  );
}

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

  // All opaque corners share roughly the same color?
  const first = opaqueCorners[0];
  if (opaqueCorners.every((c) => colorsAgree(c, first))) {
    return {
      kind: "colored",
      hex: rgbToHex(first.r, first.g, first.b),
      rgb: `rgb(${first.r}, ${first.g}, ${first.b})`,
    };
  }

  return { kind: "mixed", corners };
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

async function main() {
  const files = await fs.readdir(LOGOS_DIR);
  files.sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }));

  const transparent = [];
  const white = [];
  const colored = [];
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
      } else {
        mixed.push(row);
      }
    } catch (e) {
      mixed.push({ file, kind: "error", error: e.message });
    }
  }

  console.log(`\n=== Background scan: ${files.length} logos ===\n`);

  console.log(`🟦 COLORED background (need card tint) — ${colored.length}:`);
  for (const r of colored) {
    console.log(`   ${r.file}\t${r.hex}${r.rgb ? "  " + r.rgb : ""}`);
  }
  if (colored.length === 0) console.log("   (none)");

  console.log(`\n🟫 MIXED / unclear — ${mixed.length}:`);
  for (const r of mixed) {
    console.log(`   ${r.file}\t${r.kind}${r.error ? " — " + r.error : ""}`);
  }
  if (mixed.length === 0) console.log("   (none)");

  console.log(`\n⬜ WHITE background — ${white.length}`);
  console.log(`◻️  TRANSPARENT background — ${transparent.length}`);
  console.log();

  // ---------- Emit lib/logo-colors.ts ----------
  const outPath = path.join(process.cwd(), "lib", "logo-colors.ts");
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

  await fs.writeFile(outPath, ts, "utf8");
  console.log(
    `→ Wrote ${colored.length} entries to lib/logo-colors.ts\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
