---
name: NaN
description: Portfolio of Fernando Abad López laid out as a live node network, wired from CPU simulation to GPU pixels into one output.
colors:
  network-ground: "#e3e6e9"
  node-body: "#f1f3f4"
  netbox-grey: "#d8dce0"
  ink: "#101214"
  ink-quiet: "#4a5057"
  wire-grey: "#8a9096"
  hairline: "#c3c8ce"
  chartreuse-signal: "#c6f432"
  viewer-ground: "#101214"
  viewer-ink: "#e3e6e9"
  viewer-ink-quiet: "#9aa2aa"
  viewer-hairline: "#262a2e"
typography:
  display:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.1rem, 5.6vw, 5.25rem)"
    fontWeight: 850
    lineHeight: 0.95
    letterSpacing: "-0.035em"
    fontVariation: "font-stretch 138%"
  headline:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 4.6vw, 3.9rem)"
    fontWeight: 820
    lineHeight: 1.02
    letterSpacing: "-0.03em"
    fontVariation: "font-stretch 118%"
  title:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.375rem, 2.2vw, 1.75rem)"
    fontWeight: 760
    lineHeight: 1.2
    letterSpacing: "-0.02em"
    fontVariation: "font-stretch 110%"
  subtitle:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 650
    lineHeight: 1.3
  node-title:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 560
    lineHeight: 1.3
  body:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  brand:
    fontFamily: "Martian Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 900
    letterSpacing: "-0.02em"
    fontVariation: "font-stretch 160%"
  label:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.5
  label-small:
    fontFamily: "Martian Mono, ui-monospace, SFMono-Regular, Menlo, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.5
    fontFeature: "tnum"
rounded:
  base: "4px"
  inset: "3px"
spacing:
  hair: "1px"
  xs: "0.375rem"
  sm: "0.625rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  gutter: "clamp(1rem, 3vw, 2.5rem)"
  shell: "90rem"
  measure: "68ch"
  nav-height: "3.5rem"
components:
  node:
    backgroundColor: "{colors.node-body}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    typography: "{typography.node-title}"
  node-head:
    typography: "{typography.label}"
    padding: "0.3rem 0.5rem"
  node-head-active:
    backgroundColor: "{colors.chartreuse-signal}"
    textColor: "{colors.ink}"
  node-output:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.network-ground}"
    rounded: "{rounded.base}"
    width: "15rem"
  netbox:
    backgroundColor: "{colors.netbox-grey}"
    rounded: "{rounded.base}"
    padding: "0.625rem 0.625rem 1rem 1.75rem"
  params-pane:
    backgroundColor: "{colors.node-body}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
    padding: "0.875rem"
  viewer-frame:
    backgroundColor: "{colors.viewer-ground}"
    textColor: "{colors.viewer-ink}"
    rounded: "{rounded.base}"
  mode-button:
    backgroundColor: "{colors.node-body}"
    textColor: "{colors.ink-quiet}"
    typography: "{typography.label-small}"
    padding: "0.4rem 0.5rem"
  mode-button-hover:
    backgroundColor: "{colors.network-ground}"
    textColor: "{colors.ink}"
  mode-button-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.network-ground}"
  stack-token:
    backgroundColor: "{colors.node-body}"
    textColor: "{colors.ink-quiet}"
    typography: "{typography.label-small}"
    rounded: "{rounded.base}"
    padding: "0.125rem 0.4rem"
  lang-switch-current:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.network-ground}"
    typography: "{typography.label-small}"
    padding: "0.2rem 0.5rem"
  lang-switch-option-hover:
    backgroundColor: "{colors.netbox-grey}"
    textColor: "{colors.ink}"
  code-block:
    backgroundColor: "{colors.viewer-ground}"
    textColor: "{colors.viewer-ink}"
    rounded: "{rounded.base}"
    padding: "1.125rem 1.25rem"
---

# Design System: NaN

## Overview

**Creative North Star: "The Node Network"**

The site is laid out like a compositing or procedural node graph (Houdini, Nuke). The work sits in network boxes grouped by where it runs, CPU or GPU. Each case study is a node, named by its slug. Wires carry the evaluation from the boxes into one output node, NaN. The ground is a cool, even grey. Node bodies are a shade lighter, and anything rendered or computed (the live cloth, videos, code) sits inside a dark viewer frame. The page reads as a working tool, not a showcase. Status is printed inside the nodes as text, never pinned on as a badge.

