import { mountCloth, type ClothMode, type ClothStats } from './cloth';

const SVG_NS = 'http://www.w3.org/2000/svg';
const COOK_KEY = 'nan-cooked';

interface Labels {
  modes: Record<ClothMode, string>;
  stats: Record<ClothMode | 'ikMax', string>;
}

let teardown: (() => void) | null = null;

/**
 * Wires the home node network: draws the bezier wires between node ports,
 * links node hover/focus to the viewer technique, and keeps the parameter
 * panel in sync with whichever node the viewer is showing.
 */
export function initNetwork() {
  teardown?.();
  teardown = null;

  const root = document.querySelector<HTMLElement>('[data-network]');
  if (!root) return;

  const graph = root.querySelector<HTMLElement>('[data-graph]');
  const svg = root.querySelector<SVGSVGElement>('[data-wires]');
  const out = root.querySelector<HTMLElement>('[data-node-out]');
  const canvas = root.querySelector<HTMLCanvasElement>('[data-cloth]');
  if (!graph || !svg || !out) return;

  const nodes = [...root.querySelectorAll<HTMLAnchorElement>('[data-node]')];
  const netboxes = [...root.querySelectorAll<HTMLElement>('.netbox')];
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-mode-btn]')];
  const modeLabel = root.querySelector<HTMLElement>('[data-viewer-mode]');
  const statLabel = root.querySelector<HTMLElement>('[data-stat-label]');
  const statValue = root.querySelector<HTMLElement>('[data-stat-value]');
  const params = root.querySelector<HTMLElement>('[data-params]');
  const paramName = root.querySelector<HTMLElement>('[data-param-name]');
  const paramTagline = root.querySelector<HTMLElement>('[data-param-tagline]');
  const paramStack = root.querySelector<HTMLElement>('[data-param-stack]');
  const paramLink = root.querySelector<HTMLAnchorElement>('[data-param-link]');
  const labels = JSON.parse(root.dataset.labels ?? '{}') as Labels;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wide = window.matchMedia('(min-width: 1180px)');
  const cooking = document.documentElement.hasAttribute('data-cook');
  const controller = new AbortController();
  const { signal } = controller;

  const cloth = canvas
    ? mountCloth(canvas, { reducedMotion: reduced, onStats: renderStats })
    : null;

  const pressed = buttons.find((b) => b.getAttribute('aria-pressed') === 'true');
  let pinned = (pressed?.dataset.modeBtn ?? 'xpbd') as ClothMode;
  let shown: HTMLAnchorElement | null = null;
  const wires = new Map<HTMLElement, SVGPathElement[]>();

  function nodeFor(mode: ClothMode) {
    return nodes.find((node) => node.dataset.technique === mode) ?? null;
  }

  // --- Wires ----------------------------------------------------------------

  // One wire per network box: from the box's output port on its bus to an
  // input port on the output node. Phones use the CSS wire lane instead.
  function drawWires() {
    svg!.replaceChildren();
    wires.clear();
    if (!wide.matches) return;

    const box = root!.getBoundingClientRect();
    const target = out!.getBoundingClientRect();
    svg!.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    // Only paths drawn while the entrance sequence runs use a unit length;
    // a redraw after it ends must keep real lengths for the flow dashes.
    const drawing = document.documentElement.hasAttribute('data-cook');

    netboxes.forEach((netbox, index) => {
      const port = netbox.querySelector<HTMLElement>('[data-box-port]');
      if (!port) return;
      const rect = port.getBoundingClientRect();
      const x1 = rect.left + rect.width / 2 - box.left;
      const y1 = rect.top + rect.height / 2 - box.top;
      const x2 = target.left - box.left + target.width * ((index + 1) / (netboxes.length + 1));
      const y2 = target.top - box.top;
      const bend = Math.max(28, (y2 - y1) * 0.6);
      const d = `M${x1} ${y1} C${x1} ${y1 + bend} ${x2} ${y2 - bend} ${x2} ${y2}`;
      const active = netbox.querySelector('[data-active]') !== null;

      // An ink casing under the wire keeps the chartreuse flow legible on grey.
      const paths = ['wire-casing', 'wire'].map((className) => {
        const path = document.createElementNS(SVG_NS, 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', className);
        path.style.setProperty('--i', String(index * 2));
        if (drawing) path.setAttribute('pathLength', '1');
        path.classList.toggle('is-active', active);
        svg!.append(path);
        return path;
      });
      wires.set(netbox, paths);

      const input = document.createElementNS(SVG_NS, 'rect');
      input.setAttribute('class', 'port');
      input.setAttribute('x', String(x2 - 3.5));
      input.setAttribute('y', String(y2 - 3.5));
      input.setAttribute('width', '7');
      input.setAttribute('height', '7');
      svg!.append(input);
    });
  }

  let wirePending = 0;
  function scheduleWires() {
    if (wirePending) return;
    wirePending = requestAnimationFrame(() => {
      wirePending = 0;
      drawWires();
    });
  }

  const resizeObserver = new ResizeObserver(scheduleWires);
  resizeObserver.observe(root);
  wide.addEventListener('change', scheduleWires, { signal });
  document.fonts?.ready.then(scheduleWires);
  drawWires();

  // --- Viewer and parameters ------------------------------------------------

  function setActive(active: HTMLAnchorElement | null) {
    for (const node of nodes) node.toggleAttribute('data-active', node === active);
    for (const [netbox, paths] of wires) {
      const on = active !== null && netbox.contains(active);
      for (const path of paths) path.classList.toggle('is-active', on);
    }
  }

  function showParams(node: HTMLAnchorElement | null) {
    if (!node || node === shown || !params) return;
    shown = node;
    const name = node.querySelector('.node-name')?.textContent ?? '';
    if (paramName) paramName.textContent = name;
    if (paramTagline) {
      paramTagline.textContent = node.querySelector('[data-tagline]')?.textContent ?? '';
    }
    const stack = node.querySelector('.stack');
    if (paramStack && stack) paramStack.replaceChildren(stack.cloneNode(true));
    if (paramLink) paramLink.href = node.href;

    if (!reduced) {
      params.animate(
        [
          { opacity: 0.35, filter: 'blur(2px)' },
          { opacity: 1, filter: 'blur(0)' },
        ],
        { duration: 180, easing: 'cubic-bezier(0.23, 1, 0.32, 1)' },
      );
    }
  }

  function show(mode: ClothMode, node: HTMLAnchorElement | null) {
    cloth?.setMode(mode);
    if (modeLabel) modeLabel.textContent = labels.modes?.[mode] ?? mode;
    setActive(node);
    showParams(node);
  }

  function preview(node: HTMLAnchorElement) {
    const mode = node.dataset.technique as ClothMode | undefined;
    if (mode) show(mode, node);
  }

  function reset() {
    show(pinned, nodeFor(pinned));
  }

  function renderStats(stats: ClothStats) {
    if (!statLabel || !statValue) return;
    statLabel.textContent = labels.stats?.[stats.mode] ?? '';
    statValue.textContent =
      stats.mode === 'ik'
        ? `${stats.value.toFixed(1)} mm, ${labels.stats?.ikMax ?? 'max'} ${stats.secondary.toFixed(1)} mm`
        : `${stats.value.toFixed(stats.mode === 'xpbd' ? 2 : 1)} %`;
  }

  for (const node of nodes) {
    node.addEventListener(
      'pointerenter',
      (event) => {
        if (event.pointerType === 'mouse') preview(node);
      },
      { signal },
    );
    node.addEventListener('focus', () => preview(node), { signal });
  }

  graph.addEventListener(
    'pointerleave',
    (event) => {
      if (event.pointerType === 'mouse') reset();
    },
    { signal },
  );
  graph.addEventListener(
    'focusout',
    (event) => {
      if (!graph.contains(event.relatedTarget as Node | null)) reset();
    },
    { signal },
  );

  for (const button of buttons) {
    button.addEventListener(
      'click',
      () => {
        pinned = (button.dataset.modeBtn ?? 'xpbd') as ClothMode;
        for (const other of buttons) {
          other.setAttribute('aria-pressed', String(other === button));
        }
        reset();
      },
      { signal },
    );
  }

  // --- First-visit evaluation order -----------------------------------------

  let cookTimer = 0;
  if (cooking) {
    cookTimer = window.setTimeout(() => {
      document.documentElement.removeAttribute('data-cook');
      for (const paths of wires.values()) {
        for (const path of paths) path.removeAttribute('pathLength');
      }
      try {
        sessionStorage.setItem(COOK_KEY, '1');
      } catch {
        // Storage unavailable: the sequence simply plays again next visit.
      }
    }, 1600);
  }

  teardown = () => {
    controller.abort();
    resizeObserver.disconnect();
    cloth?.destroy();
    if (wirePending) cancelAnimationFrame(wirePending);
    window.clearTimeout(cookTimer);
  };
}

document.addEventListener('astro:before-swap', () => {
  teardown?.();
  teardown = null;
});
