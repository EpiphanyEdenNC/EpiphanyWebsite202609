import { existsSync } from 'node:fs';
import path from 'node:path';

const rasterImagePattern = /\.(?:jpe?g|png)$/i;

export function getGeneratedWebp(src?: string | null): string | null {
  if (!import.meta.env.PROD || !src || !rasterImagePattern.test(src)) {
    return null;
  }

  const webpSrc = `${src}.webp`;
  const diskPath = path.join(
    process.cwd(),
    'public',
    webpSrc.replace(/^\/+/, '')
  );

  return existsSync(diskPath) ? webpSrc : null;
}
