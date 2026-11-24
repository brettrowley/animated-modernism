// The Rulebook, as a museum guide. Opening it is the visitor looking down:
// the floor rises to fill the view, carrying a printed sheet with the
// Rulebook on it. Closing it looks back up to wherever they were, the wall or
// a painting close up.
//
// The text is site/guide.md: a visitor's edition of RULEBOOK.md, with only
// its settled rules, in plain language. It's fetched and rendered when first
// opened. Each numbered rule is a fold-out entry; a reference to a rule
// elsewhere in the text opens that rule.

import { grain } from '../engine/grain.js';

const MARKED = 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const LOOK_MS = 900;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)';

// How much wall stays in view above the floor once the visitor looks down.
const HORIZON = 0.11;

const guide = document.querySelector('.guide');
const ground = guide.querySelector('.guide-floor');
const sheet = guide.querySelector('.sheet');
const nav = guide.querySelector('.sheet-nav');
const page = guide.querySelector('.sheet-page');
const closeButton = guide.querySelector('.sheet-close');

// What moves up out of view as the visitor looks down.
const scenery = () => [document.querySelector('.gallery'), document.querySelector('.focus')];

let sections = null; // [{ id, label, html }] once loaded
let isOpen = false;
let returnFocus = null;
let lift = 0;       // how far the view tilts down: from the floor's edge to the horizon
let tuck = 0;       // how much further the sheet starts below the floor's edge

// The sheet rides up with the floor, but starts (and ends) a little lower on
// it, so it's below the bottom of the screen until the floor is moving:
// nothing pops into view (rule 3.7).
function sheetTuck() {
  const sheetTop = floorTop() + sheet.offsetTop; // where it would start, riding the floor
  return Math.max(0, innerHeight - sheetTop + 24);
}

export const isReading = () => isOpen;

// ---------------------------------------------------------------------------
// Turning RULEBOOK.md into the guide

