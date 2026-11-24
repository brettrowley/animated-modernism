// Opening animation of a scene: the construction lines draw themselves, and each
// plane arrives along the grid of the composition.
//
// A polygon with a slide entrance enters in two overlapping phases:
//
//   travel – it is collapsed to a sliver lying on one of its own edges (the
//            "base" edge) and slides in along that edge's line from far away.
//   unfold – the remaining vertices sweep out from the base edge along the
//            polygon's other edges until the shape is whole.
//
// So every vertex only ever moves along lines that already exist in the
// painting.
//
// When the two unfolding sides are parallel, the far edge actually rotates
// about a fixed pivot (where its line meets the base edge's line) as it
// unfolds. A `sweep` entrance drives that rotation by angle, accelerating
// through the turn and braking only at the very end, so it reads as an angular
// sweep rather than a slide.
//
// A polygon with a `bounce` entrance skips the travel: it starts as a sliver on
// its base edge and fans straight open, driven like a dropped object under
// gravity. It snaps open faster and faster, hits its full shape, folds back a
// little, and settles; each rebound loses energy and it never opens past its
// resting shape.
//
// A quadrilateral with a `beam` entrance shoots in from off-canvas as a long
// beam: the shape extended far back along its sides. It ends in one of two
// ways:
//
//   land – the beam brakes as one rigid piece until its front stops on the
//          shape's front edge (the front only ever slows down); then the back,
//          still off-canvas, catches up behind it, so the beam shortens into
//          the shape.
//   pass – the beam keeps going at that same speed. When its back reaches the
//          shape's back edge, the beam leaves the shape behind and the rest of
//          it carries on off the canvas. The beam is elastic: as it breaks
//          away, the shape's front edge is tugged forward after it, then snaps
//          back, wobbling past its place a few times as it settles.
//
// A circle with a `swoop` entrance comes in along a curve, swelling from a speck
// to full size as if approaching from a distance. A circle with a painted
// outline is scaled as a whole, so its outline swells with it.
//
// Each construction line is laid down by a head running from one end to the
// other at an uneven, pulsing pace: a narrow wedge, full stroke width at the
// front, tapering back into the dotted trail it leaves behind. It emerges from
// nothing as it leaves the start and thins back into the line at the end.
//
// An arc with a `draw` entrance is laid down like a line, from its `from` end
// round to its `to` end, easing in and out.
//
// A rod with a `rise` entrance grows from its hidden end to its tip like
// something thrown upward, slowing under gravity until it stops at its apex. With
// a `bounce`, it is still moving when it reaches full length: it hits a stop
// there, falls back a little, and settles, each rebound losing energy.
//
// A circular segment with a `radial` entrance is swept out by a line turning
// clockwise on screen, from its `from` end to its `to` end. It turns about the
// circle's own centre, or with `pivot: 'chord'`, about the chord's midpoint: it
// starts as a thin line from there along the chord to the `from` end. Either way
// it emerges from nothing, gathering speed through the turn and braking only at
// the very end. With a `bounce`, it doesn't brake: it falls through the turn under
// gravity, hits the chord, swings back a little, and settles.
//
// A crescent (a `path` plane: a straight edge, then two elliptical arcs that
// meet at a point) with a `hoist` entrance grows out of that point. Its straight
// edge starts there as nothing and is hoisted up the two curved edges, each end
// riding its own curve, until it comes to rest in place. The ends cover the
// same fraction of their curves at every moment, so the end on the longer curve
// moves faster and the edge turns as it rises. It eases out of rest and brakes
// into place.
//
// A crescent whose third edge is curved too (`M a A … b A … c A … a Z`) is
// hoisted the same way, but its rising edge is an arc of the third edge's
// radius, so it comes to rest as exactly that edge.
//
// A lune (a `path` plane of two arcs meeting at both ends, `M a A … b A … a Z`)
// with a `lune` entrance is drawn from its tip a round to its tip b. Its leading
// edge is a straight cut between the two curved edges, at the same fraction of
// each, so it grows out of nothing at a, turns as it travels (the end on the
// longer edge moves faster), and shrinks back to nothing at b. It eases in and
// out.
//
// A circle with a `lift` entrance rises straight up from `from`, its centre's
// starting point, to its resting place, braking all the way like the front of
// a landing beam. It starts hidden (behind a horizon), so it can start at
// speed.
//
// A circle with a `mirrorOf` entrance has no motion of its own: it is another
// circle's mirror image in the horizontal line y = `axis`, so it sinks as that
// circle rises.
//
// A right-angled strip with a `ricochet` entrance shoots in along its near arm,
// glances off the corner, losing speed there, and brakes steadily to a stop at
// the far end of its other arm. It never speeds up.
//
// A plane with a `shadowOf` entrance has no motion of its own: it is a beam's
// shadow, and every point moves exactly as the beam's matching point does.
//
// A stroke (a `stroke` plane: a woodcut's line, see engine/strokes.js) with a
// `cut` entrance is cut from its first point to its last, like a gouge pushed
// along it: a front led by a pointed head, which grows from nothing at the
// start. It starts at speed (it starts from nothing, rule 3.28), loses speed at
// each corner it turns, like something thrown that glances off a stop, and
// brakes steadily to a stop along its last segment. It never speeds up. A
// single straight stroke just brakes all the way.
//
// A plane with a `grain` and a `roll` entrance is inked like a woodblock under
// a roller: the ink, and the grain in it, sweep across from the left edge to
// the right, braking as they go. The front is ragged, each row of the grain
// taking the ink a little before or after its neighbours, so the edge reads
// as fibres rather than a straight wipe. It starts off-canvas, so at speed.
//
// A scene's `entrances` give each plane:
//
// at:    start time in seconds
// edge:  index of the base edge (vertices edge and edge + 1)
// from:  +1 arrives from beyond the edge's end vertex, -1 from beyond its start
// sweep: optional; seconds to unfold as an accelerating angular sweep instead
//        of the usual eased unfold (quadrilaterals with parallel sides only)
//
// or, to fan open in place with a bounce instead of travelling, `bounce`
// (with `edge`, no `from`):
//   time        – seconds from release until it first reaches full shape
//   restitution – fraction of speed kept on each bounce (0: dead stop,
//                 1: bounces forever); rebound size scales with its square
//   bounces     – how many rebounds to show before it settles
// and optionally `sliver: 0`, to open from nothing rather than from a visible
// sliver.
//
// or, to fold open in place and brake to a stop with no rebound, `fold` (with
// `edge`, and `sliver` as above):
//   time – seconds to open
//
// or, to shoot in as a beam, `beam`:
//   front – index of the edge the beam leads with (it comes to rest there);
//           the opposite edge is its back, and the other two are its sides,
//           which it travels along
//   ending – 'land' or 'pass'
//   time   – seconds the front takes to brake to a stop when landing; this
//            also sets the beam's speed (the same in both endings)
//   entry  – optional, passing only; enters this many times faster and slows
//            steadily, as if stretching, down to that speed as it breaks
//   alongSides – optional; for a wedge whose sides splay apart, like a beam
//            of light from a source off the canvas: each corner travels along
//            its own side, so the beam always lies between its two edges
//
// or, for a circle, `swoop`:
//   duration    – seconds to arrive
//   path        – cubic Bézier for the centre: the start point and two control
//                 points; the curve ends at the circle's resting centre
//   startRadius – size at the start; smaller grows late, as if approaching,
//                 and larger shrinks early, as if moving away
//   spiral      – instead of `path`; winds in round a point to the resting
//                 centre: { centre, turns, reach }, where `reach` is how far
//                 from `centre` it starts and `turns` how many times it goes
//                 round (clockwise on screen; negative for anticlockwise)
//
// or, for an arc, `draw`:
//   time – seconds to lay it down
// An arc whose `from` and `to` are the same point is a full circle, drawn all
// the way round and closed once drawn.
//
// or, for a rod, `rise`:
//   time   – seconds until it reaches its apex
//   bounce – optional; rebounds off the apex instead of stopping there:
//     time        – seconds a fall from `height` would take; with `height`, this
//                   sets how fast the rod arrives
//     height      – the fall that sets the bounce's energy (viewBox units); the
//                   first rebound's size is height × restitution²
//     restitution – as for a plane's `bounce`
//     bounces     – as for a plane's `bounce`
//
// or, for a circular segment, `radial`:
//   time   – seconds to sweep from end to end
//   pivot  – optional; 'chord' to turn about the chord's midpoint
//   bounce – optional; rebounds off the chord, with `restitution` and `bounces`
//            as for a plane's `bounce`
//
// or, for a crescent `path` plane written as `M a L b A … c A … a Z` (the
// straight edge a–b, then arcs b–c and c–a), `hoist`:
//   time – seconds from the point c to the full shape
//
// or, for a lune `path` plane written as `M a A … b A … a Z`, `lune`:
//   time – seconds from tip a to tip b
//
// or, for a circle, `lift`:
//   from – where its centre starts
//   time – seconds to come to rest
//
// or, for a circle, `mirrorOf`, the id of the circle it mirrors, with `axis`,
// the y of the mirror line. List it after that circle.
//
// or, for a strip whose six points run far end (outer, inner), inner corner, near
// end (inner, outer), outer corner, `ricochet`:
//   time – seconds from start to stop
//   keep – fraction of its speed it keeps through the corner
//
// or, for a beam's shadow, `shadowOf`, the id of the beam: a quadrilateral whose
// points are in the same order as the beam's, with its ends in line with the
// beam's ends.
//
// or, for a `stroke` plane, `cut`:
//   time – seconds from its first point to its last
//   keep – fraction of its speed it keeps through each corner (default 1)
//   head – length of the gouge's point, in line widths (default 2.5; 0 for a
//          square front)
//
// or, for a plane with a `grain`, `roll`:
//   time   – seconds for the ink to cross the block
//   ragged – how far rows of the front run ahead of or behind it (viewBox units)
//   row    – height of each row of the front
//   seed   – any integer, for the front's raggedness

