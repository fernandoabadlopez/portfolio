# Portfolio · Fernando Abad López

Personal technical portfolio. Positioning: real-time simulation and 3D graphics engineer.

Domain: nandoabad.dev
Signature: NaN (Not a Number, used as personal mark; do not add taglines around it)

## Stack decisions (fixed, do not question)

- Astro 5.x with MDX
- Tailwind CSS 4.x
- @tailwindcss/vite (Tailwind 4 wiring; replaces @astrojs/tailwind)
- TypeScript strict
- pnpm as package manager
- Vercel for hosting
- Prettier + ESLint minimal config
- @typescript-eslint/parser (required by astro-eslint-parser for TS in .astro frontmatter)
- Package name: portfolio

## Site architecture (fixed)

Default language: English. Root `/` redirects to `/en/`.

Routes:
- /en/                          Home
- /en/work/                     Work index
- /en/work/[slug]/              Case study page (5 total: bloom, xpbd, ik-validation, grid-collision, procedural-terrain)
- /en/experiments/              Simulation experiments gallery
- /en/gpu/                      GPU / OpenGL techniques gallery
- /en/about/                    About + contact (single page)

Spanish mirror:
- /es/                          Home
- /es/trabajo/
- /es/trabajo/[slug]/
- /es/experimentos/
- /es/gpu/
- /es/sobre-mi/

Contact is a section inside About, not a separate page.

## Content model

Content lives in `src/content/`. Three collections:
- case-studies (5 entries × 2 languages = 10 files)
- experiments (5 entries × 2 languages = 10 files)
- gpu-techniques (4 entries × 2 languages = 8 files)

Each entry is an `.mdx` file loaded by the glob loader from `src/content/<collection>/**/*.mdx`.
The canonical schema lives in `src/content/config.ts`; this section mirrors it.

case-studies frontmatter:
- title            string
- tagline          string
- stack            string[]
- order            number
- lang             "en" | "es"
- slug             string
- heroPlaceholder  boolean (default true)

experiments and gpu-techniques frontmatter:
- title            string
- blurb            string
- stack            string[]
- order            number
- lang             "en" | "es"
- slug             string
- gifPlaceholder   boolean (default true)

Case study bodies follow this structure: Context, Overview, then 3-6 technical sections chosen per project, ending in Links.

## Visual direction (WIP, do not lock in yet)

Aesthetic: brutalist, technical, high typographic hierarchy. Reference sites the owner is inspired by include paco.me, gt.folk.eco, iquilezles.org.

Typography (planned, not yet enforced):
- Display: Technor (Fontshare, weight 900)
- Body: Switzer (Fontshare)
- Mono: Geist Mono

Palette: not decided. Placeholder for now: black text, near-white background, one accent color TBD.

Do not invest effort in polishing visual design during setup phase. Prioritize working structure with real content.

## Rules for the assistant working in this repo

- Never invent content for the portfolio. Case studies, About text, and copy come from the owner via `PROJECT_BRIEF.md`, chat, or dedicated files. If content is missing, use a clearly-marked placeholder like `[PENDING: description]` and stop.
- Never add features not on this brief. No blog, no dark mode toggle, no analytics, no cookie banner, no CMS, no comments, no search. If tempted, ask first.
- Never install a package not explicitly approved in the brief. Ask before adding dependencies.
- Never change the site architecture (routes, collections, language structure). Ask first.
- Never edit content inside `.mdx` case study files except to fix Markdown/MDX syntax errors. The prose is authored elsewhere and pasted in.
- Prefer minimal implementations. When in doubt, do less.
- Language of the codebase: English (variable names, comments, commits). Content is bilingual per the architecture above.

## What is NOT in scope right now

- Final visual design (owner's designer friend may take over CSS later; keep styles isolated and easy to replace)
- SEO optimization beyond basic meta tags
- Performance optimization beyond Astro defaults
- Accessibility audit (basic semantic HTML is enough for now)
- Custom animations, transitions, or 3D effects on the site itself
- Analytics or tracking