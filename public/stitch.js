// Shared drawing for the kit and its style sheet: the stitch, the fabric looks, and fabric textures.
(() => {
'use strict';
const TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const hexRgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const rgbHex = c => '#' + c.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('');
const mixHex = (a, b, t) => { const A = hexRgb(a), B = hexRgb(b); return rgbHex(A.map((v, i) => v + (B[i] - v) * t)); };
const luma = h => { const c = hexRgb(h); return (.2126 * c[0] + .7152 * c[1] + .0722 * c[2]) / 255; };
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

// ---------- fabrics: the colour of the cloth, and the ink that reads on it ----------
const FABRICS = [
  { id: 'ivory', label: 'Ivory', hex: '#f6f1e4', page: '#f6f1e4', on: '#2b2620', muted: '#847a6c', title: '#2b2620', dot: 'rgba(43,38,32,.16)', big: 'rgba(164,70,46,.4)', mark: 'rgba(122,102,80,.07)' },
  { id: 'linen', label: 'Linen', hex: '#e9e0cf', page: '#ebe3d2', on: '#2b2620', muted: '#7d7263', title: '#2b2620', dot: 'rgba(43,38,32,.17)', big: 'rgba(164,70,46,.42)', mark: 'rgba(122,102,80,.08)' },
  { id: 'flax', label: 'Flax', hex: '#d8caa8', page: '#dccfae', on: '#2d2619', muted: '#76694e', title: '#2d2619', dot: 'rgba(45,38,25,.2)', big: 'rgba(126,52,32,.45)', mark: 'rgba(255,250,235,.32)' },
  { id: 'sage', label: 'Sage', hex: '#c3c6ad', page: '#c8cbb3', on: '#262b1f', muted: '#5f6553', title: '#262b1f', dot: 'rgba(38,43,31,.2)', big: 'rgba(126,52,32,.42)', mark: 'rgba(255,255,245,.3)' },
  { id: 'slate', label: 'Slate', hex: '#5d605c', page: '#5f625e', on: '#f1ece2', muted: '#c4bfb4', title: '#f1ece2', dot: 'rgba(255,255,255,.17)', big: 'rgba(232,170,140,.5)', mark: 'rgba(255,255,255,.07)' },
  { id: 'black', label: 'Black', hex: '#24221f', page: '#24221f', on: '#f1ece2', muted: '#a49d92', title: '#f1ece2', dot: 'rgba(255,255,255,.15)', big: 'rgba(217,138,107,.5)', mark: 'rgba(255,255,255,.06)' },
];

// ---------- the stitch: real floss ----------
// full width along its length, pinching where it dives into a hole; lit along its length, with fibres
function legReal(g, [x0, y0, x1, y1], c, hex, top, r) {
  const len = Math.hypot(x1 - x0, y1 - y0), a = Math.atan2(y1 - y0, x1 - x0), w = c * .44, h = w / 2, e = len * .1;
  g.save(); g.translate(x0, y0); g.rotate(a);
  const body = new Path2D();
  body.moveTo(0, -h * .45); body.quadraticCurveTo(e * .3, -h, e, -h); body.lineTo(len - e, -h); body.quadraticCurveTo(len - e * .3, -h, len, -h * .45);
  body.quadraticCurveTo(len + h * .25, 0, len, h * .45); body.quadraticCurveTo(len - e * .3, h, len - e, h); body.lineTo(e, h);
  body.quadraticCurveTo(e * .3, h, 0, h * .45); body.quadraticCurveTo(-h * .25, 0, 0, -h * .45); body.closePath();
  g.save(); g.translate(c * .012, c * .025); g.fillStyle = top ? 'rgba(20,12,6,.14)' : 'rgba(20,12,6,.08)'; g.fill(body); g.restore();
  const gr = g.createLinearGradient(0, -h, 0, h);
  gr.addColorStop(0, mixHex(hex, '#000000', .14)); gr.addColorStop(.3, mixHex(hex, '#ffffff', .07)); gr.addColorStop(.55, hex); gr.addColorStop(1, mixHex(hex, '#000000', .2));   // matte cotton: colour does the work
  g.fillStyle = gr; g.fill(body);
  const ends = g.createLinearGradient(0, 0, len, 0);
  ends.addColorStop(0, 'rgba(0,0,0,.16)'); ends.addColorStop(.12, 'rgba(0,0,0,0)'); ends.addColorStop(.88, 'rgba(0,0,0,0)'); ends.addColorStop(1, 'rgba(0,0,0,.16)');
  g.fillStyle = ends; g.fill(body);
  if (c >= 9) {   // fibres running along the leg, with the twist
    g.save(); g.clip(body); g.lineWidth = Math.max(.4, c * .012); g.globalAlpha = .16;
    for (let k = 0, n = Math.max(2, Math.round(c * .22)); k < n; k++) {
      const y = (r() - .5) * w * .9; g.strokeStyle = r() < .5 ? mixHex(hex, '#ffffff', .3) : mixHex(hex, '#000000', .3);
      g.beginPath(); g.moveTo(-2, y - w * .2); g.lineTo(len + 2, y + w * .2); g.stroke();
    }
    g.restore();
  }
  g.restore();
}
// the two legs of a stitch in cell (x, y): bottom (/) then top (\), wobbling slightly by position
const INSET = .03;   // legs reach right into the holes, so neighbouring stitches meet
function legs(x, y, c, jx = 0, jy = 0) {
  const m = INSET;
  return [[x + c * m + jx, y + c * (1 - m) + jy, x + c * (1 - m) - jy, y + c * m + jx],
          [x + c * m - jy, y + c * m + jx, x + c * (1 - m) + jx, y + c * (1 - m) - jy]];
}

// ---------- textures: the weave or grain of the cloth, as a repeating tile ----------
const TEXTURES = [{ id: 'weave', label: 'Weave' }];
const tiles = new Map();
function textureTile(id, fabricId) {
  const key = id + '/' + fabricId;
  if (tiles.has(key)) return tiles.get(key);
  if (id === 'plain') { tiles.set(key, null); return null; }
  const S = 240, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), r = mulberry32(id.length * 97 + 3), dark = luma(FABRICS.find(f => f.id === fabricId).hex) < .4;
  const light = a => `rgba(255,252,240,${a})`, shade = a => `rgba(30,22,12,${a})`;
  if (id === 'weave') {
    // the faintest crosswise weave: single threads a shade lighter or darker, nothing that competes with the dots
    for (const vertical of [0, 1]) for (let p = 0; p < S; p += 2) {
      const a = .006 + r() * .016, up = r() < .5;
      g.fillStyle = up ? light(dark ? a * .7 : a * 1.4) : shade(dark ? a * 1.5 : a);
      vertical ? g.fillRect(p, 0, 1, S) : g.fillRect(0, p, S, 1);
    }
  } else if (id === 'grain') {
    const im = g.createImageData(S, S);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = r(), up = v > .5;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = up ? 255 : 20;
      im.data[i + 3] = Math.abs(v - .5) * (dark ? 34 : 42);
    }
    g.putImageData(im, 0, 0);
  }
  tiles.set(key, c);
  return c;
}
// fill (w × h) with the texture, at css scale u (device pixels per css pixel)
function drawTexture(ctx, id, fabricId, w, h, u = 1) {
  const t = textureTile(id, fabricId); if (!t) return;
  const p = ctx.createPattern(t, 'repeat');
  p.setTransform(new DOMMatrix().scale(u));
  ctx.fillStyle = p; ctx.fillRect(0, 0, w, h);
}

