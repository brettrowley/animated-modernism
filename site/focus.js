// The focused view: a painting brought close. The painting itself (its live
// <svg>) flies from the wall to the middle of the screen as the floor slides
// away, and below it are its caption, its playback controls, a timeline of
// what moves when, and the rules the Rulebook took from it.
//
// The same <svg> moves between the wall and this view, so there's only ever
// one copy of each painting and its animation.

import { DETAILS, ARTISTS, RULE_TITLES, SETTLED, GUIDE_NUMBER } from './paintings.js';
import { createAnimation } from '../engine/motion.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const FLY_MS = 850;
const EASE = 'cubic-bezier(0.65, 0, 0.35, 1)'; // eases out of rest, brakes into it

const DURATIONS = [3, 4, 5, 6];

// The transport's three faces.
const ICONS = {
  play: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M6 3.5v13l11-6.5z" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3.5h3.6v13H5zM11.4 3.5H15v13h-3.6z" fill="currentColor"/></svg>',
  replay: '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 10a6 6 0 1 1-2-4.47"/><path d="M14.6 2.2v3.6H11"/></svg>',
};
const LABELS = { play: 'Play', pause: 'Pause', replay: 'Replay' };

// Reset turns back, the opposite way to Replay's arrow.
const RESET_ICON = '<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 10a6 6 0 1 0 2-4.47"/><path d="M5.4 2.2v3.6H9"/></svg>';

const view = document.querySelector('.focus');
const backButton = view.querySelector('.back');
const stage = view.querySelector('.focus-frame');
const caption = view.querySelector('.caption');
const panel = view.querySelector('.details');
const wall = document.querySelector('.gallery');

let current = null; // { piece, player }
let closing = null;  // finishes a close still in flight, if there is one

export function isOpen() {
  return current !== null;
}

// ---------------------------------------------------------------------------
// Playback at any length

// Plays an animation stretched to `length` seconds (rule 3.30's one tempo
// factor, applied from outside the scene), reporting progress (0–1).
function createPlayer(animation, onProgress) {
  const native = animation.duration;
  let anim = animation;
  let length = native;
  let progress = 1; // it arrives finished, as it hung on the wall
  let frame = null;

  const show = p => {
    progress = Math.min(Math.max(p, 0), 1);
    anim.seek(progress * native);
    onProgress(progress, isPlaying());
  };
  const isPlaying = () => frame !== null;

  function play(from = progress >= 1 ? 0 : progress) {
    stop();
    if (reducedMotion.matches) return show(1);
    const start = performance.now() - from * length * 1000;
    const tick = now => {
      const p = (now - start) / (length * 1000);
      frame = p < 1 ? requestAnimationFrame(tick) : null;
      show(p);
    };
    frame = requestAnimationFrame(tick);
    show(from);
  }

  function stop() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
  }

  return {
    native,
    get length() { return length; },
    get progress() { return progress; },
    set length(seconds) {
      const playing = isPlaying();
      length = seconds;
      if (playing) play(progress);
    },
    play,
    pause() { stop(); show(progress); },
    refresh() { show(progress); },
    // A retimed animation, on the same timeline.
    set animation(next) {
      anim = next;
      if (!isPlaying()) show(progress);
    },
    seek(p) { stop(); show(p); },
    isPlaying,
    stop,
  };
}

// ---------------------------------------------------------------------------
// Building the view

const fmt = seconds => (Number.isInteger(seconds) ? `${seconds}` : seconds.toFixed(2));

const TARGET_ICON = `<svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6">
  <circle cx="10" cy="10" r="6.2"/><circle cx="10" cy="10" r="1.6" fill="currentColor" stroke="none"/>
  <path d="M10 1v4M10 15v4M1 10h4M15 10h4" stroke-linecap="round"/></svg>`;
const INFO_ICON = `<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4">
  <circle cx="8" cy="8" r="6.6"/><path d="M8 7.2v4.4" stroke-linecap="round"/>
  <circle cx="8" cy="4.8" r="0.9" fill="currentColor" stroke="none"/></svg>`;

