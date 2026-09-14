let observer: IntersectionObserver | null = null;

/**
 * Looping figure videos only play while on screen. Under reduced motion they
 * never autoplay and expose native controls instead.
 */
export function initFigures() {
  observer?.disconnect();
  observer = null;

  const videos = document.querySelectorAll<HTMLVideoElement>('video[data-autopause]');
  if (videos.length === 0) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const video = entry.target as HTMLVideoElement;
        if (entry.isIntersecting && !reduced) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      }
    },
    { rootMargin: '160px 0px' },
  );

  for (const video of videos) {
    if (reduced) {
      video.removeAttribute('autoplay');
      video.pause();
      video.controls = true;
    }
    observer.observe(video);
  }
}