// ---------- icons: redraw each inline SVG icon by hand, with Rough.js ----------
// Strokes become wobbly pen lines; filled shapes become a pen outline with a solid fill. Same seed every time.
// amount: 0 = the original clean icon, 1 = a light hand, 2+ = scribbly. Re-runnable: keeps each icon's original shapes.
let roughAmount = 1;
function roughen(root = document, amount = roughAmount) {
  if (!window.rough) return;
  roughAmount = amount;
  root.querySelectorAll('svg[data-rough]').forEach((svg, n) => {
    const amt = svg.dataset.rough ? parseFloat(svg.dataset.rough) : amount;   // each icon can carry its own roughness
    if (!svg.dataset.orig) svg.dataset.orig = svg.innerHTML + '|' + (svg.getAttribute('fill') || '');
    const [inner, fill0] = svg.dataset.orig.split('|');
    svg.innerHTML = inner; svg.setAttribute('fill', fill0 || 'none');
    if (amt <= 0) return;
    const rc = rough.svg(svg), filled = fill0 === 'currentColor';
    const sw = parseFloat(svg.getAttribute('stroke-width')) || 2;
    for (const el of [...svg.querySelectorAll('path, rect, circle, ellipse')]) {
      const o = { seed: 7 + n, stroke: 'currentColor', disableMultiStroke: true, disableMultiStrokeFill: true, preserveVertices: true,
                  roughness: amt * (filled ? .45 : 1), bowing: amt * (filled ? .6 : 1.2), strokeWidth: filled ? .9 : sw * .8,
                  fill: filled ? 'currentColor' : undefined, fillStyle: 'solid' };
      let node;
      if (el.tagName === 'path') node = rc.path(el.getAttribute('d'), o);
      else if (el.tagName === 'rect') node = rc.path(roundRectPath(+el.getAttribute('x'), +el.getAttribute('y'), +el.getAttribute('width'), +el.getAttribute('height'), +(el.getAttribute('rx') || 0)), o);
      else if (el.tagName === 'circle') node = rc.circle(+el.getAttribute('cx'), +el.getAttribute('cy'), +el.getAttribute('r') * 2, o);
      else node = rc.ellipse(+el.getAttribute('cx'), +el.getAttribute('cy'), +el.getAttribute('rx') * 2, +el.getAttribute('ry') * 2, o);
      node.querySelectorAll('path').forEach(p => { p.setAttribute('stroke-linecap', 'round'); p.setAttribute('stroke-linejoin', 'round'); });
      el.replaceWith(node);
    }
    svg.setAttribute('fill', 'none');
  });
}
const roundRectPath = (x, y, w, h, r) => r ? `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${x + w} ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${y + r}Q${x} ${y} ${x + r} ${y}Z` : `M${x} ${y}H${x + w}V${y + h}H${x}Z`;