import { setPoints, setCircle, setLine, setCurve, setHead, setSegment } from './render.js';
import { strokeSegments, cutOutline } from './strokes.js';
import { random } from './grain.js';

// How many straight segments draw an arc.
const ARC_SEGMENTS = 120;

// How far beyond the canvas edge a beam's ends start and finish.
const BEAM_MARGIN = 20;

// When landing, the back starts catching up at CATCH_AT of the front's braking
// time and takes CATCH_TIME seconds to close in, easing in and out.
const CATCH_AT = 0.55;
const CATCH_TIME = 0.6;

// When a passing beam breaks away, the shape's front edge wobbles as a damped
// spring: SNAP_STRETCH is how far it is first tugged forward (viewBox units),
// SNAP_FREQ how many wobbles per second, and SNAP_DAMPING how quickly they die
// away (per second; each second the wobble shrinks by e^-SNAP_DAMPING).
const SNAP_STRETCH = 14;
const SNAP_FREQ = 3;
const SNAP_DAMPING = 3;

// Seconds until the wobble is under a quarter unit, after which it is held
// exactly at rest.
const SNAP_SETTLE = Math.log(SNAP_STRETCH / 0.25) / SNAP_DAMPING;

// How far the front edge is from rest `t` seconds after the break: forward
// first (the tug), then back past its place, and so on, shrinking each time.
function snap(t) {
  if (t <= 0 || t >= SNAP_SETTLE - 1e-9) return 0; // rounding must not miss the end
  return SNAP_STRETCH * Math.exp(-SNAP_DAMPING * t) * Math.sin(2 * Math.PI * SNAP_FREQ * t);
}

// Line head shape and pace, in viewBox units.
//   WIDTH  – width of the head's front edge at full strength
//   TAPER  – length of the wedge from front edge to point
//   GROW   – distance from the line's start over which the head builds up
//   SPEND  – fraction of the line at the end over which it thins away
//   SURGE  – how strongly the pace wobbles (below 1: never stalls or reverses)
//   PULSES – how many surges happen along the line
const HEAD_WIDTH = 4.5;
const HEAD_TAPER = 70;
const HEAD_GROW = 60;
const HEAD_SPEND = 0.2;
const HEAD_SURGE = 0.45;
const HEAD_PULSES = 3;

const TRAVEL = 1.2;
const UNFOLD = 1.1;
const UNFOLD_AT = 0.7; // fraction of travel elapsed when unfolding begins
const DISTANCE = 900;
const SLIVER = 0.04; // collapsed width, as a fraction of the full shape

const easeOutCubic = t => 1 - (1 - t) ** 3;
const easeInOutCubic = t => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = t => Math.min(1, Math.max(0, t));
const lerp = (a, b, t) => a + (b - a) * t;
const lerp2 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];

function unit([x, y]) {
  const len = Math.hypot(x, y);
  return [x / len, y / len];
}

