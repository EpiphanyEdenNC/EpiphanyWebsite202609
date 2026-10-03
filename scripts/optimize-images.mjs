import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const uploadsRoot = path.resolve('public/images/uploads');
const maxWidth = 1800;
const webpQuality = 82;
const rasterExtensions = new Set(['.jpg', '.jpeg', '.png']);

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function optimize(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (!rasterExtensions.has(extension)) return false;

  const outputPath = `${filePath}.webp`;

  try {
    const sourceStat = await fs.stat(filePath);

    try {
      const outputStat = await fs.stat(outputPath);
      if (outputStat.mtimeMs >= sourceStat.mtimeMs) {
        return false;
      }
    } catch {
      // No current generated WebP exists yet.
    }

    await sharp(filePath)
      .rotate()
      .resize({
        width: maxWidth,
        withoutEnlargement: true,
      })
      .webp({
        quality: webpQuality,
        effort: 4,
      })
      .toFile(outputPath);

    return true;
  } catch (error) {
    console.warn(
      `Image optimization skipped for ${path.relative(process.cwd(), filePath)}: ${error.message}`
    );
    return false;
  }
}

let files;
try {
  files = await walk(uploadsRoot);
} catch (error) {
  if (error.code === 'ENOENT') {
    console.log('No Tina uploads directory found; skipping image optimization.');
    process.exit(0);
  }
  throw error;
}

let generated = 0;
for (const filePath of files) {
  if (await optimize(filePath)) generated += 1;
}

console.log(
  `Image optimization complete: generated ${generated} WebP file${generated === 1 ? '' : 's'} (max width ${maxWidth}px, quality ${webpQuality}).`
);