// The shortest a retimed motion can be, in seconds.
const MIN_SPAN = 0.15;

// A family of more than this many shapes starts collapsed into one bar.
const COLLAPSE_OVER = 3;

const CHEVRON = '<svg viewBox="0 0 12 12" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5 6 7.5 9 4.5"/></svg>';
const GRIPS = `
  <b class="grip" data-edge="start" title="Drag to change when it starts"></b>
  <b class="grip" data-edge="end" title="Drag to change when it ends"></b>`;

function build(piece) {
  const { name, scene, animation } = piece;
  const details = DETAILS[name];
  const artist = details?.artist ?? ARTISTS[name] ?? '';
  caption.innerHTML = `<b>${artist}</b>${details?.title ? `, <i>${details.title}</i>` : ''}${details?.year ? `, ${details.year}` : ''}`;
  caption.hidden = !artist;

  // The timeline runs the painting's own length; retimed motions stay on it.
  const axis = animation.duration;
  const families = details?.families ?? [];
  const lineIds = new Set(scene.lines.map(line => line.id));
  // A shadow or mirror image keeps to its caster, so it has no grips.
  const fixed = id => Boolean(scene.entrances[id]?.shadowOf || scene.entrances[id]?.mirrorOf);
  const pct = t => `${(t / axis) * 100}%`;

  panel.innerHTML = `
    <div class="row length-row">
      <span class="label" id="duration-label">Total duration (s)</span>
      <div class="lengths" role="radiogroup" aria-labelledby="duration-label"
        title="As directed, it runs ${fmt(axis)}s">
        ${DURATIONS.map(s => `<button type="button" role="radio" aria-checked="false" data-length="${s}">${s}</button>`).join('')}
      </div>
    </div>
    <div class="board">
      <div class="row scrub-row">
        <div class="transport">
          <button type="button" class="play"></button>
          <output class="clock" aria-live="off"></output>
        </div>
        <div class="lane" data-master><span class="handle" role="slider" tabindex="0"
          aria-label="Moment in the animation" aria-valuemin="0" aria-valuemax="100"></span></div>
      </div>
      ${families.length ? `
      <div class="timeline">
        ${families.map((f, i) => `
          <div class="family${f.ids.length > COLLAPSE_OVER ? ' is-collapsed' : ''}" data-family="${i}">
            <div class="head">
              <span class="name">${f.label}</span>
              <span class="tags">
                <button type="button" class="target" aria-pressed="false"
                  aria-label="Show the ${f.label.toLowerCase()} on the painting" title="Show on the painting">${TARGET_ICON}</button>
                <button type="button" class="badge" aria-expanded="false" aria-controls="why-${i}"
                  aria-label="${f.motion}: why this motion">${f.motion}${INFO_ICON}</button>
                ${f.ids.length > COLLAPSE_OVER ? `<button type="button" class="expand" aria-expanded="false"
                  aria-controls="lanes-${i}">${f.ids.length} shapes${CHEVRON}</button>` : ''}
              </span>
            </div>
            <div class="lanes" id="lanes-${i}">
              ${f.ids.length > COLLAPSE_OVER ? `
              <div class="lane group-lane" style="--n: 1">
                <span class="bar group" data-family="${i}" title="The whole family: its shapes keep their timing relative to each other">
                  <span class="ticks"></span>${GRIPS}</span>
              </div>` : ''}
              <div class="lane member-lane" style="--n: ${f.ids.length}">
                ${f.ids.map((id, k) => `<span class="bar${fixed(id) ? ' is-fixed' : ''}" data-id="${id}" style="--k: ${k}">${fixed(id) ? '' : GRIPS}</span>`).join('')}
              </div>
            </div>
            <div class="why" id="why-${i}" aria-hidden="true">
              <div><p>${f.why} <span class="cites">${f.rules.filter(r => SETTLED.has(r)).map(r => `Rule ${GUIDE_NUMBER[r]}`).join(' · ')}</span></p></div>
            </div>
          </div>`).join('')}
      </div>` : `
      <p class="pending">A breakdown of this painting’s motion and rules is coming.</p>`}
      <div class="playhead" aria-hidden="true"></div>
    </div>
    <div class="reset-row">
      <button type="button" class="reset" disabled>${RESET_ICON}<span>Reset to default</span></button>
    </div>
    ${details?.visible ? `
    <section class="rules" aria-labelledby="rules-heading">
      <h2 id="rules-heading">Rules most visible in this painting</h2>
      <ol>${details.visible.map(([n, where]) => `
        <li>
          <span class="n">${GUIDE_NUMBER[n] ?? n}</span>
          <span class="rule">${RULE_TITLES[n]}</span>
          <span class="where">${where}</span>
        </li>`).join('')}
      </ol>
      <p class="note">${details.note}</p>
      <a href="#" class="read-rulebook" data-rulebook="3-how-a-shape-moves">Read the Rulebook <span aria-hidden="true">→</span></a>
    </section>` : ''}`;

  const lengthButtons = [...panel.querySelectorAll('.lengths button')];
  const playButton = panel.querySelector('.play');
  const resetButton = panel.querySelector('.reset');
  const clock = panel.querySelector('.clock');
  const board = panel.querySelector('.board');
  const masterLane = panel.querySelector('.lane[data-master]');
  const master = masterLane.querySelector('.handle');
  const playhead = panel.querySelector('.playhead');
  const bars = [...panel.querySelectorAll('.bar[data-id]')];
  const groupBars = [...panel.querySelectorAll('.bar.group')];
  const familySpan = ids => {
    const all = ids.map(id => spans[id]).filter(Boolean);
    return [Math.min(...all.map(([a]) => a)), Math.max(...all.map(([, b]) => b))];
  };

  // ---- Retiming: each shape's own start and length, on top of the scene.
  let timing = {};     // id → { at, end } in seconds, for retimed shapes
  let spans = animation.spans;
  const isEdited = () => Object.keys(timing).length > 0;

  function retime() {
    const entrances = { ...scene.entrances };
    const lines = scene.lines.map(line => ({ ...line }));
    const natural = animation.spans; // as directed
    for (const [id, { at, end }] of Object.entries(timing)) {
      if (lineIds.has(id)) {
        Object.assign(lines.find(line => line.id === id), { at, draw: end - at });
      } else {
        const [a, b] = natural[id];
        entrances[id] = { ...entrances[id], at, stretch: (end - at) / (b - a) };
      }
    }
    const next = isEdited() ? createAnimation({ ...scene, entrances, lines }, piece.shapes) : animation;
    spans = next.spans;
    player.animation = next;
    drawBars();
  }

  function drawBars() {
    for (const bar of bars) {
      const [a, b] = spans[bar.dataset.id] ?? [0, 0];
      bar.style.left = pct(a);
      bar.style.width = pct(b - a);
      bar.classList.toggle('is-edited', bar.dataset.id in timing);
    }
    // A collapsed family is one bar from its first start to its last end,
    // with a tick where each of its shapes starts.
    for (const bar of groupBars) {
      const { ids } = families[Number(bar.dataset.family)];
      const [a, b] = familySpan(ids);
      bar.style.left = pct(a);
      bar.style.width = pct(b - a);
      bar.classList.toggle('is-edited', ids.some(id => id in timing));
      bar.querySelector('.ticks').innerHTML = ids
        .map(id => `<i style="left: ${((spans[id][0] - a) / (b - a)) * 100}%"></i>`).join('');
    }
    updateReset();
  }

  // ---- Playback

  // Every painting plays at a whole number of seconds, its directed length
  // rounded, so one of the lengths is always chosen.
  const fallback = Math.min(Math.max(Math.round(axis), DURATIONS[0]), DURATIONS.at(-1));
  let chosen = fallback;

  // The button's face changes only with its state: replacing what's under the
  // pointer between press and release would swallow the click.
  let face = null;
  function setFace(next) {
    if (next === face) return;
    face = next;
    playButton.innerHTML = ICONS[next];
    playButton.setAttribute('aria-label', LABELS[next]);
    playButton.title = LABELS[next];
  }

  function placePlayhead() {
    const top = masterLane.getBoundingClientRect();
    const box = board.getBoundingClientRect();
    const lanes = [...board.querySelectorAll('.timeline .lane')].filter(l => l.getClientRects().length);
    const last = (lanes.at(-1) ?? masterLane).getBoundingClientRect();
    playhead.style.left = `${top.left - box.left + player.progress * top.width}px`;
    playhead.style.top = `${top.top - box.top + top.height / 2}px`;
    playhead.style.height = `${last.bottom - top.top - top.height / 2 + 6}px`;
  }

  const player = createPlayer(animation, (p, playing) => {
    const t = p * player.length;
    clock.value = `${t.toFixed(2)} / ${fmt(player.length)}s`;
    setFace(playing ? 'pause' : p >= 1 ? 'replay' : 'play');
    masterLane.style.setProperty('--p', p);
    master.setAttribute('aria-valuenow', String(Math.round(p * 100)));
    master.setAttribute('aria-valuetext', `${t.toFixed(2)} of ${fmt(player.length)} seconds`);
    if (player) placePlayhead();
    updateReset(playing, p);
  });

  function updateReset(playing = player?.isPlaying(), p = player?.progress ?? 1) {
    resetButton.disabled = chosen === fallback && !playing && p >= 1 && !isEdited();
  }

  const choose = length => {
    chosen = length;
    player.length = length;
    for (const b of lengthButtons) b.setAttribute('aria-checked', String(Number(b.dataset.length) === length));
    if (!player.isPlaying()) player.refresh();
  };
  for (const b of lengthButtons) b.addEventListener('click', () => choose(Number(b.dataset.length)));
  choose(fallback);
  drawBars();

  playButton.addEventListener('click', () => (player.isPlaying() ? player.pause() : player.play()));

  // Back to how it arrived: its own timing and length, finished, every
  // reason closed.
  resetButton.addEventListener('click', () => {
    timing = {};
    retime();
    player.seek(1);
    choose(fallback);
    for (const row of panel.querySelectorAll('.family.is-open')) toggleWhy(row, false);
  });

  // Dragging: the master lane scrubs; a bar's grips move its start or end.
  function drag(element, event, onMove) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    element.setPointerCapture(event.pointerId);
    element.classList.add('is-dragging');
    const x0 = event.clientX;
    const move = e => onMove(e, e.clientX - x0);
    const up = () => {
      element.classList.remove('is-dragging');
      element.removeEventListener('pointermove', move);
      element.removeEventListener('pointerup', up);
      element.removeEventListener('pointercancel', up);
    };
    element.addEventListener('pointermove', move);
    element.addEventListener('pointerup', up);
    element.addEventListener('pointercancel', up);
    onMove(event, 0);
  }

  masterLane.addEventListener('pointerdown', event => {
    const box = masterLane.getBoundingClientRect();
    drag(masterLane, event, e => player.seek((e.clientX - box.left) / box.width));
    master.focus({ preventScroll: true });
  });

  for (const bar of bars) {
    if (bar.classList.contains('is-fixed')) continue;
    const id = bar.dataset.id;
    bar.addEventListener('pointerdown', event => {
      const edge = event.target.dataset?.edge; // 'start' or 'end'
      if (!edge) return;
      const lane = bar.parentElement.getBoundingClientRect();
      const [a0, b0] = spans[id];
      drag(event.target, event, (e, dx) => {
        const dt = (dx / lane.width) * axis;
        let at = a0;
        let end = b0;
        if (edge === 'start') at = Math.min(Math.max(a0 + dt, 0), b0 - MIN_SPAN);
        else end = Math.min(Math.max(b0 + dt, a0 + MIN_SPAN), axis);
        if (dx === 0) return;
        timing[id] = { at, end };
        retime();
      });
    });
  }

  // A collapsed family's grips stretch the whole family: each shape keeps
  // its place relative to the others, so the family's own rhythm survives.
  for (const bar of groupBars) {
    const { ids } = families[Number(bar.dataset.family)];
    bar.addEventListener('pointerdown', event => {
      const edge = event.target.dataset?.edge;
      if (!edge) return;
      const lane = bar.parentElement.getBoundingClientRect();
      const before = Object.fromEntries(ids.map(id => [id, spans[id]]));
      const [f0, f1] = familySpan(ids);
      const shortest = Math.min(...ids.filter(id => !fixed(id)).map(id => before[id][1] - before[id][0]));
      // However short the family gets, no shape in it goes below MIN_SPAN / 3.
      const minLength = Math.max(MIN_SPAN, ((f1 - f0) * (MIN_SPAN / 3)) / shortest);
      drag(event.target, event, (e, dx) => {
        if (dx === 0) return;
        const dt = (dx / lane.width) * axis;
        let g0 = f0;
        let g1 = f1;
        if (edge === 'start') g0 = Math.min(Math.max(f0 + dt, 0), f1 - minLength);
        else g1 = Math.min(Math.max(f1 + dt, f0 + minLength), axis);
        const scale = (g1 - g0) / (f1 - f0);
        for (const id of ids) {
          if (fixed(id)) continue;
          const [a, b] = before[id];
          timing[id] = { at: g0 + (a - f0) * scale, end: g0 + (b - f0) * scale };
        }
        retime();
      });
    });
  }

  // Expanding a family shows each of its shapes, with its own grips.
  for (const row of panel.querySelectorAll('.family')) {
    const toggle = row.querySelector('.expand');
    if (!toggle) continue;
    const count = row.querySelectorAll('.bar[data-id]').length;
    toggle.addEventListener('click', () => {
      const open = row.classList.toggle('is-collapsed') === false;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.firstChild.textContent = open ? 'Collapse' : `${count} shapes`;
    });
  }

  // Frame by frame from the keyboard: one 60th of a second per press, ten
  // with Shift.
  master.addEventListener('keydown', event => {
    const frame = 1 / (60 * player.length);
    const step = event.shiftKey ? 10 * frame : frame;
    const now = player.progress;
    const moves = { ArrowRight: now + step, ArrowUp: now + step, ArrowLeft: now - step, ArrowDown: now - step, Home: 0, End: 1 };
    if (!(event.key in moves)) return;
    event.preventDefault();
    player.seek(moves[event.key]);
  });

  // Each row's reason opens below it, pushing the rest down; the row stays put.
  function toggleWhy(row, open = !row.classList.contains('is-open')) {
    row.classList.toggle('is-open', open);
    row.querySelector('.badge').setAttribute('aria-expanded', String(open));
    row.querySelector('.why').setAttribute('aria-hidden', String(!open));
  }
  for (const row of panel.querySelectorAll('.family')) {
    row.querySelector('.badge').addEventListener('click', () => toggleWhy(row));
  }
  // The playhead runs the full height of the rows, however they open.
  new ResizeObserver(placePlayhead).observe(board);

  // A row's target badge is a toggle: it shows the row's shapes on the
  // painting in pink until it's pressed again. One row at a time.
  const svg = piece.svg;
  const prefix = `${name}-`;
  // A shape's own planes, and any overlap that recolours it where it meets
  // others (rule 1.7), so it lights up whole.
  const overlapsOf = id => scene.planes.filter(plane => plane.of === id).map(plane => plane.id);
  const shapesOf = ids => ids.flatMap(id => [id, `${id}-twin`, ...overlapsOf(id)]).flatMap(id => [
    ...svg.querySelectorAll(`[data-plane="${CSS.escape(id)}"]`),
    ...svg.querySelectorAll(`use.line[href="#${CSS.escape(prefix + 'shape-' + id)}"]`),
  ]);
  const target = ids => {
    for (const node of svg.querySelectorAll('.is-lit')) node.classList.remove('is-lit');
    if (ids) for (const node of shapesOf(ids)) node.classList.add('is-lit');
  };
  const targets = [...panel.querySelectorAll('.target')];
  const untarget = () => {
    target(null);
    for (const t of targets) t.setAttribute('aria-pressed', 'false');
  };
  for (const row of panel.querySelectorAll('.family')) {
    const { ids } = families[Number(row.dataset.family)];
    const button = row.querySelector('.target');
    button.addEventListener('click', () => {
      const on = button.getAttribute('aria-pressed') !== 'true';
      untarget();
      if (!on) return;
      button.setAttribute('aria-pressed', 'true');
      target(ids);
    });
  }
  resetButton.addEventListener('click', untarget);

  player.refresh();
  return player;
}