Density is medium. Nodes are compact, with a mono header strip and a proportional title, and case studies open into a long read at a fixed measure. The type does the expressive work: Martian Grotesk set wide and very heavy for names and titles, regular for reading. Martian Mono is kept for identifiers, parameters, figure labels and code. Surfaces are flat. Structure comes from 1px hairlines, tonal steps between ground, box and node, and one signal colour that marks what is active.

There is one theme: a light ground with dark viewer frames. There is no dark mode and no toggle. The system rejects both the name-hero-over-project-card-grid layout and the near-black neon developer portfolio.

**Key Characteristics:**
- Cool grey tonal layering (ground, netbox, node body) with hairline rules and no shadows.
- One chartreuse signal for the active path: the flowing wire, the selected node header and its port, the current rail section, and text selection.
- Wide, heavy Martian Grotesk for display. Martian Mono only for things a tool would print.
- A single 4px corner radius on every surface. Ports and rail markers are square 7px nodes.
- Dark viewer frames hold everything rendered: canvas, video, code.
- Motion follows evaluation order: nodes resolve, wires draw, the output resolves last.

## Colors

A near-monochrome, cool grey instrument palette with one high-voltage chartreuse signal.

### Primary
- **Chartreuse Signal** (chartreuse-signal): Marks the active path only. It fills the selected node's header strip and its bus port, colours the flowing dashes of the active wire (over an ink casing), fills the current section marker in the case-study rail, and backs the text selection. It also highlights the grab and pin points in the live cloth canvas. It never fills a large area and is never used for text on the grey ground.

### Neutral
- **Network Ground** (network-ground): The page background, sticky header and `theme-color`. It is also the text colour on ink surfaces.
- **Node Body** (node-body): Node, parameter pane, stack token, path bar, inline code and unpressed switch backgrounds, plus port fills.
- **Netbox Grey** (netbox-grey): The recessed box that groups nodes by domain, and the hover fill for language options.
- **Ink** (ink): Primary text, node hover borders, port outlines, the output node, the pressed switch, the current language, the focus ring and the active wire casing.
- **Ink Quiet** (ink-quiet): Secondary text, including role line, taglines, parameter labels, footer, rail links, figure bars and stack tokens.
- **Wire Grey** (wire-grey): Inactive wires, bus lanes, the rail spine, path separators, list markers, resting link underlines and the scrollbar thumb.
- **Hairline** (hairline): Every 1px rule and border on the light ground. It also draws the hatching lines on pending media and the gutter lines of the mode switch.
- **Viewer Ground** (viewer-ground): The inside of dark frames: cloth viewer, figure boxes, code blocks. It shares ink's value but is a separate role, so frames can be retuned without touching text.
- **Viewer Ink** / **Viewer Ink Quiet** (viewer-ink, viewer-ink-quiet): Readouts and labels inside dark frames.
- **Viewer Hairline** (viewer-hairline): Rules between the viewer's bands and its stage.

### Named Rules
**The One Signal Rule.** Chartreuse means "this is the live path". If an element isn't active, selected or current, it doesn't get chartreuse.

**The Rendered-Goes-Dark Rule.** Anything computed or rendered (canvas, video, image, code) sits on the viewer ground. UI chrome never does.

## Typography

**Display Font:** Martian Grotesk (variable, wght 100–1000, wdth 75–200; fallback ui-sans-serif, system-ui)
**Body Font:** Martian Grotesk
**Label/Mono Font:** Martian Mono (variable, wght 100–800, wdth 75–112.5; fallback ui-monospace, SFMono-Regular, Menlo)

**Character:** Martian is a single superfamily with one voice at two widths. The grotesk is stretched wide and set very heavy for anything that names something, and runs at normal width for reading. The mono is the voice of the tool.

### Hierarchy
- **Brand** (900, 1.125rem, stretch 160%): The NaN mark in the header and the output node's name.
- **Display** (850, clamp 2.1–5.25rem, stretch 138%, line-height 0.95, balanced): The home name only.
- **Headline** (820, clamp 2–3.9rem, stretch 118%, max 17em): Case study and page titles.
- **Title** (760, clamp 1.375–1.75rem, stretch 110%): Prose h2 and the contact heading.
- **Subtitle** (650, 1.125rem): Prose h3.
- **Node Title** (560, 0.9375rem, 1.3): Node titles. The output node's title steps up to 1.0625rem.
- **Body** (400, 1.0625rem, line-height 1.7, 68ch measure): Case-study prose. Taglines and the role line use proportional clamps between 1.0625rem and 1.375rem in Ink Quiet.
- **Label** (Mono 500, 0.75rem): Node names, netbox labels, parameter names and labels, and the path bar (lowercase).
- **Label Small** (Mono, 0.6875rem, tabular numbers where numeric): Stack tokens, switch buttons, viewer bands, figure bars and the language switch (uppercase).

