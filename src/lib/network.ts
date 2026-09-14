/** Where a case study runs, derived from its stack rather than hand-assigned. */
export type Domain = 'cpu' | 'gpu';

/** Technique the home viewer can draw on its live cloth for a given node. */
export type Technique = 'xpbd' | 'snow' | 'bloom' | 'ik';

const GPU_STACK = /glsl|hlsl|shader|opengl|vulkan|cuda|webgpu|directx/i;

export function domainOf(stack: string[]): Domain {
  return stack.some((item) => GPU_STACK.test(item)) ? 'gpu' : 'cpu';
}

const TECHNIQUES: Record<string, Technique> = {
  xpbd: 'xpbd',
  'procedural-terrain': 'snow',
  bloom: 'bloom',
  'ik-validation': 'ik',
};

/** Null for case studies the viewer has no illustration for yet. */
export function techniqueFor(slug: string): Technique | null {
  return TECHNIQUES[slug] ?? null;
}
