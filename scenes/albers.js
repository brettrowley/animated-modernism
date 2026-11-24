// Josef Albers, Multiplex A (woodcut, 1947), references/albers.jpg. The trace
// is references/albers.svg, generated from this file by
// references/make-albers-svg.mjs.
//
// A woodcut, not a painting: the inked block is black, with the plank's grain
// showing through as fine pale streaks, and the figure is cut out of it, so its
// lines are the bare paper. There are no planes and no overlap colours, only
// three flat colours and a texture. The lines are strokes (engine/strokes.js),
// cut exactly where they meet; the grain is generated (engine/grain.js).
//
// The construction (rule 1.1): the block is 8 columns wide, and every vertical
// line stands on a column. Every other line has one of two slopes, a shallow
// one rising to the right and a steep one falling to the right, so the figure
// is drawn in an oblique projection. The whole figure is symmetric under a half
// turn about the block's centre, O, except one line: the top edge of the tall
// central panel is thick, and its partner at the bottom is thin. O is where the
// thick central vertical crosses the thin zigzag's middle stroke.

const W = 561;
const H = 851; // the printed block, without the paper margin
const S = W / 8; // one column
const O = [W / 2, H / 2];
const x = column => column * S;

const SHALLOW = Math.tan(Math.PI / 12) * S; // the shallow slope's rise across one column: 15°
const STEEP = 0.75 * S; // the steep slope's fall across one column: 3 in 4

// Heights measured from O, everything else follows from the slopes. The thin
// wings are sized so the left wing's lower edge ends exactly where the thick
// diagonal crosses the left long vertical, as in the print.
const RIBBON = 178.75; // O to the thick ribbon's corners on columns 1 and 5
const SPINE = 213.75; // O to each end of the thick central vertical
const WING = RIBBON + STEEP + 2 * SHALLOW; // O to the wings' outer corners

const THICK = 6.4;
const THIN = 2.5;

// The thick ribbon, B round to I, and the central panel's other corners, A and J.
const B = [x(3), O[1] - RIBBON - 3 * STEEP];
const A = [x(5), B[1] - 2 * SHALLOW];
const C = [x(6), O[1] - RIBBON];
const D = [x(6), O[1] + SPINE - 2 * SHALLOW];
const E = [x(4), O[1] + SPINE];
const F = [x(4), O[1] - SPINE];
const G = [x(2), O[1] - SPINE + 2 * SHALLOW];
const Hc = [x(2), O[1] + RIBBON];
const I = [x(5), O[1] + RIBBON + 3 * STEEP];
const J = [x(3), I[1] + 2 * SHALLOW];

// The thin line through the middle: the left wing, the zigzag, the right wing.
const P = [
  [x(3), O[1] + WING - 2 * SHALLOW], // on the left long vertical, where the thick diagonal crosses it
  [x(1), O[1] + WING], // the left wing's outer corners
  [x(1), O[1] + SHALLOW - 2 * STEEP],
  [x(3), O[1] - SHALLOW - 2 * STEEP], // the zigzag's corners, on the long verticals
  [x(5), O[1] - SHALLOW],
  [x(3), O[1] + SHALLOW],
  [x(5), O[1] + SHALLOW + 2 * STEEP],
  [x(7), O[1] - SHALLOW + 2 * STEEP], // the right wing's outer corners
  [x(7), O[1] - WING],
  [x(5), O[1] - WING + 2 * SHALLOW], // on the right long vertical, where the thick diagonal crosses it
];

const unit = ([dx, dy]) => [dx / Math.hypot(dx, dy), dy / Math.hypot(dx, dy)];
const towards = (p, q) => unit([q[0] - p[0], q[1] - p[1]]);
// The mitre where a line arriving along p→q turns along q→r, shared by two strokes.
const mitre = (p, q, r, extend = 0.3) => {
  const [a, b] = [towards(p, q), towards(q, r)];
  return { dir: unit([b[0] - a[0], b[1] - a[1]]), at: q, extend };
};
const DOWN = [0, 1];
// Flush with the right edge of the right long vertical, where the thick lines end on it.
const onRightEdge = point => ({ dir: DOWN, at: [point[0] + THIN / 2, point[1]] });
const meeting = { extend: 0.4 }; // two strokes meeting end to end, square
const onVertical = { dir: DOWN }; // a thin line stopping on a long vertical

const PAPER = '#E9DEC2';
const INK = '#111113';