### Named Rules
**The Tool Prints In Mono Rule.** Mono is for things a node editor would print: slugs, parameters, readouts, figure numbers, code. Sentences use the grotesk.

**The Width Is Weight Rule.** Hierarchy climbs by weight and stretch together. The larger the role, the wider and heavier it gets (110% → 118% → 138% → 160% for the mark).

## Layout

The page sits in a centred shell (90rem max) with a fluid gutter (clamp 1–2.5rem). A 3.5rem sticky header carries a hairline underneath. On inner pages a mono path bar in Node Body runs under the header. Spacing moves in small steps: 0.625rem inside nodes and lists, 1rem to 1.5rem between blocks, and 2.5rem+ between sections, with vertical padding in clamps.

**Home network.** The grid areas are graph, viewer and lower row. The lower row holds the parameter pane and the output node.
- **Below 480px:** The nav splits into two rows (mark and language switch on top, links below at full width). The technique switch becomes a 2×2 grid. Parameter lists stack each label above its value.
- **Below 768px:** Netboxes stack in one column, each with its own vertical bus lane. Nodes show their tagline and stack inline. The parameter pane keeps only the name and the open link. The order is graph, viewer, parameters, then NaN last.
- **768px and up:** The graph has two netbox columns. The lower row is a flex row with a 15rem output node. Node details hide, and the parameter pane shows tagline and stack. Up to 1179px, the viewer splits 3fr/2fr, with the frame spanning two rows beside the switch and note. Figure pairs go two-up.
- **1180px and up:** The network becomes 7fr/5fr. The viewer spans the right column, and the output node sits left of the parameter pane directly under the graph. SVG bezier wires and the box output ports appear only here, where the output node sits under the graph so the wires can drop straight into it. The case study gains a sticky 13.5rem section rail beside the body.

**Case study.** The body is a two-track grid: prose at `min(68ch, 100%)` plus trailing space, capped at 64rem. Figures, code blocks and full-width elements span both tracks. Figure boxes use 16:9 for hero figures and 4:3 for inline and gallery figures.

### Named Rules
**The Wires Only Where They Land Rule.** Draw SVG wires only when the output node sits below the graph. Wherever it follows the viewer, each box keeps its own bus lane instead.

## Elevation & Depth

The system is flat, with no box-shadows anywhere. Depth comes from three tonal layers: Network Ground, the recessed Netbox Grey box, and the lighter Node Body raised inside it. Edges are 1px hairlines, and dark viewer frames punch through the page for rendered content. Hover darkens a node's border to ink instead of lifting it.

### Named Rules
**The Hairline, Not Shadow Rule.** Separate with a 1px Hairline or a tonal step, never with a shadow. Hover and focus change stroke colour, never elevation.

## Shapes

One gentle radius (4px) covers nodes, boxes, frames, panes, tokens, the switch and the language control. Inline code uses 3px, and the node header and hatched pending body inset theirs by 1px so they sit flush inside their parent. Ports, bus terminals and rail markers are square 7px nodes with a 1px stroke. Wires are cubic beziers, 1.5px at rest and 2px with 7/5 dashes over a 4.5px ink casing when active. Pending media is hatched at 135° in Hairline (1px lines every 11px) over Node Body. Lists use square markers.

## Components

### Nodes
Nodes are compact, legible cards of the tool, and each one is a link.
- **Structure:** A Node Body card with a hairline border and 4px radius. Its mono header strip (node name left, printed state right) sits over a hairline, with a grotesk title below.
- **Active:** The header fills with Chartreuse Signal, the state text ("in viewer") appears, and the bus port fills chartreuse.
- **Hover / Focus:** On fine pointers the border shifts to ink (150ms ease). Hover or focus previews that node's technique in the viewer and loads its parameters. Focus uses the global ring, a 2px ink outline offset by 3px.
- **Press:** Scales to 0.98 (160ms ease-out).
- **Output node (NaN):** An ink card with ground-coloured text, the mark as its name, and "About" as its title. The title underlines on hover.
- **Pending node:** Same structure, with a printed count state ("0 nodes") and a hatched mono body.

### Network Boxes
A recessed Netbox Grey panel with a mono domain label (CPU, GPU). Its nodes hang off a 1px Wire Grey bus on the left, each joined by a 7px port. At 1180px and up the bus leaves through one output port at the bottom.

