export type MediaType = 'video' | 'image' | 'unsupported' | null;

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
