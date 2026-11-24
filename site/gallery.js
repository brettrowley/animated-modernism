// The gallery: the paintings hang along one wall, which scrolls sideways. Any
// scroll, a mouse wheel's included, moves along the wall, and it always comes
// to rest with a painting in the middle (or at the introduction).
//
// The paintings are spaced so that only one is ever in view: its neighbours
// show as a sliver at each edge. Clicking a neighbour brings it to the middle;
// clicking the painting in the middle brings it close (site/focus.js).
//
// Each painting starts as an empty canvas and draws itself the first time it
// comes fully into view, so nothing ever has to disappear before it plays.
// After that, its replay button plays it again.

import { render } from '../engine/render.js';
import { createAnimation, twinIds, clipIds } from '../engine/motion.js';
import { grain, random } from '../engine/grain.js';
import * as focus from './focus.js';
import { DETAILS } from './paintings.js';
import './rulebook.js';

// The paintings on the wall, left to right. Each one's focused view is at
// `#<name>`, so the back button closes it.
const PAINTINGS = ['a-ii', 'nagy2', 'nagy3', 'nagy4', 'malevich', 'bayer', 'albers', 'kandinsky1'];
const href = scene => `#${scene}`;

// Seeds the wall labels' ruled lines: one that gives the wall a good mix of
// two, three and four lines.
const PLACARD_SALT = 25;

// Paintings that come into view together start this many seconds apart.
const STAGGER = 0.45;

// How long scrolling must pause before the wall settles on a painting.
const SETTLE_MS = 140;

// Moving from one painting to the next takes this long, in seconds; further
// moves take a little longer, up to MOVE_MAX.
const MOVE = 1.1;
const MOVE_MAX = 2.2;

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

const gallery = document.querySelector('.gallery');
const track = document.querySelector('.track');
const intro = document.querySelector('.intro');
const restart = document.querySelector('.restart');

const REPLAY_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
  <path d="M13.5 8a5.5 5.5 0 1 1-1.8-4.07"/><path d="M12.2 1.6v2.8H9.4"/></svg>`;
const INSPECT_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round"><circle cx="6.8" cy="6.8" r="4.6"/><path d="m10.3 10.3 4 4"/></svg>`;

const scenes = await Promise.all(PAINTINGS.map(name => import(`../scenes/${name}.js`).then(m => m.default)));

const pieces = scenes.map((scene, i) => hang(PAINTINGS[i], scene));

const floor = document.createElement('div');
floor.className = 'floor';
floor.setAttribute('aria-hidden', 'true');
track.prepend(floor);

// ---------------------------------------------------------------------------
// Hanging the paintings

// A wall label's "text": two to four ruled lines of uneven length, the first
// darker, like a title. Seeded by the painting's name, so each label is its
// own but never changes between visits (PLACARD_SALT, above).
function placardLines(name) {
  const rand = random([...(name + PLACARD_SALT)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619), 2166136261));
  const count = 2 + Math.floor(rand() * 3);
  return Array.from({ length: count }, (_, i) => {
    const width = i === 0 ? 62 + rand() * 30 : 34 + rand() * 50;
    return `<i style="width: ${width.toFixed(0)}%"></i>`;
  }).join('');
}

