/**
 * Upload local images to Vercel Blob via the deployed API route.
 *
 * Structure attendue :
 *   images/photos/prenom-nom.jpg   → summer-party/photos/prenom-nom.jpg
 *   images/logos/entreprise.png     → summer-party/logos/entreprise.png
 *
 * Le script est idempotent : il skip les fichiers déjà uploadés (même pathname).
 *
 * Usage :
 *   node scripts/upload-images.mjs              # upload tout
 *   node scripts/upload-images.mjs --photos     # photos seulement
 *   node scripts/upload-images.mjs --logos      # logos seulement
 *   node scripts/upload-images.mjs --force      # re-upload même si déjà présent
 */

import { readFileSync, readdirSync } from "fs";
import { join, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

const API_BASE = process.env.API_BASE || "https://summer-party-2026.vercel.app";
const UPLOAD_SECRET = process.env.REVALIDATION_SECRET;

if (!UPLOAD_SECRET) {
  console.error("❌ Missing REVALIDATION_SECRET env var");
  process.exit(1);
}

const args = process.argv.slice(2);
const photosOnly = args.includes("--photos");
const logosOnly = args.includes("--logos");
const force = args.includes("--force");

const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]);

/** List files already on Blob */
async function getExistingBlobs() {
  const existing = new Set();
  try {
    const res = await fetch(`${API_BASE}/api/upload?prefix=summer-party/`, {
      headers: { "x-upload-secret": UPLOAD_SECRET },
    });
    if (res.ok) {
      const data = await res.json();
      for (const b of data.blobs) {
        existing.add(b.pathname);
      }
    }
  } catch (err) {
    console.warn("⚠️  Could not list existing blobs:", err.message);
  }
  return existing;
}

/** Get image files from a local directory */
function getLocalImages(dir) {
  try {
    return readdirSync(dir)
      .filter(
        (f) =>
          IMAGE_EXTS.has(extname(f).toLowerCase()) && !f.startsWith(".")
      )
      .sort();
  } catch {
    return [];
  }
}

function mimeType(ext) {
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
  };
  return map[ext.toLowerCase()] || "image/jpeg";
}

/** Upload a single file via API route */
async function uploadFile(localPath, blobPath, contentType) {
  const buffer = readFileSync(localPath);
  const blob = new Blob([buffer], { type: contentType });
  const filename = blobPath.split("/").pop();

  const form = new FormData();
  form.append("file", blob, filename);
  form.append("pathname", blobPath);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    headers: { "x-upload-secret": UPLOAD_SECRET },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }

  const data = await res.json();
  return data.url;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log(`🏖️  Upload images to Vercel Blob`);
  console.log(`   API: ${API_BASE}`);
  console.log();

  console.log("🔍 Checking existing blobs...");
  const existing = force ? new Set() : await getExistingBlobs();
  if (!force && existing.size > 0)
    console.log(`   ${existing.size} files already on Blob\n`);

  const folders = [];
  if (!logosOnly)
    folders.push({
      type: "photos",
      dir: join(PROJECT_ROOT, "images/photos"),
    });
  if (!photosOnly)
    folders.push({ type: "logos", dir: join(PROJECT_ROOT, "images/logos") });

  let uploaded = 0;
  let skipped = 0;
  const results = { photos: [], logos: [] };

  for (const { type, dir } of folders) {
    const files = getLocalImages(dir);
    if (files.length === 0) {
      console.log(`📂 images/${type}/ — vide\n`);
      continue;
    }

    console.log(`📂 images/${type}/ — ${files.length} fichier(s)\n`);

    for (const file of files) {
      const ext = extname(file);
      const blobPath = `summer-party/${type}/${file}`;
      const localPath = join(dir, file);

      if (existing.has(blobPath)) {
        console.log(`   ⏭  ${file} (déjà uploadé)`);
        skipped++;
        continue;
      }

      try {
        const url = await uploadFile(localPath, blobPath, mimeType(ext));
        console.log(`   ✅ ${file}`);
        console.log(`      ${url}`);
        results[type].push({ file, url });
        uploaded++;
      } catch (err) {
        console.error(`   ❌ ${file}: ${err.message}`);
      }
    }
    console.log();
  }

  // ── Summary with copy-pasteable URLs ──
  console.log(`${"═".repeat(60)}`);
  console.log(`  Uploadés: ${uploaded}  |  Skippés: ${skipped}`);
  console.log(`${"═".repeat(60)}\n`);

  for (const type of ["photos", "logos"]) {
    if (results[type].length === 0) continue;

    const label = type === "photos" ? "📸 PHOTOS" : "🏢 LOGOS";
    console.log(`${label} — ${results[type].length} nouvelles images :`);
    console.log(`${"─".repeat(60)}`);
    console.log(`Fichier\tURL`);
    for (const { file, url } of results[type]) {
      const name = file.replace(/\.[^.]+$/, ""); // sans extension
      console.log(`${name}\t${url}`);
    }
    console.log(`${"─".repeat(60)}\n`);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
