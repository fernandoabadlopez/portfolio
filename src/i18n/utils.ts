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

/**
 * Route keys shown in the nav, in order. Work is deliberately absent: the home
 * page is the work index, reachable through the NaN monogram.
 */
export const navItems = ['experiments', 'gpu', 'about'] as const;

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

/** One segment of the section indicator. Only non-final segments get an href. */
export interface TrailSegment {
  label: string;
  href?: string;
}

/**
 * Breadcrumb trail for the nav's section indicator, e.g. Work / bloom.
 * Rendered uppercase by CSS. Home has no indicator, so returns null.
 */
export function sectionTrail(pathname: string, lang: Lang): TrailSegment[] | null {
  if (pathname === paths.home[lang]) return null;

  const labels = ui[lang].nav;
  const workBase = paths.work[lang];

  if (pathname.startsWith(workBase)) {
    const slug = pathname.slice(workBase.length).replace(/\/$/, '');
    // The work index redirects home, so the Work segment points straight there.
    return slug
      ? [{ label: labels.work, href: paths.home[lang] }, { label: slug }]
      : [{ label: labels.work }];
  }

  for (const key of ['experiments', 'gpu', 'about'] as const) {
    if (pathname === paths[key][lang]) return [{ label: labels[key] }];
  }

  return null;
}

/** True when `pathname` is the nav entry for `key`, including its sub-pages. */
export function isActiveRoute(pathname: string, key: RouteKey, lang: Lang): boolean {
  return pathname === paths[key][lang] || pathname.startsWith(paths[key][lang]);
}