function hang(name, scene) {
  const { width, height } = scene.viewBox;

  const bay = document.createElement('figure');
  bay.className = 'bay';
  bay.style.setProperty('--ar', `${width} / ${height}`);
  bay.innerHTML = `
    <div class="hang">
      <div class="lamp" aria-hidden="true"><span class="cone"></span><span class="cone-grain"></span></div>
      <a class="frame" href="${href(name)}"><span class="placard" aria-hidden="true">${placardLines(name)}</span></a>
    </div>
    <div class="actions">
      <button type="button" class="replay">${REPLAY_ICON}<span>Replay</span></button>
      <button type="button" class="inspect">${INSPECT_ICON}<span>Inspect</span></button>
    </div>`;

  const frame = bay.querySelector('.frame');
  // What a screen reader calls the painting: its real title where known.
  const details = DETAILS[name];
  const named = details?.title ? `${details.title} by ${details.artist}` : scene.title;
  frame.setAttribute('aria-label', `Open ${named}`);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', details?.title ? `Reconstruction of ${named}` : scene.label);
  frame.prepend(svg);
  track.append(bay);

  const { shapes } = render(svg, scene, {
    twins: twinIds(scene),
    clips: clipIds(scene),
    prefix: `${name}-`,
  });
  const animation = createAnimation(scene, shapes);
  animation.seek(0); // an empty canvas until it plays

  const replay = bay.querySelector('.replay');
  replay.setAttribute('aria-label', `Replay ${named}`);

  const piece = { name, scene, bay, frame, svg, shapes, animation, played: false, timer: null };
  replay.addEventListener('click', () => play(piece));

  // Inspect brings the painting close, first bringing it to the middle if
  // it's off to the side.
  const inspect = bay.querySelector('.inspect');
  inspect.setAttribute('aria-label', `Inspect ${named}`);
  inspect.addEventListener('click', () => {
    const index = pieces.indexOf(piece) + 1;
    if (Math.abs(gallery.scrollLeft - stops()[index]) > 2) {
      openOnArrival = piece;
      goTo(index);
    } else bringClose(piece);
  });

  // A painting off to the side comes to the middle; only the one in the
  // middle comes close.
  frame.addEventListener('click', event => {
    event.preventDefault();
    const index = pieces.indexOf(piece) + 1;
    if (Math.abs(gallery.scrollLeft - stops()[index]) > 2) goTo(index);
    else bringClose(piece);
  });
  return piece;
}

function play(piece, delay = 0) {
  clearTimeout(piece.timer);
  piece.played = true;
  piece.timer = setTimeout(() => piece.animation.play({ from: 0 }), delay * 1000);
}

// Plays, left to right, every painting fully in view that hasn't played yet.
function playArrivals() {
  const view = gallery.getBoundingClientRect();
  let delay = 0;
  for (const piece of pieces) {
    if (piece.played) continue;
    const art = piece.bay.querySelector('.frame').getBoundingClientRect();
    if (art.left >= view.left - 1 && art.right <= view.right + 1) {
      play(piece, delay);
      delay += STAGGER;
    }
  }
}

// ---------------------------------------------------------------------------
// Scrolling along the wall

// Spaces the paintings so that, with any one in the middle, its neighbours
// show only a sliver at each edge, however wide the screen. Paintings differ
// in width, so a gap can't give the same sliver on both sides of a pair:
// each gap is the larger painting's, so the sliver is never less than `peek`,
// and a narrow painting beside a wide one shows a little more.
function space() {
  const view = gallery.clientWidth;
  const peek = Math.min(Math.max(view * 0.025, 24), 56);
  const items = [intro, ...pieces.map(({ bay }) => bay)];
  const widths = items.map(item => item.offsetWidth);
  for (let i = 1; i < items.length; i++) {
    let gap = view / 2 - Math.max(widths[i - 1], widths[i]) / 2 - peek;
    if (i === 1) {
      // The introduction is wider than any painting, so hiding it behind the
      // first painting would push that painting out of sight: the first
      // painting peeks from the introduction, which fades once it's away.
      // A phone has no room for a faded sliver of text, so there it's hidden.
      gap = view < 720 ? view / 2 - widths[1] / 2 : view - peek - (intro.offsetLeft + widths[0]);
    }
    items[i].style.marginLeft = `${Math.max(gap, 24)}px`;
  }
  track.style.paddingRight = `${Math.max((view - widths.at(-1)) / 2, 0)}px`;
}

// Where the wall can come to rest: the introduction, then each painting,
// centred.
function stops() {
  const max = gallery.scrollWidth - gallery.clientWidth;
  const clamp = x => Math.min(Math.max(x, 0), max);
  return [intro, ...pieces.map(({ bay }) => bay)]
    .map(item => clamp(item.offsetLeft + item.offsetWidth / 2 - gallery.clientWidth / 2));
}

// Marks the painting in the middle, so only it lifts under the pointer.
function markCentred() {
  const at = stops();
  intro.classList.toggle('is-centred', Math.abs(gallery.scrollLeft - at[0]) <= 2);
  pieces.forEach((piece, i) => piece.frame.classList.toggle('is-centred', Math.abs(gallery.scrollLeft - at[i + 1]) <= 2));
}

function nearestStop(x = gallery.scrollLeft) {
  const all = stops();
  return all.reduce((best, s, i) => (Math.abs(s - x) < Math.abs(all[best] - x) ? i : best), 0);
}

// Where the wall is heading, while it moves, so repeated steps add up.
let heading = null;