async function load() {
  if (sections) return;
  const [{ marked }, text] = await Promise.all([
    import(MARKED),
    fetch('site/guide.md').then(r => r.text()),
  ]);
  // Links in the Rulebook point at source files; in the guide they're just text.
  marked.use({ gfm: true, renderer: { link: (href, title, label) => label } });

  // The page title and its subtitle line are the guide's own heading.
  const body = text.replace(/^# .*\n+/, '').replace(/^\*Version[^\n]*\n+/, '');
  const parts = body.split(/^## /m);
  const about = parts.shift().replace(/^---\s*$/gm, '');
  sections = [
    { id: 'about', label: 'About', html: marked.parse(about) },
    ...parts.map(part => {
      const [heading, ...rest] = part.split('\n');
      const label = heading.replace(/^(\d+)\.\s*/, '$1 ').replace(/^Appendix ([A-C]): /, '$1 ');
      return { id: slug(heading), label, html: renderSection(rest.join('\n').replace(/^---\s*$/gm, ''), marked) };
    }),
  ];

  nav.innerHTML = sections.map(s => `
    <button type="button" data-section="${s.id}">${s.label}</button>`).join('');
  for (const button of nav.querySelectorAll('button')) {
    button.addEventListener('click', () => show(button.dataset.section));
  }
}

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// A section's numbered entries (1.1, 3.11, 6.2, A.1 …) become fold-outs;
// unnumbered headings stay as headings that group them.
function renderSection(markdown, marked) {
  const pieces = markdown.split(/^(#{3,4} .*)$/m);
  let html = marked.parse(pieces.shift());
  for (let i = 0; i < pieces.length; i += 2) {
    const heading = pieces[i].replace(/^#{3,4} /, '');
    const content = pieces[i + 1] ?? '';
    const numbered = heading.match(/^([0-9]+\.[0-9]+|[A-C]\.[0-9]+) (.*)$/);
    if (numbered) {
      const [, n, title] = numbered;
      html += `
        <details class="entry" id="rule-${n.replace('.', '-')}">
          <summary><span class="n">${n}</span><span class="t">${marked.parseInline(title)}</span></summary>
          <div class="entry-body">${marked.parse(content)}</div>
        </details>`;
    } else {
      html += `<h3>${marked.parseInline(heading)}</h3>${marked.parse(content)}`;
    }
  }
  return html;
}

// Shows a section, and links every mention of a rule in it to that rule.
function show(id, rule = null) {
  const section = sections.find(s => s.id === id) ?? sections[0];
  page.innerHTML = section.html;
  page.scrollTop = 0;
  for (const button of nav.querySelectorAll('button')) {
    button.setAttribute('aria-current', String(button.dataset.section === section.id));
  }
  linkRules();
  if (rule) openRule(rule);
}

const RULE_REF = /(^|[^\d.])([134]\.\d{1,2})(?![\d.]|s\b|[–-])/g;

function linkRules() {
  const known = new Set(sections.flatMap(s => [...s.html.matchAll(/id="rule-(\d+)-(\d+)"/g)].map(m => `${m[1]}.${m[2]}`)));
  const walker = document.createTreeWalker(page, NodeFilter.SHOW_TEXT, {
    acceptNode: node => (node.parentElement.closest('summary, code, a') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  const nodes = [];
  while (walker.nextNode()) if (RULE_REF.test(walker.currentNode.data)) nodes.push(walker.currentNode);
  for (const node of nodes) {
    const html = node.data.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]))
      .replace(RULE_REF, (all, before, n) => (known.has(n) ? `${before}<a href="#" class="ref" data-rule="${n}">${n}</a>` : all));
    const span = document.createElement('span');
    span.innerHTML = html;
    node.replaceWith(...span.childNodes);
  }
}

// Opens a rule wherever it is, in its own section.
function openRule(n) {
  const id = `rule-${n.replace('.', '-')}`;
  let entry = page.querySelector(`#${id}`);
  if (!entry) {
    const section = sections.find(s => s.html.includes(`id="${id}"`));
    if (!section) return;
    show(section.id);
    entry = page.querySelector(`#${id}`);
  }
  entry.open = true;
  // Scroll the page alone: scrollIntoView would also nudge the guide itself.
  page.scrollTo({ top: entry.offsetTop - 12, behavior: reducedMotion.matches ? 'auto' : 'smooth' });
  entry.querySelector('summary').focus({ preventScroll: true });
}

page.addEventListener('click', event => {
  const ref = event.target.closest('a.ref');
  if (!ref) return;
  event.preventDefault();
  openRule(ref.dataset.rule);
});

// ---------------------------------------------------------------------------
// The floor seen from above: grain only, all at one scale, since looking down
// takes the foreshortening out of it.

function layGround() {
  const width = Math.ceil(innerWidth);
  const height = Math.ceil(innerHeight * 1.2);
  if (ground.dataset.size === `${width}x${height}`) return;
  ground.dataset.size = `${width}x${height}`;
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('width', width);
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.classList.add('guide-grain');
  const s = 2.2;
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('fill', 'none');
  g.setAttribute('stroke', '#4A4242');
  g.setAttribute('stroke-linecap', 'round');
  for (const { d, width: w, opacity } of grain({ width, height }, {
    seed: 1931,
    pitch: [2.4 * s, 0.8 * s],
    tilt: 0,
    wave: [[1.6 * s, 900 * s, 260 * s], [0.7 * s, 260 * s, 700 * s]],
    dash: [30 * s, 1.0],
    gap: [12 * s, 1.0],
    density: [[1, 1], [1, 1]],
    tiers: [[0.35 * s, 0.14], [0.6 * s, 0.22], [0.95 * s, 0.32]],
  })) {
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', d);
    path.setAttribute('stroke-width', w.toFixed(2));
    path.setAttribute('stroke-opacity', opacity);
    g.append(path);
  }
  svg.append(g);
  ground.querySelector('.guide-grain')?.remove();
  ground.prepend(svg);
}

// ---------------------------------------------------------------------------
// Looking down, and back up

// Where the floor's edge is now: at the foot of the wall, or below the screen
// when it has slid away for a painting close up.
function floorTop() {
  const floor = document.querySelector('.floor');
  if (document.body.classList.contains('is-focused') || !floor) return innerHeight;
  return Math.min(floor.getBoundingClientRect().top, innerHeight);
}

export async function open(section = 'about') {
  if (isOpen) return;
  isOpen = true;
  returnFocus = document.activeElement;
  history.pushState({ ...(history.state ?? {}), rulebook: true }, '');

  layGround();
  guide.hidden = false;
  lift = floorTop() - innerHeight * HORIZON;
  guide.style.setProperty('--horizon', `${HORIZON * 100}dvh`);
  for (const el of scenery()) el.inert = true;
  document.body.classList.add('is-reading');

  const motion = reducedMotion.matches ? 0 : LOOK_MS;
  tuck = sheetTuck();
  ground.animate([{ transform: `translateY(${lift}px)` }, { transform: 'none' }], { duration: motion, easing: EASE });
  sheet.animate([{ transform: `translateY(${tuck}px)` }, { transform: 'none' }], { duration: motion, easing: EASE });
  for (const el of scenery()) {
    el.animate([{ transform: 'none' }, { transform: `translateY(${-lift}px)` }], { duration: motion, easing: EASE, fill: 'forwards' });
  }

  try {
    await load();
    show(section);
  } catch {
    page.innerHTML = '<p>The Rulebook couldn’t be loaded. Try again in a moment.</p>';
  }
  closeButton.focus({ preventScroll: true });
}

export function close() {
  if (!isOpen) return;
  isOpen = false;
  document.body.classList.remove('is-reading');
  const motion = reducedMotion.matches ? 0 : LOOK_MS;

  const done = ground.animate([{ transform: 'none' }, { transform: `translateY(${lift}px)` }], { duration: motion, easing: EASE, fill: 'forwards' });
  const tucked = sheet.animate([{ transform: 'none' }, { transform: `translateY(${tuck}px)` }], { duration: motion, easing: EASE, fill: 'forwards' });
  done.finished.then(() => tucked.cancel(), () => {});
  for (const el of scenery()) {
    el.getAnimations().forEach(a => a.cancel());
    el.animate([{ transform: `translateY(${-lift}px)` }, { transform: 'none' }], { duration: motion, easing: EASE });
  }
  done.finished.then(() => {
    done.cancel();
    if (isOpen) return;
    guide.hidden = true;
    const focused = document.body.classList.contains('is-focused');
    for (const el of scenery()) el.inert = el.classList.contains('gallery') && focused;
    returnFocus?.focus?.({ preventScroll: true });
  }, () => {});
}

// Closing goes back through the browser's history when opening went forward
// through it, so the back button and the close button agree.
function stepBack() {
  if (history.state?.rulebook) history.back();
  else close();
}

closeButton.addEventListener('click', stepBack);
addEventListener('popstate', () => {
  if (isOpen && !history.state?.rulebook) close();
});
document.addEventListener('keydown', event => {
  if (isOpen && event.key === 'Escape') {
    event.stopImmediatePropagation();
    stepBack();
  }
}, true);
addEventListener('resize', () => {
  if (isOpen) layGround();
});

// Anything marked data-rulebook opens the guide, at its section if it names one.
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-rulebook]');
  if (!trigger) return;
  event.preventDefault();
  open(trigger.dataset.rulebook || 'about');
});