// Beams that pass through split in two, so they need a twin plane, and so do
// their shadows.
export function twinIds({ entrances }) {
  const passes = id => entrances[id]?.beam?.ending === 'pass';
  return Object.keys(entrances).filter(id => passes(id) || passes(entrances[id].shadowOf));
}

// Planes revealed through a clip region rather than by moving their outline.
export function clipIds({ planes, entrances }) {
  return planes.filter(plane => entrances[plane.id]?.roll)
    .map(plane => plane.id);
}

// ---------------------------------------------------------------------------
// Woodcut: cuts and the inking roll

// Returns how far a cut has travelled `t` seconds after it starts (0 to the
// stroke's full length). Each segment is crossed at a steady speed, a `keep`
// fraction of the last one's, and the last brakes steadily to a stop. The
// starting speed is whatever makes the whole cut take `time`.
function cutMotion(segments, { time, keep = 1 }) {
  const lengths = segments.map(({ lo, hi }) => hi - lo);
  const last = lengths.length - 1;
  // The cut's duration at a starting speed of 1: braking covers its distance
  // at half its entry speed.
  const slowness = lengths.reduce((sum, l, k) => sum + (k < last ? l : 2 * l) / keep ** k, 0);
  const v0 = slowness / time;
  return t => {
    if (t <= 0) return 0;
    let travelled = 0;
    for (let k = 0; k <= last; k++) {
      const v = v0 * keep ** k;
      const l = lengths[k];
      const span = (k < last ? l : 2 * l) / v;
      if (k < last && t < span) return travelled + v * t;
      if (k === last) return travelled + l * (1 - (1 - Math.min(t / span, 1)) ** 2);
      t -= span;
      travelled += l;
    }
    return travelled;
  };
}

// Returns the inked region `t` seconds into a roll, as polygon points: the
// canvas behind a ragged front. Each row of the front is offset by a smooth
// undulation and its own jitter, fixed for the whole roll.
function rollMotion({ width, height }, { time, ragged, row, seed = 1 }) {
  const rand = random(seed);
  const margin = 20;
  const phases = [rand(), rand()].map(p => p * 2 * Math.PI);
  const rows = [];
  for (let y = -margin; y < height + margin; y += row) {
    const smooth = 0.6 * Math.sin((2 * Math.PI * y) / 260 + phases[0]) + 0.4 * Math.sin((2 * Math.PI * y) / 97 + phases[1]);
    rows.push({ y, offset: ragged * (0.55 * smooth + 0.45 * (rand() * 2 - 1)) });
  }
  const from = -(ragged + margin);
  const to = width + ragged + margin;
  return t => {
    const front = from + (to - from) * easeOutCubic(clamp01(t / time));
    const edge = rows.flatMap(({ y, offset }) => [[front + offset, y], [front + offset, y + row]]);
    return [[-margin, -margin], ...edge, [-margin, height + margin]];
  };
}

// ---------------------------------------------------------------------------
// Beams

// Distance from `p` along unit direction `d` until it is `beyond` units outside
// the canvas (0 if it is already there on that side).
function exitDistance([px, py], [dx, dy], { width, height }, beyond = 0) {
  const tx = dx > 0 ? (width + beyond - px) / dx : dx < 0 ? (-beyond - px) / dx : Infinity;
  const ty = dy > 0 ? (height + beyond - py) / dy : dy < 0 ? (-beyond - py) / dy : Infinity;
  return Math.max(0, Math.min(tx, ty));
}

// Everything about a beam that doesn't change over time, in viewBox units:
//   u       – direction of travel, averaged over the two sides
//   isFront – which vertices are on the front edge (the rest are on the back)
//   reach   – how far the front starts behind its resting place: just off-canvas
//   tail    – how far the beam extends behind the shape's back edge once
//             formed: back to just off-canvas
//   exit    – how far past its resting place the front edge must travel for
//             a departing piece to leave the canvas
//   speed   – entry speed, shared by both endings; a passing beam with an `entry`
//             slows to this speed instead
//   split   – seconds until a passing beam breaks
//
// `shadows` are the outlines of planes that move with the beam (`shadowOf`),
// with points in the same order as the beam's. Distances cover them too, so a
// shadow whose ends aren't quite in line with the beam's still starts and
// finishes off-canvas.
function beamGeometry(points, { front, ending, time, entry = 1, alongSides = false }, viewBox, shadows = []) {
  const n = points.length;
  const f = [front, (front + 1) % n];
  const b = [(front + 3) % n, (front + 2) % n]; // across each side from f
  const sides = f.map((fi, k) => unit([points[fi][0] - points[b[k]][0], points[fi][1] - points[b[k]][1]]));
  const u = unit([sides[0][0] + sides[1][0], sides[0][1] + sides[1][1]]);
  // Which way each vertex travels: along the beam, or, for a wedge whose sides
  // splay, along its own side, so the beam always lies between them.
  const dirs = points.map((_, i) => (alongSides ? sides[Math.max(f.indexOf(i), b.indexOf(i))] : u));

  const outlines = [points, ...shadows];
  // How far the given corners travel, each along its own direction (backwards
  // with sign -1), until they're all off the canvas.
  const furthest = (ends, sign) => Math.max(...outlines.flatMap(o => ends.map(i =>
    exitDistance(o[i], [dirs[i][0] * sign, dirs[i][1] * sign], viewBox))));
  const reach = furthest(f, -1) + BEAM_MARGIN;
  const tail = furthest(b, -1) + BEAM_MARGIN;
  const exit = furthest(f, 1) + BEAM_MARGIN;
  const speed = (3 * reach) / time; // easeOutCubic's starting speed over `reach`
  const split = (2 * (reach + tail)) / (speed * (1 + entry)); // at its average speed

  return { u, dirs, isFront: points.map((_, i) => f.includes(i)), front: f, reach, tail, exit, speed, split, entry, time, ending };
}

function beamEnd(at, beam) {
  if (beam.ending === 'pass') {
    return at + beam.split + Math.max(beam.exit / beam.speed, SNAP_SETTLE);
  }
  return at + Math.max(beam.time, CATCH_AT * beam.time + CATCH_TIME);
}