// Moves the wall to a stop at an unhurried pace, easing out of rest and
// braking into it (rules 3.28 and 3.11), rather than the browser's quick
// smooth scroll. Snapping is off while it moves.
let moving = null;
function goTo(index) {
  const all = stops();
  index = Math.min(Math.max(index, 0), all.length - 1);
  heading = index;
  cancelAnimationFrame(moving);
  const from = gallery.scrollLeft;
  const to = all[index];
  const steps = Math.abs(to - from) / Math.max(gallery.clientWidth * 0.6, 1);
  const duration = reducedMotion.matches ? 0 : Math.min(MOVE * (1 + 0.35 * Math.max(steps - 1, 0)), MOVE_MAX) * 1000;
  gallery.style.scrollSnapType = 'none';
  const start = performance.now();
  const tick = now => {
    const t = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    gallery.scrollLeft = from + (to - from) * eased;
    if (t < 1) {
      moving = requestAnimationFrame(tick);
    } else {
      moving = null;
      gallery.style.scrollSnapType = '';
      settled();
    }
  };
  moving = requestAnimationFrame(tick);
}

// Wheels and trackpads: whichever way the gesture goes, it moves along the
// wall. Snapping is turned off while it does, so the wall follows the gesture
// freely, then settles on the nearest painting once the gesture pauses.
let settleTimer = null;
gallery.addEventListener('wheel', event => {
  if (event.ctrlKey || focus.isOpen()) return; // pinch to zoom, or looking closely
  event.preventDefault();
  const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? gallery.clientWidth : 1;
  const delta = (Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY) * unit;
  cancelAnimationFrame(moving);
  moving = null;
  gallery.style.scrollSnapType = 'none';
  gallery.scrollLeft += delta;
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => goTo(nearestStop()), SETTLE_MS);
}, { passive: false });

// Touch and other native scrolling snap by themselves; play what arrives.
let nativeTimer = null;
gallery.addEventListener('scroll', () => {
  clearTimeout(nativeTimer);
  nativeTimer = setTimeout(() => {
    if (!moving && gallery.style.scrollSnapType !== 'none') settled();
  }, 160);
}, { passive: true });