// Shared settings, so the lines move in one world (rule 3.30).
const cut = (time, keep = 0.8) => ({ cut: { time, keep } });

export default {
  title: 'Albers',
  label: 'Reconstruction of a woodcut by Josef Albers',

  viewBox: { width: W, height: H },
  ground: PAPER,

  planes: [
    {
      id: 'block',
      points: [[0, 0], [W, 0], [W, H], [0, H]],
      fill: INK,
      // Measured from the print: fibres about 3 units apart, drifting up to the
      // right by about 1 in 30, broken into dashes; the paper shows through
      // about 18% of the block, more at the top and towards the right.
      grain: {
        colour: '#D6D0C2',
        seed: 1947,
        pitch: [2.0, 0.7],
        tilt: -1 / 30,
        wave: [[4.5, 520, 380], [2.2, 210, 700], [6, 1100, 600]],
        dash: [14, 1.1],
        gap: [9, 1.1],
        density: [
          [1.07, 1.12, 1.27, 1.11],
          [0.90, 1.07, 1.13, 0.93],
          [0.84, 0.95, 1.04, 0.91],
          [0.67, 0.84, 0.98, 1.00],
          [0.75, 0.95, 1.12, 1.07],
          [0.98, 1.03, 1.14, 1.06],
        ],
        tiers: [[0.5, 0.4], [0.75, 0.6], [1.05, 0.85]],
      },
    },

    // Thin lines. The central panel's long verticals and its bottom edge.
    { id: 'spine-left', fill: PAPER, stroke: { points: [B, J], width: THIN, end: mitre(B, J, I) } },
    { id: 'spine-right', fill: PAPER, stroke: { points: [I, A], width: THIN } },
    { id: 'foot', fill: PAPER, stroke: { points: [J, I], width: THIN, start: mitre(B, J, I), end: onRightEdge(I) } },
    // The line through the middle, as two halves from O, each a half turn of the other.
    {
      id: 'thin-left',
      fill: PAPER,
      stroke: { points: [O, P[4], P[3], P[2], P[1], P[0]], width: THIN, start: meeting, joins: [onVertical, onVertical], end: onVertical },
    },
    {
      id: 'thin-right',
      fill: PAPER,
      stroke: { points: [O, P[5], P[6], P[7], P[8], P[9]], width: THIN, start: meeting, joins: [onVertical, onVertical], end: onVertical },
    },

    // Thick lines, over the thin. The central panel's top edge, and the ribbon
    // in two halves, from B and I in to O.
    { id: 'head', fill: PAPER, stroke: { points: [A, B], width: THICK, start: onRightEdge(A), end: mitre(A, B, C) } },
    { id: 'ribbon-top', fill: PAPER, stroke: { points: [B, C, D, E, O], width: THICK, start: mitre(A, B, C), end: meeting } },
    { id: 'ribbon-bottom', fill: PAPER, stroke: { points: [I, Hc, G, F, O], width: THICK, start: onRightEdge(I), end: meeting } },
  ],

  lines: [],

  // The physical story is the making of a woodcut. The block is inked first:
  // the roller sweeps the ink and its grain across the bare paper, alone for
  // the first half second. Then the figure is cut out of it, line by line, each
  // cut thrown along its line with a gouge's point leading, glancing off each
  // corner and braking to a stop.
  //
  // The cuts follow the half-turn symmetry: every line moves against its
  // partner. The long verticals go first, from B down and from I up. Each is
  // followed round its corner by the panel's short edge (the thin foot to I,
  // the thick head to B), and from B and I the thick ribbon is cut in two
  // halves that meet at O, last. The thin line through the middle grows out
  // of O in both directions at once, through the zigzag and out round the
  // wings, while the panel closes. So the figure opens from its centre and
  // closes on it.
  entrances: {
    'block':         { at: 0,    roll: { time: 1.15, ragged: 18, row: 3, seed: 7 } },

    'spine-left':    { at: 0.5,  ...cut(0.8) },
    'spine-right':   { at: 0.58, ...cut(0.8) },

    'thin-left':     { at: 0.95, ...cut(1.6) },
    'thin-right':    { at: 0.95, ...cut(1.6) },

    'foot':          { at: 1.22, ...cut(0.45) },
    'head':          { at: 1.3,  ...cut(0.45) },

    'ribbon-bottom': { at: 1.5,  ...cut(1.65) },
    'ribbon-top':    { at: 1.58, ...cut(1.65) },
  },
};