// How far each end of the beam is from its resting place along `u` (negative:
// still behind it), plus, once a passing beam has split, how far the
// departing piece's back edge has gone past the shape's front edge.
function beamOffsets(beam, t) {
  const { reach, tail, time, speed, split, entry } = beam;
  t = Math.max(t, 0);

  if (beam.ending === 'pass') {
    if (t < split) {
      const slowing = (speed * (entry - 1)) / split;
      const back = speed * entry * t - (slowing * t * t) / 2 - (reach + tail);
      return { front: back + tail, back, departed: null };
    }
    const departed = speed * (t - split);
    return { front: snap(departed / speed), back: 0, departed };
  }

  const front = -reach * (1 - clamp01(t / time)) ** 3;
  const caught = easeInOutCubic(clamp01((t - CATCH_AT * time) / CATCH_TIME));
  return { front, back: front - tail * (1 - caught), departed: null };
}

function drawBeam(shapes, plane, beam, at, elapsed) {
  const { u, dirs, isFront } = beam;
  const offset = ([x, y], d, [dx, dy] = u) => [x + dx * d, y + dy * d];
  const { front, back, departed } = beamOffsets(beam, elapsed - at);

  setPoints(shapes[plane.id], plane.points.map((p, i) => offset(p, isFront[i] ? front : back, dirs[i])));

  // The departing piece is the front edge swept forward by the tail length.
  const twin = shapes[`${plane.id}-twin`];
  if (!twin) return;
  if (departed === null || departed >= beam.exit) {
    twin.style.visibility = 'hidden';
    return;
  }
  const [f0, f1] = beam.front.map(i => plane.points[i]);
  setPoints(twin, [
    offset(f0, departed + beam.tail),
    offset(f1, departed + beam.tail),
    offset(f1, departed),
    offset(f0, departed),
  ]);
  twin.style.visibility = '';
}

// ---------------------------------------------------------------------------
// Slides, bounces, circle and lines

// Seconds from release until a bounce has settled: the first approach, then
// each rebound's out-and-back, which lasts restitution^n of twice the approach.
function bounceDuration({ time, restitution, bounces }) {
  let total = time;
  for (let n = 1; n <= bounces; n++) total += 2 * time * restitution ** n;
  return total;
}

function phases(elapsed, { at, sweep }, sweepAt) {
  const travel = easeOutCubic(clamp01((elapsed - at) / TRAVEL));
  const u = clamp01((elapsed - at - TRAVEL * UNFOLD_AT) / (sweep ?? UNFOLD));
  const unfold = sweep ? sweepAt(easeInSweep(u)) : easeInOutCubic(u);
  return { travel, unfold };
}

// Mostly accelerating, braking only over the last stretch: 1 - (1 - u³)².
const easeInSweep = u => 1 - (1 - u ** 3) ** 2;

const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];

// For a quadrilateral unfolding from base edge `edge` whose sides are
// parallel: maps sweep progress (0–1, by angle) to the unfold fraction that
// polygonAt expects. The far edge always passes through the pivot where the
// base and far edge lines meet, so each angle gives one position along the
// sides.
function sweepMotion(points, edge) {
  const n = points.length;
  const a = points[edge];
  const b = points[(edge + 1) % n];
  const near = points[(edge + 3) % n]; // folds onto a
  const far = points[(edge + 2) % n]; // folds onto b
  const side = sub(near, a);

  const farEdge = sub(far, near);
  const pivot = lerp2(near, far, cross(sub(a, near), sub(b, a)) / cross(farEdge, sub(b, a)));

  const angleAt = s => {
    const [x, y] = sub(lerp2(a, near, s), pivot);
    return Math.atan2(y, x);
  };
  const start = angleAt(SLIVER);
  let turn = angleAt(1) - start;
  turn = Math.atan2(Math.sin(turn), Math.cos(turn)); // shortest way round

  return progress => {
    const angle = start + turn * progress;
    const d = [Math.cos(angle), Math.sin(angle)];
    const s = cross(sub(pivot, a), d) / cross(side, d);
    return clamp01((s - SLIVER) / (1 - SLIVER));
  };
}

function polygonAt(points, { edge, from = 0, sliver = SLIVER }, travel, unfold) {
  const n = points.length;
  const a = points[edge];
  const b = points[(edge + 1) % n];
  const [ux, uy] = unit([b[0] - a[0], b[1] - a[1]]);
  const away = (1 - travel) * DISTANCE * from;

  return points.map((p, i) => {
    // Vertices off the base edge fold onto its nearer end.
    const j = (i - edge - 2 + n) % n;
    const onBase = j >= n - 2;
    const anchor = j < (n - 2) / 2 ? b : a;
    const placed = onBase ? p : lerp2(lerp2(anchor, p, sliver), p, unfold);
    return [placed[0] + ux * away, placed[1] + uy * away];
  });
}

// Progress (0 → 1) of something dropped under gravity onto its resting place,
// `t` seconds after release. Every arc is a gravity parabola: the approach,
// then rebounds whose size shrinks by restitution² each time. It touches 1 at
// each impact and never exceeds it.
function bounceProgress(t, { time, restitution, bounces }) {
  if (t <= 0) return 0;
  if (t < time) return (t / time) ** 2;
  t -= time;
  for (let n = 1; n <= bounces; n++) {
    const half = time * restitution ** n; // time to the top of the rebound
    if (t < 2 * half) return 1 - restitution ** (2 * n) * (1 - ((t - half) / half) ** 2);
    t -= 2 * half;
  }
  return 1;
}

// Progress (0 → 1) of a rising rod's tip, `t` seconds after it starts. It slows
// steadily on the way up, arriving at the speed its bounce needs (or at rest
// without one), so the rebounds never carry more energy than the arrival.
function riseProgress(t, { time, bounce }, length) {
  if (bounce && t >= time) {
    return 1 - (bounce.height / length) * (1 - bounceProgress(t - time + bounce.time, bounce));
  }
  const u = clamp01(t / time);
  const arrival = bounce ? ((2 * bounce.height) / bounce.time) * (time / length) : 0;
  return (2 - arrival) * u - (1 - arrival) * u * u;
}

function bezier([p0, p1, p2, p3], t) {
  const s = 1 - t;
  return [0, 1].map(k =>
    s * s * s * p0[k] + 3 * s * s * t * p1[k] + 3 * s * t * t * p2[k] + t * t * t * p3[k]);
}

