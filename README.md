# Sampler

**sampler.page**: turn any picture into a cross-stitch pattern you can actually stitch, with a chart, a list of DMC threads, and a preview of the finished piece. Everything runs in the browser; pictures never leave the visitor's computer.

## Files
- `public/index.html`: the site (pattern engine, rendering, chart, PDF export)
- `public/kit.css`: styles and design tokens
- `public/stitch.js`: shared drawing: fabrics, the thread stitch, Aida, textures, hand-drawn icons, optical centering
- `public/dmc.js`: DMC floss colors, from the [dmc](https://github.com/sharlagelfand/dmc) package by Sharla Gelfand (MIT)
- `public/fonts/`: Literata and Hanken Grotesk (SIL OFL), embedded in saved PDFs
- `public/og.png`: link preview, rendered from `index.html?og#s=0` at 1200×630

Sample photos load live from Wikimedia Commons and are credited on screen.

## Run locally
`python3 -m http.server 8095 -d public`

Design labs (style sheet, samples gallery, type and pill labs) live in `labs/`, local only and not in the repo. To see them, serve the whole folder: `python3 -m http.server 8095` and open `/labs/styles.html`.

## Deploy
Cloudflare Worker with static assets (`wrangler.jsonc`); Workers Builds deploys on push to `main`.
