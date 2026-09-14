let observer: IntersectionObserver | null = null;

/** Marks the section currently being read in the case study rail. */
export function initCaseRail() {
  observer?.disconnect();
  observer = null;

  const rail = document.querySelector<HTMLElement>('[data-case-rail]');
  if (!rail) return;

  const links = [...rail.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')];
  const byId = new Map<string, HTMLAnchorElement>();
  const targets: HTMLElement[] = [];

  for (const link of links) {
    const id = decodeURIComponent(link.hash.slice(1));
    const target = document.getElementById(id);
    if (!target) continue;
    byId.set(id, link);
    targets.push(target);
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        for (const link of links) link.removeAttribute('aria-current');
        byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
      }
    },
    { rootMargin: '-20% 0px -70% 0px' },
  );

  for (const target of targets) observer.observe(target);
}