// Maps distance travelled (0–1) to a Bézier parameter, so motion along the
// curve follows the easing rather than bunching up where control points do.
function arcLengthTable(curve, samples = 200) {
  const lengths = [0];
  let prev = curve[0];
  for (let i = 1; i <= samples; i++) {
    const p = bezier(curve, i / samples);
    lengths.push(lengths[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const total = lengths[samples];
  return distance => {
    const target = distance * total;
    let i = 1;
    while (i < samples && lengths[i] < target) i++;
    const span = lengths[i] - lengths[i - 1] || 1;
    return (i - 1 + (target - lengths[i - 1]) / span) / samples;
  };
}

// Points along a spiral that winds `turns` times round `centre` (clockwise on
// screen; negative turns go anticlockwise), closing in from `reach` units out
// to the resting centre `end`, its distance shrinking steadily with the angle.
function spiralPoints([ox, oy], end, { turns, reach }) {
  const finalDistance = Math.hypot(end[0] - ox, end[1] - oy);
  const finalAngle = Math.atan2(end[1] - oy, end[0] - ox);
  const steps = Math.max(60, Math.ceil(Math.abs(turns) * 240));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    const angle = finalAngle - 2 * Math.PI * turns * (1 - t);
    const distance = finalDistance + (reach - finalDistance) * (1 - t);
    return [ox + distance * Math.cos(angle), oy + distance * Math.sin(angle)];
  });
}

// The point `fraction` (0–1) of the way along a polyline, by length.
function alongRail({ points, lengths }, fraction) {
  const soFar = railSoFar(points, lengths, fraction);
  return soFar[soFar.length - 1];
}

function swoopMotion({ cx, cy, r }, { at, swoop: { duration, path, spiral, startRadius } }) {
  const curve = path && [...path, [cx, cy]];
  const paramAt = curve && arcLengthTable(curve);
  const rail = spiral && measured(spiralPoints(spiral.centre, [cx, cy], spiral));
  return elapsed => {
    const p = easeInOutCubic(clamp01((elapsed - at) / duration));
    const [x, y] = rail ? alongRail(rail, p) : bezier(curve, paramAt(p));
    // Growth is back-loaded, like something nearing the viewer; shrinking is
    // front-loaded, like something moving away.
    const size = startRadius < r ? p * p : 1 - (1 - p) * (1 - p);
    return { cx: x, cy: y, r: lerp(startRadius, r, size) };
  };
}

// Points along an ellipse from `from`, anti-clockwise on screen, to `to`. Where
// `from` and `to` are the same point, it goes all the way round.
function arcPoints({ cx, cy, rx, ry, from, to }) {
  const angleOf = ([x, y]) => Math.atan2((y - cy) / ry, (x - cx) / rx);
  const start = angleOf(from);
  let end = angleOf(to);
  if (end >= start) end -= 2 * Math.PI;
  return Array.from({ length: ARC_SEGMENTS + 1 }, (_, i) => {
    const angle = lerp(start, end, i / ARC_SEGMENTS);
    return [cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)];
  });
}

// The first `progress` (0–1) of an arc's points.
function arcSoFar(points, progress) {
  const reached = progress * ARC_SEGMENTS;
  const i = Math.floor(reached);
  const soFar = points.slice(0, i + 1);
  if (i < ARC_SEGMENTS) soFar.push(lerp2(points[i], points[i + 1], reached - i));
  return soFar;
}

// Progress along a line with surges in pace. Its rate is 1 + SURGE·cos(…),
// which stays positive, so the head never stalls or backs up.
function headProgress(u) {
  const w = 2 * Math.PI * HEAD_PULSES;
  return u + (HEAD_SURGE * Math.sin(w * u)) / w;
}

const smoothstep = t => t * t * (3 - 2 * t);

function drawLine(shapes, line, sinceStart, draw) {
  const u = clamp01(sinceStart / draw);
  const p = headProgress(easeInOutCubic(u));
  const tip = lerp2(line.from, line.to, p);

  setLine(shapes[line.id], line.from, tip);
  shapes[line.id].style.visibility = u > 0 ? '' : 'hidden';

  // Strength builds with distance from the start and fades over the last
  // stretch, so the head grows out of and settles back into the line.
  const total = Math.hypot(line.to[0] - line.from[0], line.to[1] - line.from[1]);
  const travelled = p * total;
  const strength = smoothstep(clamp01(travelled / HEAD_GROW))
    * (1 - smoothstep(clamp01((p - (1 - HEAD_SPEND)) / HEAD_SPEND)));

  setHead(shapes[`${line.id}-head`], {
    tip,
    dir: unit([line.to[0] - line.from[0], line.to[1] - line.from[1]]),
    width: HEAD_WIDTH * strength,
    length: Math.min(HEAD_TAPER * strength, travelled),
  });
}

// ---------------------------------------------------------------------------
// Radial sweeps and ricochets

// Returns where the sweeping line has reached `progress` (0–1) of the way round:
// `tip` on the arc, and `foot` on the chord. The centre lies on the far side of
// the chord from the arc, so a radius always crosses it.
function radialMotion({ from, to, r }, { pivot }) {
  const middle = lerp2(from, to, 0.5);
  const half = Math.hypot(to[0] - from[0], to[1] - from[1]) / 2;
  const along = unit(sub(to, from));
  const bulge = [along[1], -along[0]];
  const drop = Math.sqrt(r * r - half * half); // from the chord back to the centre
  const centre = [middle[0] - bulge[0] * drop, middle[1] - bulge[1] * drop];
  const start = Math.atan2(from[1] - centre[1], from[0] - centre[0]);
  const turn = 2 * Math.asin(half / r);

  if (pivot === 'chord') {
    const startFromChord = Math.atan2(from[1] - middle[1], from[0] - middle[0]);
    return progress => {
      const angle = startFromChord + Math.PI * progress;
      const d = [Math.cos(angle), Math.sin(angle)];
      const rise = drop * (d[0] * bulge[0] + d[1] * bulge[1]); // towards the arc, from the centre's view
      const reach = -rise + Math.sqrt(rise * rise + half * half);
      return { tip: [middle[0] + d[0] * reach, middle[1] + d[1] * reach], foot: middle };
    };
  }

  return progress => {
    const angle = start + turn * progress;
    const d = [Math.cos(angle), Math.sin(angle)];
    const toChord = drop / (d[0] * bulge[0] + d[1] * bulge[1]);
    return {
      tip: [centre[0] + d[0] * r, centre[1] + d[1] * r],
      foot: [centre[0] + d[0] * toChord, centre[1] + d[1] * toChord],
    };
  };
}

