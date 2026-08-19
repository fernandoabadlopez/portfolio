import en from './en.json';
import es from './es.json';

export const languages = ['en', 'es'] as const;
export type Lang = (typeof languages)[number];

export const ui = { en, es } as const;

/** Canonical route keys mapped to the localised path for each language. */
const paths = {
  home: { en: '/en/', es: '/es/' },
  work: { en: '/en/work/', es: '/es/trabajo/' },
  experiments: { en: '/en/experiments/', es: '/es/experimentos/' },
  gpu: { en: '/en/gpu/', es: '/es/gpu/' },
  about: { en: '/en/about/', es: '/es/sobre-mi/' },
} as const;

export type RouteKey = keyof typeof paths;

/** Route keys shown in the nav, in order. */
export const navItems = ['work', 'experiments', 'gpu', 'about'] as const;

export function path(key: RouteKey, lang: Lang): string {
  return paths[key][lang];
}

/**
 * The equivalent of `pathname` in another language. Case study detail pages
 * keep their slug, everything else falls back to that language's home.
 */
export function alternatePath(pathname: string, from: Lang, to: Lang): string {
  if (from === to) return pathname;

  const keys = Object.keys(paths) as RouteKey[];

  for (const key of keys) {
    if (pathname === paths[key][from]) return paths[key][to];
  }

  const workFrom = paths.work[from];
  if (pathname.startsWith(workFrom)) {
    return paths.work[to] + pathname.slice(workFrom.length);
  }

  return paths.home[to];
}