// ---------- Aida: woven blocks with a hole at every corner, lined up with a stitch grid at (ox, oy) ----------
function drawAida(ctx, fab, cell, ox, oy, x0, y0, x1, y1) {
  const dark = luma(fab.hex) < .4, i0 = Math.floor((x0 - ox) / cell) - 1, j0 = Math.floor((y0 - oy) / cell) - 1;
  const i1 = Math.ceil((x1 - ox) / cell) + 1, j1 = Math.ceil((y1 - oy) / cell) + 1;
  ctx.fillStyle = mixHex(fab.page, dark ? '#000000' : '#ffffff', dark ? .05 : .28); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (cell < 4) return;
  const blk = new Path2D(), m = cell * .13, rr = cell * .16;
  for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) blk.roundRect(ox + i * cell + m, oy + j * cell + m, cell - 2 * m, cell - 2 * m, rr);
  ctx.fillStyle = mixHex(fab.page, '#ffffff', dark ? .035 : .5); ctx.fill(blk);
  // the threads of each block: a faint line across the middle both ways
  if (cell >= 9) {
    const th = new Path2D();
    for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) { const x = ox + i * cell, y = oy + j * cell; th.moveTo(x + m, y + cell / 2); th.lineTo(x + cell - m, y + cell / 2); th.moveTo(x + cell / 2, y + m); th.lineTo(x + cell / 2, y + cell - m); }
    ctx.strokeStyle = dark ? 'rgba(0,0,0,.08)' : 'rgba(120,100,70,.12)'; ctx.lineWidth = Math.max(.5, cell * .04); ctx.stroke(th);
  }
  const holes = new Path2D(), hr = Math.max(.6, cell * .085);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const x = ox + i * cell, y = oy + j * cell; holes.moveTo(x + hr, y); holes.arc(x, y, hr, 0, TAU); }
  ctx.fillStyle = mixHex(fab.page, '#000000', dark ? .28 : .32); ctx.fill(holes);
}

// ---------- optical centring: put a word's capitals (not its line box) in the middle of its container ----------
// Fonts carry different ascent/descent metrics, so plain flex centring leaves each one sitting at a different height.
// Measure the real cap height and font metrics, and nudge the text so the space between baseline and cap top is centred.
function opticalCenter(el) {
  const cs = getComputedStyle(el), g = document.createElement('canvas').getContext('2d');
  g.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontStretch} ${cs.fontSize} ${cs.fontFamily}`;
  const m = g.measureText('H'), size = parseFloat(cs.fontSize);
  const lh = cs.lineHeight === 'normal' ? m.fontBoundingBoxAscent + m.fontBoundingBoxDescent : parseFloat(cs.lineHeight);
  const A = m.fontBoundingBoxAscent, D = m.fontBoundingBoxDescent, cap = m.actualBoundingBoxAscent;
  const baseline = (lh - (A + D)) / 2 + A;           // baseline, from the top of the line box
  const shift = lh / 2 - (baseline - cap / 2);        // move the middle of the capitals to the middle of the box
  el.style.transform = `translateY(${shift.toFixed(2)}px)`;
  el.style.display = 'inline-block';
  return shift;
}

window.Stitch = { TAU, clamp, hexRgb, rgbHex, mixHex, luma, mulberry32, FABRICS, legReal, legs, TEXTURES, textureTile, drawTexture, roughen, drawAida, opticalCenter };
})();