// ---------------------------------------------------------------------------
// Opening and closing

// On a wide screen the painting sits beside its timeline, so a row's shapes
// light up in view; otherwise the timeline is below it.
const wide = matchMedia('(min-width: 1100px)');

// The frame's size here: as tall as the screen allows, within its width.
function fit(scene) {
  const { width, height } = scene.viewBox;
  const ratio = width / height;
  const maxW = wide.matches ? Math.min(innerWidth * 0.5, 820) : Math.min(innerWidth - 32, 760);
  const maxH = wide.matches ? innerHeight - 230 : innerHeight * 0.78; // clear of the Gallery sign
  const h = Math.max(Math.min(maxH, 900, maxW / ratio / 1.08), 160);
  view.style.setProperty('--art-h', `${h}px`);
  stage.style.setProperty('--ar', `${width} / ${height}`);
  view.style.setProperty('--column', `${Math.max(h * ratio * 1.08, Math.min(640, innerWidth - 32))}px`);
}

export function open(piece, { instant = false } = {}) {
  if (current) return;
  closing?.(); // reopening mid-close: land the last one first
  const from = piece.frame.getBoundingClientRect();

  view.hidden = false;
  view.scrollTop = 0;
  fit(piece.scene);

  // Keep the wall's frame its size while its painting is away, and hide it.
  const svg = piece.svg;
  piece.frame.style.width = `${from.width}px`;
  piece.frame.style.height = `${from.height}px`;
  piece.frame.style.visibility = 'hidden';
  svg.style.width = '';
  stage.append(svg);

  current = { piece, player: build(piece) };
  document.body.classList.add('is-focused');
  wall.inert = true; // the wall behind is out of reach while close up
  requestAnimationFrame(() => view.classList.add('is-open'));

  // It arrives finished, as it hung on the wall: replaying it would mean it
  // vanishing first, which is just the pop-in rule 3.7 forbids.
  const done = () => backButton.focus({ preventScroll: true });
  if (instant || reducedMotion.matches) return done();

  const to = stage.getBoundingClientRect();
  stage.animate([
    { transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${from.width / to.width})` },
    { transform: 'none' },
  ], { duration: FLY_MS, easing: EASE }).finished.then(done);
}

export function close() {
  if (!current) return;
  const { piece, player } = current;
  current = null;
  player.stop();
  piece.animation.seek(piece.animation.duration); // leave it finished on the wall, as directed

  for (const node of piece.svg.querySelectorAll('.is-lit')) node.classList.remove('is-lit');

  const finish = () => {
    if (closing !== finish) return;
    closing = null;
    stage.getAnimations().forEach(a => a.cancel());
    piece.frame.prepend(piece.svg);
    piece.frame.style.width = '';
    piece.frame.style.height = '';
    piece.frame.style.visibility = '';
    view.hidden = true;
    stage.style.transform = '';
    panel.innerHTML = '';
    piece.frame.focus({ preventScroll: true });
  };

  closing = finish;
  view.classList.remove('is-open');
  document.body.classList.remove('is-focused');
  wall.inert = false;
  if (reducedMotion.matches) return finish();

  const from = stage.getBoundingClientRect();
  const to = piece.frame.getBoundingClientRect();
  stage.animate([
    { transform: 'none' },
    { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${to.width / from.width})` },
  ], { duration: FLY_MS, easing: EASE, fill: 'forwards' }).finished.then(finish, () => {});
}

export function onBack(handler) {
  backButton.addEventListener('click', handler);
}

addEventListener('resize', () => {
  if (current) fit(current.piece.scene);
});
