import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const lang = z.enum(['en', 'es']);

const caseStudies = defineCollection({
  loader: glob({ base: './src/content/case-studies', pattern: '**/*.mdx' }),
  schema: z.object({
    title: z.string(),
    tagline: z.string(),
    stack: z.array(z.string()),
    order: z.number(),
    lang,
    slug: z.string(),
    heroPlaceholder: z.boolean().default(true),
  }),
});

const galleryEntry = z.object({
  title: z.string(),
  blurb: z.string(),
  stack: z.array(z.string()),
  order: z.number(),
  lang,
  slug: z.string(),
  gifPlaceholder: z.boolean().default(true),
});

const experiments = defineCollection({
  loader: glob({ base: './src/content/experiments', pattern: '**/*.mdx' }),
  schema: galleryEntry,
});

const gpuTechniques = defineCollection({
  loader: glob({ base: './src/content/gpu-techniques', pattern: '**/*.mdx' }),
  schema: galleryEntry,
});

export const collections = {
  'case-studies': caseStudies,
  experiments: experiments,
  'gpu-techniques': gpuTechniques,
};
