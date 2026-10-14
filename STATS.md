# Sampler: project stats

Snapshot, 2026-10-13, the day it went live at **sampler.page**.

## Time
- Elapsed: ~22 hours 24 minutes (2026-10-13 00:31 → 22:55, US Central), across three sittings
  - a late-night first build (~25 min), then sleep (9h 35m)
  - a morning-to-afternoon run, a 41-minute break, then an 8-hour pause
  - an evening run through to launch
- Active work: ~5 hours 11 minutes (gaps over 20 minutes not counted)
- Prelude: ~20 minutes earlier the same night on Phase / Moiré Sampler, which proposed the "pattern book"
  direction that became this, before Phase was shelved

## Conversation and compute
- Messages from Jake: ~41, with 8 reference images
- Model calls: 317, all Claude Opus 5.5
- Tool uses: 296 (187 shell commands, 99 file/screenshot reads, 8 file writes, 2 web searches)
- Tokens (≈ ¾ of a word each):
  - Output written: ~379,000
  - Cache reads: ~193 million
  - Cache writes: ~2.6 million
- One session (the same one as bubbles, crystals and raindrops), no context compactions

## Code
- 1 commit on GitHub (jrochfo/sampler, public)
- The site, about 1 MB in all: `index.html` 1,015 lines, `kit.css` 146, `stitch.js` 162, `dmc.js` (454 DMC
  colors), 4 embedded font files for PDFs, `og.png`
- Design labs kept local only: a style sheet, samples gallery, type lab and pill lab (518 lines)
- No build step. Runtime dependencies: jsPDF and Rough.js from CDNs, Google Fonts, the Wikimedia Commons API

## How it works
- Background: an edge-aware flood from the border at 3–5 points per stitch, which stops at real edges, so a
  green bird on a green blur survives. Tolerance comes only from border pixels that look like background.
- Color: k-means in CIELAB, each cluster matched to the nearest real DMC floss, then a tidy pass for lone
  stitches
- Rendering: matte, flat floss stitches on Aida inside the piece's shape, laid on dot paper whose dots fall on
  the stitch corners
- Chart view with zoom and pan, a thread key with skein estimates, and a PDF of any size (a cover page plus
  the whole chart on one page)

## Design, in turns
1. A '70s needlework-kit look (Fraunces, faded inks). Jake: a red herring
2. White, greens and reds, Animal Crossing–bubbly, dot paper
3. The page becomes the fabric: no boxes, corners, an Edit panel, a Stitched/Chart toggle
4. Mature neutrals: linen and flax, madder rust, a serif. Instrument Serif banned for good
5. Display serif: Needle (condensed Noto Serif Display) → too tall in the pill → **Literata**, after a pill
   lab and a live A/B/C on the site
6. Thread: seven stitch renderers compared → real floss → flatter and matte after a photo of a real hoop
7. Samples: drawn fruit → a loon → Commons botanical plates → photos with one clear subject on a plain
   ground, framed automatically and nudged by eye (the wood duck leads)
8. Name: Cross-Stitch Kit → Sampler; sampler.studio was taken, so **sampler.page**

## Bugs worth remembering
- White halos around subjects: anti-aliased edges matched to near-white threads. Fixed by finding the
  background before choosing threads.
- Subjects erased when zoomed in, twice: the background tolerance was learned from a crop edge made of
  subject
- Grey wings full of holes: an "old paper" rule that treated any mid-grey as paper
- ⌘C flipped the view to Chart: single-key shortcuts didn't ignore modifier keys
- The tooltip wouldn't hide: its fade-in animation held its final frame over the hiding class
- Cached CSS made a correct page look broken, so asset links are now versioned

## How these were measured
- Session log: `~/.claude/projects/-Users-jrochford/4a320a4d-9252-4a2c-8930-774022843643.jsonl`, from Jake's
  "ok, cross-stitch generator" message to launch (timestamps, per-call token usage, tool calls, images)
- `wc -l`, `du -sh public`, `git log`