// Points along an SVG elliptical arc from `p1` to `p2`, converted from the
// path's endpoint form to its centre form (SVG spec, appendix B.2.4).
function svgArcPoints(p1, p2, rx, ry, rotation, large, sweep, count = ARC_SEGMENTS) {
  const phi = (rotation * Math.PI) / 180;
  const [c, s] = [Math.cos(phi), Math.sin(phi)];
  const [dx, dy] = [(p1[0] - p2[0]) / 2, (p1[1] - p2[1]) / 2];
  const [x1, y1] = [c * dx + s * dy, -s * dx + c * dy];
  const scale = Math.sqrt(Math.max(1, (x1 * x1) / (rx * rx) + (y1 * y1) / (ry * ry)));
  rx *= scale;
  ry *= scale;
  const num = rx * rx * ry * ry - rx * rx * y1 * y1 - ry * ry * x1 * x1;
  let k = Math.sqrt(Math.max(0, num / (rx * rx * y1 * y1 + ry * ry * x1 * x1)));
  if (large === sweep) k = -k;
  const [cx1, cy1] = [(k * rx * y1) / ry, (-k * ry * x1) / rx];
  const centre = [c * cx1 - s * cy1 + (p1[0] + p2[0]) / 2, s * cx1 + c * cy1 + (p1[1] + p2[1]) / 2];
  const angle = (u, v) => Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]);
  const from = [(x1 - cx1) / rx, (y1 - cy1) / ry];
  const start = angle([1, 0], from);
  let turn = angle(from, [(-x1 - cx1) / rx, (-y1 - cy1) / ry]);
  if (!sweep && turn > 0) turn -= 2 * Math.PI;
  if (sweep && turn < 0) turn += 2 * Math.PI;
  return Array.from({ length: count + 1 }, (_, i) => {
    if (i === 0) return p1;
    if (i === count) return p2;
    const t = start + (turn * i) / count;
    const [ex, ey] = [rx * Math.cos(t), ry * Math.sin(t)];
    return [centre[0] + c * ex - s * ey, centre[1] + s * ex + c * ey];
  });
}

// The first `fraction` (0–1) of a polyline, by length.
function railSoFar(points, lengths, fraction) {
  const target = fraction * lengths[lengths.length - 1];
  let i = 1;
  while (i < lengths.length - 1 && lengths[i] < target) i++;
  const span = lengths[i] - lengths[i - 1] || 1;
  return [...points.slice(0, i), lerp2(points[i - 1], points[i], clamp01((target - lengths[i - 1]) / span))];
}

// Splits path data made of one M, then L and A commands, ending in Z, into its
// start point and segments.
function pathSegments(path) {
  const tokens = path.match(/[MLAZ]|-?\d*\.?\d+(?:e-?\d+)?/gi);
  const segments = [];
  let start = null;
  for (let i = 0; i < tokens.length;) {
    const command = tokens[i++].toUpperCase();
    const take = k => tokens.slice(i, (i += k)).map(Number);
    if (command === 'M') start = take(2);
    else if (command === 'L') segments.push({ to: take(2) });
    else if (command === 'A') {
      const [rx, ry, rotation, large, sweep, x, y] = take(7);
      segments.push({ arc: [rx, ry, rotation, large, sweep], to: [x, y] });
    }
  }
  return { start, segments };
}

// A polyline with the running length at each of its points.
function measured(points) {
  const lengths = [0];
  for (let i = 1; i < points.length; i++) {
    lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
  }
  return { points, lengths };
}

// A rail along a path segment, from `from` to the segment's end.
const rail = (from, { arc, to }) => measured(arc ? svgArcPoints(from, to, ...arc) : [from, to]);

const reversed = ({ points }) => measured([...points].reverse());

// Returns a crescent's outline at `progress` (0–1) of its hoist, as path data.
function hoistMotion(path) {
  const { start: a, segments } = pathSegments(path);
  if (segments.length !== 3 || !segments[1].arc || !segments[2].arc) {
    throw new Error('A hoist needs a path of the form M a L b A … c A … a Z, or M a A … b A … c A … a Z');
  }
  const [edge, toPoint, back] = segments;
  const b = edge.to;
  const rails = [
    reversed(rail(b, toPoint)), // c back up to b
    rail(toPoint.to, back), // c up to a
  ];
  // The rising edge runs from the end on b's rail to the end on a's: the third
  // edge travelled backwards, so an arc turns the other way.
  const rising = edge.arc && (([rx, ry, rotation, , sweep]) => `A${rx} ${ry} ${rotation} 0 ${1 - sweep} `)(edge.arc);
  return progress => {
    if (progress >= 1) return path;
    const [one, two] = rails.map(({ points, lengths }) => railSoFar(points, lengths, progress));
    const line = ps => ps.map(p => p.join(' ')).join('L');
    const across = rising ? `${rising}${two[two.length - 1].join(' ')}L` : 'L';
    return `M${line(one)}${across}${line(two.reverse())}Z`;
  };
}

// Returns a lune's outline at `progress` (0–1) of its draw, as path data.
function luneMotion(path) {
  const { start: a, segments } = pathSegments(path);
  if (segments.length !== 2 || !segments.every(s => s.arc)) {
    throw new Error('A lune needs a path of the form M a A … b A … a Z');
  }
  const rails = [rail(a, segments[0]), reversed(rail(segments[0].to, segments[1]))]; // both from a to b
  return progress => {
    if (progress >= 1) return path;
    const [one, two] = rails.map(({ points, lengths }) => railSoFar(points, lengths, progress));
    return `M${[...one, ...two.reverse()].map(p => p.join(' ')).join('L')}Z`;
  };
}

// Returns the strip's outline `t` seconds after it starts, or null before then.
function ricochetMotion(points, { time, keep }) {
  const [, farInner, inner, nearInner, nearOuter, outer] = points;
  const near = lerp2(nearInner, nearOuter, 0.5);
  const inward = unit(sub(inner, nearInner));
  const onward = unit(sub(farInner, inner));
  const width = Math.abs(cross(sub(outer, inner), inward));
  const across = (([x, y]) => (x * (inner[0] - outer[0]) + y * (inner[1] - outer[1]) > 0 ? [x, y] : [-x, -y]))([-inward[1], inward[0]]);
  const step = ([x, y], [dx, dy], d) => [x + dx * d, y + dy * d];

  // The head fills the corner square by reaching the line through the outer
  // corner, then carries on up the other arm with the speed it has left.
  const nearArm = (outer[0] - near[0]) * inward[0] + (outer[1] - near[1]) * inward[1];
  const farArm = Math.hypot(farInner[0] - inner[0], farInner[1] - inner[1]);
  const speed = (nearArm + (2 * farArm) / keep) / time; // braking covers its distance at half speed
  const corner = nearArm / speed;

  return t => {
    if (t <= 0) return null;
    if (t >= time) return points;
    if (t < corner) {
      const head = step(near, inward, speed * t);
      return [nearInner, nearOuter, step(head, across, -width / 2), step(head, across, width / 2)];
    }
    const d = farArm * (1 - (1 - (t - corner) / (time - corner)) ** 2);
    return [nearInner, nearOuter, outer, step(outer, onward, d + width), step(inner, onward, d), inner];
  };
}

