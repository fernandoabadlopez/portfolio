import { existsSync } from 'node:fs';
import { join } from 'node:path';

export type MediaType = 'video' | 'image' | 'unsupported' | null;

/**
 * True when a root-relative asset path exists under public/. Runs at build
 * time, so a figure wired to a file that has not been added yet can fall back
 * to its placeholder instead of shipping a broken media element.
 */
export function assetExists(path: string | undefined): boolean {
  if (!path || !path.startsWith('/')) return false;
  return existsSync(join(process.cwd(), 'public', path.split(/[?#]/)[0]));
}

const VIDEO_EXTENSIONS = ['.mp4', '.webm'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

/** Detects asset type from a file extension. Ignores query strings and hashes. */
export function mediaType(path: string | undefined): MediaType {
  if (!path) return null;
  const clean = path.split(/[?#]/)[0].toLowerCase();
  const extension = clean.slice(clean.lastIndexOf('.'));
  if (VIDEO_EXTENSIONS.includes(extension)) return 'video';
  if (IMAGE_EXTENSIONS.includes(extension)) return 'image';
  return 'unsupported';
}