// Keys step one painting at a time.
document.addEventListener('keydown', event => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (document.body.classList.contains('is-reading')) return; // the Rulebook is open
  if (focus.isOpen()) {
    if (event.key === 'Escape') stepBack();
    return;
  }
  if (event.target.closest?.('input, textarea, select')) return;
  const forward = ['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key) || (event.key === ' ' && !event.shiftKey);
  const back = ['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key) || (event.key === ' ' && event.shiftKey);
  if (event.key === ' ' && event.target.closest?.('button, a')) return;
  let index = null;
  const from = heading ?? nearestStop();
  if (forward) index = from + 1;
  else if (back) index = from - 1;
  else if (event.key === 'Home') index = 0;
  else if (event.key === 'End') index = Infinity;
  if (index === null) return;
  event.preventDefault();
  goTo(index);
});

document.querySelector('.next').addEventListener('click', () => goTo((heading ?? nearestStop()) + 1));

// A painting to bring close once the wall has brought it to the middle.
let openOnArrival = null;

function settled() {
  heading = null;
  markCentred();
  const arriving = openOnArrival;
  openOnArrival = null;
  if (arriving && arriving.frame.classList.contains('is-centred')) {
    bringClose(arriving);
    return;
  }
  playArrivals();
  // The way back to the start appears once you're past the first painting.
  const past = nearestStop() >= 2 && !focus.isOpen();
  restart.classList.toggle('is-shown', past);
  restart.inert = !past;
}

// ---------------------------------------------------------------------------
// Bringing a painting close

function bringClose(piece, options) {
  clearTimeout(piece.timer);
  piece.played = true;
  if (location.hash !== `#${piece.name}`) history.pushState({ focus: piece.name }, '', `#${piece.name}`);
  restart.classList.remove('is-shown');
  focus.open(piece, options);
}

// Back to the wall: through the browser's history when we came by it, so the
// back button and this one agree.
function stepBack() {
  if (history.state?.focus) history.back();
  else {
    history.replaceState(null, '', location.pathname + location.search);
    focus.close();
    settled();
  }
}
focus.onBack(stepBack);

addEventListener('popstate', () => {
  const name = location.hash.slice(1);
  const piece = pieces.find(p => p.name === name);
  if (piece && !focus.isOpen()) {
    gallery.scrollLeft = stops()[pieces.indexOf(piece) + 1];
    settled();
    bringClose(piece);
  } else if (!piece && focus.isOpen()) {
    focus.close();
    settled();
  }
});

// Restart: back to the introduction, every painting an empty canvas again.
restart.addEventListener('click', () => {
  for (const piece of pieces) {
    clearTimeout(piece.timer);
    piece.played = false;
    piece.animation.seek(0);
  }
  restart.classList.remove('is-shown');
  goTo(0);
  intro.querySelector('.next').focus({ preventScroll: true });
});

// ---------------------------------------------------------------------------
// The floor

// Grain only, no boards: the woodcut's fibres running along the wall, finer
// and closer together into the distance. The floor is cut into many thin
// bands, each with its own grain at its own scale, growing steadily towards
// the viewer, so the change in scale is gradual and no band shows.
const FLOOR = {
  bands: 14,
  growth: 1.12,  // each band this much deeper than the one behind it
  seed: 1930,
  fibre: '#4A4242',
};

function lay() {
  const width = track.scrollWidth;
  const height = floor.clientHeight;
  if (!width || !height) return;
  const svgNS = 'http://www.w3.org/2000/svg';
  const el = (name, attrs) => {
    const node = document.createElementNS(svgNS, name);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    return node;
  };

  const svg = el('svg', { width, height, viewBox: `0 0 ${width} ${height}` });
  const total = Array.from({ length: FLOOR.bands }, (_, i) => FLOOR.growth ** i).reduce((a, b) => a + b);
  const unit = height / total;
  let y = 0;
  for (let b = 0; b < FLOOR.bands; b++) {
    const depth = unit * FLOOR.growth ** b;
    // The grain's scale: how near this band is. Distant fibres still need to
    // be a pixel or so apart, or they'd merge into a flat tone.
    const s = Math.max((y + depth / 2) / height, 0.12) * height / 60;
    const clip = el('clipPath', { id: `floor-band-${b}` });
    clip.append(el('rect', { y: y.toFixed(2), width, height: (depth + 0.5).toFixed(2) }));
    svg.append(clip);
    const band = el('g', { 'clip-path': `url(#floor-band-${b})`, fill: 'none', stroke: FLOOR.fibre, 'stroke-linecap': 'round' });
    const inner = el('g', { transform: `translate(0 ${(y - 6).toFixed(2)})` });
    for (const { d, width: w, opacity } of grain({ width, height: depth + 12 }, {
      seed: FLOOR.seed + b,
      pitch: [2.4 * s, 0.8 * s],
      tilt: 0,
      wave: [[1.6 * s, 900 * s, 260 * s], [0.7 * s, 260 * s, 700 * s]],
      dash: [30 * s, 1.0],
      gap: [12 * s, 1.0],
      density: [[1, 1], [1, 1]],
      tiers: [[0.35 * s, 0.14], [0.6 * s, 0.22], [0.95 * s, 0.32]],
    })) {
      inner.append(el('path', { d, 'stroke-width': w.toFixed(2), 'stroke-opacity': opacity }));
    }
    band.append(inner);
    svg.append(band);
    y += depth;
  }
  floor.replaceChildren(svg);
}

// ---------------------------------------------------------------------------
// Layout

function layout() {
  const centred = nearestStop();
  space();
  lay();
  gallery.scrollLeft = stops()[centred];
  settled();
}

// A new window size respaces the paintings, keeping the same one in the middle.
let resizeTimer = null;
let lastWidth = innerWidth;
let lastHeight = innerHeight;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (innerWidth === lastWidth && innerHeight === lastHeight) return;
    [lastWidth, lastHeight] = [innerWidth, innerHeight];
    layout();
  }, 200);
});

// Once the fonts are in, the layout is final.
await document.fonts.ready;
space();
lay();
settled();

// Respace if any painting changes size for a reason other than the window,
// so the spacing never goes stale.
const sizes = new ResizeObserver(() => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(layout, 200);
});
for (const { frame } of pieces) sizes.observe(frame);

// Arriving at `#<name>` opens that painting, already in place.
{
  const piece = pieces.find(p => p.name === location.hash.slice(1));
  if (piece) {
    gallery.scrollLeft = stops()[pieces.indexOf(piece) + 1];
    piece.played = true;
    piece.animation.seek(piece.animation.duration);
    settled();
    history.replaceState(null, '', location.pathname + location.search);
    history.pushState({ focus: piece.name }, '', `#${piece.name}`);
    bringClose(piece, { instant: true });
  }
}