### Viewer
A dark frame for the live XPBD cloth. It has a top mono band (mode name, drag hint) and the canvas stage (16:11, grab cursor). A bottom band carries tabular readouts (a live stat plus solver settings). Both bands keep a constant height so the switch beneath never moves.

### Technique Switch (segmented buttons)
- **Shape:** Mono buttons in a Hairline-backed strip with 1px gaps, clipped to 4px.
- **Default:** Node Body with Ink Quiet text.
- **Hover:** Ground fill with ink text (150ms ease).
- **Pressed:** Ink fill with ground text (`aria-pressed`).
- **Press:** Scales to 0.97 (160ms ease-out).

### Parameter Pane
A Node Body pane with a hairline border and 0.875rem padding. It holds the mono node name, the grotesk tagline, stack tokens and a 600-weight "Open case study" link with a Wire Grey underline. When content swaps, the pane fades in from 0.35 opacity and 2px blur over 180ms ease-out (skipped under reduced motion).

### Chips (stack tokens)
- **Style:** Mono 0.6875rem in Ink Quiet on Node Body, with a hairline border, 4px radius and tight padding, wrapping with 0.375rem gaps.
- **State:** Static, with no selected or interactive variants.

### Navigation
- **Header:** The NaN mark left, then text links at 0.875rem and a mono EN/ES segmented control. The current language is ink-filled, and other options take a Netbox Grey fill on hover.
- **Links:** Their underline stays transparent at rest (1px, offset 0.35em) and fades to currentColor on hover (150ms ease). The current page keeps a 2px ink underline.
- **Path bar:** A lowercase mono breadcrumb with Wire Grey slashes.
- **Case rail:** A sticky list of h2 sections on a 1px Wire Grey spine. Each section has a square marker, and the current one fills chartreuse with an ink stroke and ink text.

### Figures
A mono figure bar printing `FIG major.minor` from CSS counters, plus a printed state ("Media pending") when there is no asset. Below it sits a dark 4px box holding video or image at cover fit. Without an asset, the box becomes the hatched pending body with its description centred in a Node Body plate. Looping videos play only while on screen and never autoplay under reduced motion.

### Code
Inline code is a Node Body chip with a hairline border and 3px radius at 0.84em. Code blocks are dark viewer-ground panels at 0.8125rem / 1.65 that span both body tracks.

### Motion
- **Easing:** ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for entrances and presses. ease-in-out `cubic-bezier(0.77, 0, 0.175, 1)` for drawing wires. Colour, border and underline transitions deliberately use plain `ease` at 150ms.
- **Evaluation order (first visit only):** An inline script sets `data-cook` before first paint on a home page, once per session, and never under `prefers-reduced-motion`. Nodes resolve over 460ms ease-out (from 0.4 opacity, 6px down, 2px blur), staggered 70ms by network index, with the output node at 820ms. Wires draw over 480ms ease-in-out from 360ms. The attribute is then removed.
- **Active wire flow:** After the entrance, the active wire's dashes flow continuously (700ms linear loop). This only runs when motion is allowed.
- **Figure reveal:** Behind `@supports (animation-timeline: view())`, figure boxes unclip from a 10% top inset and 0.4 opacity across the first 55% of their view entry.
- **Navigation:** The node name morphs into the case study's "Node" parameter via a shared view-transition name. The header does not animate.
- Content is always visible without motion. Every animation here is additive.

## Do's and Don'ts

### Do:
- **Do** reserve Chartreuse Signal for the active or current item, and keep it off body text and large fills.
- **Do** put rendered or computed content (canvas, video, code) in a dark viewer-ground frame with a 4px radius.
- **Do** print states as mono text inside the node or figure bar ("in viewer", "Media pending", "0 nodes").
- **Do** use Martian Mono only for identifiers, parameters, readouts, figure labels and code. Use wide, heavy Martian Grotesk for names and titles.
- **Do** separate surfaces with 1px Hairline rules and tonal steps (ground → netbox → node body).
- **Do** gate hover styles behind `(hover: hover) and (pointer: fine)`, and gate all keyframe motion behind `prefers-reduced-motion: no-preference`.
- **Do** mark missing media with the hatched pending body and its description, never with a stand-in image.

### Don't:
- **Don't** add box-shadows or elevation on hover. Hover changes stroke or fill colour.
- **Don't** introduce a second accent colour or a dark-mode theme.
- **Don't** use any radius other than 4px (3px for inline code, 1px insets for flush children).
- **Don't** draw SVG wires into the output node where it doesn't sit below the graph (below 1180px).
- **Don't** fall back to a hero-over-card-grid layout or a near-black neon dev-portfolio look.
- **Don't** badge states with pills or coloured tags.