// ---------------------------------------------------------------------------
// Playback

// Prepares `scene`'s animation on the shapes returned by render().
export function createAnimation({ viewBox, planes, lines, entrances, lineTiming }, shapes) {
  const planesWith = key => planes.filter(plane => entrances[plane.id]?.[key]);

  // Circles with a painted outline (an overlap plane with `outline`) change
  // size by scaling, so the outline grows and shrinks with them rather than
  // staying its full width round a speck.
  const outlined = new Set(planes.filter(plane => plane.outline).map(plane => plane.of));
  const setScaled = (shape, rest, { cx, cy, r }) => {
    const s = r / rest.r;
    shape.setAttribute('transform', `translate(${cx} ${cy}) scale(${s}) translate(${-rest.cx} ${-rest.cy})`);
  };

  const shadowsOf = id => planes.filter(plane => entrances[plane.id]?.shadowOf === id).map(plane => plane.points);
  const beams = Object.fromEntries(planesWith('beam')
    .map(plane => [plane.id, beamGeometry(plane.points, entrances[plane.id].beam, viewBox, shadowsOf(plane.id))]));
  const sweeps = Object.fromEntries(planesWith('sweep')
    .map(plane => [plane.id, sweepMotion(plane.points, entrances[plane.id].edge)]));
  const swoops = Object.fromEntries(planesWith('swoop')
    .map(plane => [plane.id, swoopMotion(plane.circle, entrances[plane.id])]));
  const arcs = Object.fromEntries(planesWith('draw').map(plane => [plane.id, arcPoints(plane.arc)]));
  const radials = Object.fromEntries(planesWith('radial').filter(plane => plane.segment)
    .map(plane => [plane.id, radialMotion(plane.segment, entrances[plane.id].radial)]));
  const hoists = Object.fromEntries(planesWith('hoist').map(plane => [plane.id, hoistMotion(plane.path)]));
  const lunes = Object.fromEntries(planesWith('lune').map(plane => [plane.id, luneMotion(plane.path)]));

  // Where a lifted circle is `elapsed` seconds into the piece.
  const circles = Object.fromEntries(planes.filter(plane => plane.circle).map(plane => [plane.id, plane.circle]));
  function liftAt(id, elapsed) {
    const { at, lift: { from, time } } = entrances[id];
    const { cx, cy, r } = circles[id];
    const away = (1 - clamp01((elapsed - at) / time)) ** 3;
    return { cx: cx + (from[0] - cx) * away, cy: cy + (from[1] - cy) * away, r };
  }
  const ricochets = Object.fromEntries(planesWith('ricochet')
    .map(plane => [plane.id, ricochetMotion(plane.points, entrances[plane.id].ricochet)]));
  const cuts = Object.fromEntries(planesWith('cut').map(plane => {
    const segments = strokeSegments(plane.stroke);
    const { head = 2.5 } = entrances[plane.id].cut;
    return [plane.id, { segments, distance: cutMotion(segments, entrances[plane.id].cut), head: head * plane.stroke.width }];
  }));
  const rolls = Object.fromEntries(planesWith('roll')
    .map(plane => [plane.id, rollMotion(viewBox, entrances[plane.id].roll)]));

  function naturalEnd(id, e) {
    if (e.shadowOf) return naturalEnd(e.shadowOf, entrances[e.shadowOf]);
    if (e.bounce) return e.at + bounceDuration(e.bounce);
    if (e.fold) return e.at + e.fold.time;
    if (e.beam) return beamEnd(e.at, beams[id]);
    if (e.swoop) return e.at + e.swoop.duration;
    if (e.draw) return e.at + e.draw.time;
    if (e.rise) return e.at + e.rise.time + (e.rise.bounce ? bounceDuration(e.rise.bounce) - e.rise.bounce.time : 0);
    if (e.radial) return e.at + (e.radial.bounce ? bounceDuration({ time: e.radial.time, ...e.radial.bounce }) : e.radial.time);
    if (e.ricochet) return e.at + e.ricochet.time;
    if (e.hoist) return e.at + e.hoist.time;
    if (e.lune) return e.at + e.lune.time;
    if (e.lift) return e.at + e.lift.time;
    if (e.cut) return e.at + e.cut.time;
    if (e.roll) return e.at + e.roll.time;
    if (e.mirrorOf) return naturalEnd(e.mirrorOf, entrances[e.mirrorOf]);
    return e.at + TRAVEL * UNFOLD_AT + (e.sweep ?? UNFOLD);
  }

  // Any entrance can also be shifted (its `at`) and stretched in time about
  // its start (`stretch`: 2 takes twice as long), so a single shape can be
  // retimed without touching its own settings. A shadow or mirror image keeps
  // to its caster's timing.
  const casterOf = e => (e.shadowOf ? casterOf(entrances[e.shadowOf]) : e.mirrorOf ? casterOf(entrances[e.mirrorOf]) : e);
  const startOf = e => casterOf(e).at;
  const stretchOf = e => casterOf(e).stretch ?? 1;
  function entranceEnd(id, e) {
    const start = startOf(e);
    return start + (naturalEnd(id, e) - start) * stretchOf(e);
  }
  const localTime = (e, now) => {
    const start = startOf(e);
    return start + (now - start) / stretchOf(e);
  };

  // Each line can have its own `at` and `draw`; otherwise they follow
  // `lineTiming`, one after another.
  const lineSpan = (line, i) => {
    const at = line.at ?? lineTiming.at + i * lineTiming.stagger;
    return [at, at + (line.draw ?? lineTiming.draw)];
  };

  const duration = Math.max(
    ...Object.entries(entrances).map(([id, e]) => entranceEnd(id, e)),
    ...lines.map((line, i) => lineSpan(line, i)[1]),
    0,
  );

  function frame(now) {
    for (const plane of planes) {
      const entrance = entrances[plane.id];
      if (!entrance) continue; // fixed geometry, or an overlap that follows other planes
      const elapsed = localTime(entrance, now);
      if (entrance.cut) {
        const { segments, distance, head } = cuts[plane.id];
        const t = elapsed - entrance.at;
        if (t > 0) shapes[plane.id].setAttribute('d', cutOutline(segments, distance(t), head));
        shapes[plane.id].style.visibility = t > 0 ? '' : 'hidden';
        continue;
      }
      if (entrance.roll) {
        setPoints(shapes[`${plane.id}-clip`], rolls[plane.id](elapsed - entrance.at));
        continue;
      }
      if (entrance.lift) {
        setCircle(shapes[plane.id], liftAt(plane.id, elapsed));
        continue;
      }
      if (entrance.mirrorOf) {
        const { cx, cy } = entrances[entrance.mirrorOf].lift
          ? liftAt(entrance.mirrorOf, elapsed) : circles[entrance.mirrorOf];
        setCircle(shapes[plane.id], { cx, cy: 2 * entrance.axis - cy, r: plane.circle.r });
        continue;
      }
      if (entrance.lune) {
        const t = elapsed - entrance.at;
        shapes[plane.id].setAttribute('d', lunes[plane.id](easeInOutCubic(clamp01(t / entrance.lune.time))));
        shapes[plane.id].style.visibility = t > 0 ? '' : 'hidden';
        continue;
      }
      if (entrance.shadowOf) {
        drawBeam(shapes, plane, beams[entrance.shadowOf], entrances[entrance.shadowOf].at, elapsed);
        continue;
      }
      if (entrance.swoop) {
        const at = swoops[plane.id](elapsed);
        if (outlined.has(plane.id)) setScaled(shapes[plane.id], plane.circle, at);
        else setCircle(shapes[plane.id], at);
        shapes[plane.id].style.visibility = elapsed < entrance.at ? 'hidden' : '';
        continue;
      }
      if (entrance.draw) {
        const u = clamp01((elapsed - entrance.at) / entrance.draw.time);
        setCurve(shapes[plane.id], arcSoFar(arcs[plane.id], easeInOutCubic(u)));
        // A full circle, once drawn, rests as an exact closed ellipse, so no
        // seam shows where its ends meet and no facets show along its edges.
        if (u >= 1 && plane.arc.from.every((v, k) => v === plane.arc.to[k])) {
          const { cx, cy, rx, ry } = plane.arc;
          shapes[plane.id].setAttribute('d', `M${cx + rx} ${cy}A${rx} ${ry} 0 1 0 ${cx - rx} ${cy}A${rx} ${ry} 0 1 0 ${cx + rx} ${cy}Z`);
        }
        shapes[plane.id].style.visibility = elapsed < entrance.at ? 'hidden' : '';
        continue;
      }
      if (entrance.rise) {
        const { from, to } = plane.rod;
        const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
        setLine(shapes[plane.id], from, lerp2(from, to, riseProgress(elapsed - entrance.at, entrance.rise, length)));
        shapes[plane.id].style.visibility = elapsed < entrance.at ? 'hidden' : '';
        continue;
      }
      if (entrance.beam) {
        drawBeam(shapes, plane, beams[plane.id], entrance.at, elapsed);
        continue;
      }
      if (entrance.hoist) {
        const t = elapsed - entrance.at;
        shapes[plane.id].setAttribute('d', hoists[plane.id](easeInOutCubic(clamp01(t / entrance.hoist.time))));
        shapes[plane.id].style.visibility = t > 0 ? '' : 'hidden';
        continue;
      }
      if (entrance.radial) {
        const t = elapsed - entrance.at;
        const { time, bounce } = entrance.radial;
        const progress = bounce ? bounceProgress(t, { time, ...bounce }) : easeInSweep(clamp01(t / time));
        const { from, to, r } = plane.segment;
        if (progress >= 1) {
          setSegment(shapes[plane.id], from, to, r);
        } else if (t > 0) {
          const { tip, foot } = radials[plane.id](progress);
          setSegment(shapes[plane.id], from, tip, r, foot);
        }
        shapes[plane.id].style.visibility = t > 0 ? '' : 'hidden';
        continue;
      }
      if (entrance.ricochet) {
        const outline = ricochets[plane.id](elapsed - entrance.at);
        if (outline) setPoints(shapes[plane.id], outline);
        shapes[plane.id].style.visibility = outline ? '' : 'hidden';
        continue;
      }
      const { travel, unfold } = entrance.bounce
        ? { travel: 1, unfold: bounceProgress(elapsed - entrance.at, entrance.bounce) }
        : entrance.fold
          ? { travel: 1, unfold: easeOutCubic(clamp01((elapsed - entrance.at) / entrance.fold.time)) }
          : phases(elapsed, entrance, sweeps[plane.id]);
      setPoints(shapes[plane.id], polygonAt(plane.points, entrance, travel, unfold));
    }

    lines.forEach((line, i) => {
      const [at, end] = lineSpan(line, i);
      drawLine(shapes, line, now - at, end - at);
    });
  }

  let running = null;

  // Stops any run in progress and shows the animation at `time` seconds.
  function seek(time) {
    if (running) cancelAnimationFrame(running);
    running = null;
    frame(Math.min(Math.max(time, 0), duration));
  }

  // Plays the animation, starting `from` seconds in. Restarting cancels any run
  // in progress. `onFrame(time)` is called after every frame drawn.
  function play({ from = 0, onFrame = () => {} } = {}) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) from = duration;

    seek(from);
    onFrame(from);
    if (from >= duration) return;

    const start = performance.now() - from * 1000;
    const tick = now => {
      const elapsed = Math.min((now - start) / 1000, duration);
      frame(elapsed);
      running = elapsed < duration ? requestAnimationFrame(tick) : null;
      onFrame(elapsed);
    };
    running = requestAnimationFrame(tick);
  }

  // When each plane and line is in motion: id → [start, end] in seconds. A
  // shadow or mirror image moves exactly when its caster does.
  const spans = {
    ...Object.fromEntries(Object.entries(entrances).map(([id, e]) => [id, [startOf(e), entranceEnd(id, e)]])),
    ...Object.fromEntries(lines.map((line, i) => [line.id, lineSpan(line, i)])),
  };

  return { duration, spans, seek, play, isPlaying: () => running !== null };
}
