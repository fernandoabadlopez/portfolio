# Product

<!-- impeccable:product-schema 1 -->

Thin product record for design tooling. `PROJECT_BRIEF.md` is the source of truth for architecture, content model and working rules; where the two disagree, the brief wins.

## Platform

web

## Users

Two audiences, weighted equally:

- Recruiters and hiring managers who scan the home page quickly, then forward the link to someone technical.
- Tech leads and engineers on real-time simulation, graphics, engine or digital-twin teams who read the case studies to judge technical depth.

Context: the owner is looking for international remote positions or relocation within the EU. The first viewport has to convince the scanner, and the case studies have to hold up under an expert's reading.

## Product Purpose

Personal technical portfolio of Fernando Abad López, real-time simulation and 3D graphics engineer. Success means a visitor leaves knowing what he builds and able to reach him, and a technical reader finds case studies worth reading to the end.

## Positioning

Full CPU-to-GPU range: he works across everything between CPU-side physics simulation and the graphics pipeline, from GPU shader programming (bloom, triplanar snow) to position-based physics (PBD, XPBD) and kinematic validation (IK against MoCap), and currently builds industrial simulation systems in a digital-twin environment.

## Operating Context

- Bilingual site (EN default under `/en/`, ES mirror under `/es/`).
- Home is the work index; case studies are long technical reads (roughly 700-1200 words each) with numbered figures, videos and code.
- Experiments and GPU galleries are not yet populated.

## Capabilities and Constraints

- Astro 5 + MDX, Tailwind 4, TypeScript strict, pnpm, Vercel. No new dependencies.
- Routes, collections, frontmatter schema and language structure are fixed.
- Case-study prose and About text are authored by the owner and must not be edited.

## Brand Commitments

- Signature: "NaN" (Not a Number), used as personal mark. No taglines around it.

## Evidence on Hand

- Case studies (EN + ES): bloom, xpbd, ik-validation, procedural-terrain in `src/content/case-studies/`. Grid-collision is planned but absent.
- Real media: five XPBD cloth simulation videos in `public/assets/xpbd/` (hero, corners-wide, corners-close, sphere-drape, center-bounce).
- About page text and contact links (email, GitHub, LinkedIn) in `src/pages/en/about/` and `src/pages/es/sobre-mi/`.
- Absent, must not be fabricated: media for bloom, ik-validation and procedural-terrain (placeholders); experiments and GPU gallery entries; testimonials, employers, metrics.

## Product Principles

1. Show the work running rather than describing it.
2. Never invent content; mark gaps as `[PENDING: ...]`.
3. The case studies are the product; everything else routes to them or to contact.
4. Readable for a scanner in seconds, rigorous for an expert in minutes.
