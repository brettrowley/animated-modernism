// Wassily Kandinsky, Circles in a Circle (1923), references/kandinsky1.jpeg.
// The trace is references/kandinsky1.svg, generated from this file by
// references/make-kandinsky1-svg.mjs.
//
// The construction (rule 1.1): two tapering bands cross behind everything, a
// black ring frames the middle, and inside it 23 circles and 28 straight
// lines float over the bands. The bands are not strips but wedges, each the
// beam of a light whose source sits off the canvas: the teal one fans out
// down to the right from a point above and left of the canvas, the tan one
// down to the left from a point above and right of it. The circles were drawn
// with a compass, so they fit their edges within about 1px; two pairs are
// concentric (the orange disc and its black eye; the red disc at the left and
// its black ring), and those two pairs' centres sit on one horizontal. The
// lines come in three weights and a heavy post; parallel families share one
// angle (three near-verticals on the right, the three-line hatch at bottom
// right, the two short horizontals on the post).
//
// Colour (rules 1.4 and 1.7): Kandinsky paints his overlaps as if the circles
// were transparent, but chooses each overlap's colour rather than mixing it.
// Pink over the teal band turns a rich purple, not a darker pink, and yellow
// over the tan band is lighter than the tan, which no glass can do. So every
// shape has a flat `fill`, and every overlap whose colour differs from what
// would show anyway is an overlap plane: one shape drawn in its own colour,
// clipped by the others it lies within. Each colour is the median of the
// painting inside that region, away from edges and lines. Overlaps follow
// their shapes as they move, so every crossing in motion recolours as it
// would at rest. Black (the ring, the lines, the outlines and the dark discs)
// is opaque and on top.
//
// `planes` run bottom to top, which is also the drawing order. See
// engine/render.js for the details, and engine/motion.js for the settings in
// `entrances`.

const W = 1458;
const H = 1500;

const INK = '#1F1F21';

// A band is the wedge between two lines, each given as x = a + b·y. Its
// polygon runs from the top of the first edge to the top of the second,
// down the second and back up the first, well past the canvas at both ends.
const TOP = -40;
const BOTTOM = H + 40;
const edge = ([a, b], y) => [Math.round((a + b * y) * 10) / 10, y];
const wedge = (first, second) => [edge(first, TOP), edge(second, TOP), edge(second, BOTTOM), edge(first, BOTTOM)];

// The teal band's lower-left and upper-right edges; they meet at (-446, -864).
const TEAL_SW = [267.24, 0.826];
const TEAL_NE = [497.65, 1.0927];
// The tan band's upper-left and lower-right edges; they meet at (1779, -353).
const TAN_NW = [1349.16, -1.2186];
const TAN_SE = [1464.38, -0.8918];

// The two concentric pairs share a horizontal.
const EYES = 679.5;

// Circles: centre, radius to the outer edge, and the width of the black
// outline painted inside that edge (0: none). Bottom to top.
const CIRCLES = {
  yellowLeft:  [575.1, 813.4, 169.5, 0], // threaded on long-a
  olive:       [694.5, 783, 214.5, 0],
  tealGreen:   [983, 681, 172.9, 0],
  pink:        [565.3, 443.3, 150.4, 3],
  grey:        [566.3, 596.1, 84.6, 2],
  redBig:      [753, 512.1, 121.2, 0],
  purple:      [1000.8, 404.7, 88, 0],
  yellowBR:    [931, 910.6, 116.7, 2.8],
  blueRight:   [1126.3, 698.4, 66.4, 3],
  redBL:       [534.1, 956.4, 68.3, 4.8],
  orange:      [677.8, EYES, 83, 9.1],
  tealSmall:   [410.6, 859.9, 58.1, 7.5],
  salmon:      [324.6, 1054.7, 43.6, 2.3],
  pinkBottom:  [804.9, 1187.1, 40.8, 4.3],
  mauve:       [1141, 1050.1, 31.3, 4],
  redMid:      [744.1, 872.2, 22.1, 0],
  redTop:      [678.1, 197.7, 18.5, 4.5],
  yellowSmall: [873.3, 1078.9, 19.3, 1.8],
  redSmall:    [706.1, 1018.1, 15.2, 3], // threaded on long-g
  redLeft:     [307.6, EYES, 47, 16.9], // a red disc in a wide black ring
  blueDot:     [232.9, 844.9, 21.8, 7.8], // a blue disc in a black ring
};

// The opaque black discs, over the colours.
const DISCS = {
  blackTop:   [891.2, 469.4, 47.5], // threaded on long-b
  blackTeal:  [1001.2, 593.4, 32.65], // threaded on fall-a
  blackBR:    [996.2, 984.8, 32.65],
  blackSmall: [607.4, 1053.8, 10.9],
  eye:        [677.8, EYES, 20.2], // the orange disc's centre
};

// Each circle's own colour: where it lies alone on the ground, or, if it never
// does, the region it covers most.
const FILL = {
  teal: '#6A9082',
  tan: '#C6AF7A',
  yellowLeft: '#DCC661',
  olive: '#464A39',
  tealGreen: '#3F6B5B',
  pink: '#D7ACAC',
  grey: '#809783',
  redBig: '#5F2525',
  purple: '#815B63',
  yellowBR: '#D8C366',
  blueRight: '#182627',
  redBL: '#A22025',
  orange: '#B95B3A',
  tealSmall: '#71957A',
  salmon: '#B0664B',
  pinkBottom: '#B47E77',
  mauve: '#A45F69',
  redMid: '#521D20',
  redTop: '#912228',
  yellowSmall: '#D1AF60',
  redSmall: '#C0524A',
  redLeft: '#B21C29',
  blueDot: '#364972',
};

// Overlap colours, fewest shapes first, so a three-way overlap is drawn over
// the pairs it contains. Each is drawn just after its topmost shape (see
// `planes`). Regions whose colour is already within about 16 of what would
// show without a plane of their own are left out.
const OVERLAPS = [
  [['teal', 'tan'], '#646751'],
  [['tan', 'yellowLeft'], '#8E7336'],
  [['olive', 'tealGreen'], '#4A4D2E'],
  [['teal', 'pink'], '#7D4150'],
  [['pink', 'grey'], '#7B836D'],
  [['olive', 'grey'], '#323931'],
  [['pink', 'redBig'], '#A8212E'],
  [['tan', 'redBig'], '#901923'],
  [['tan', 'purple'], '#634250'],
  [['tealGreen', 'yellowBR'], '#8B944F'],
  [['olive', 'yellowBR'], '#6D7546'],
  [['teal', 'yellowBR'], '#66886B'],
  [['teal', 'blueRight'], '#36616A'],
  [['tan', 'redBL'], '#A9443E'],
  [['teal', 'mauve'], '#6A3F48'],
  [['tan', 'yellowLeft', 'olive'], '#575732'],
  [['teal', 'tan', 'tealGreen'], '#273E34'],
  [['teal', 'tan', 'redBig'], '#5F2525'],
  [['tan', 'olive', 'redBig'], '#501C1F'],
  [['teal', 'tan', 'purple'], '#3A2B30'],
  [['teal', 'tealGreen', 'yellowBR'], '#335448'],
  [['teal', 'tealGreen', 'blueRight'], '#182627'],
  [['tan', 'yellowLeft', 'redBL'], '#A22025'],
  [['tan', 'yellowLeft', 'tealSmall'], '#6A8C69'],
  [['teal', 'tan', 'olive', 'tealGreen'], '#4D4F2F'],
  [['tan', 'yellowLeft', 'olive', 'grey'], '#383F2A'],
  [['teal', 'tan', 'tealGreen', 'redBig'], '#462E29'],
  [['tan', 'yellowLeft', 'olive', 'redBL'], '#562221'],
  [['tan', 'yellowLeft', 'olive', 'orange'], '#AC352A'],
];

// Line weights: heavy, medium and thin strokes, and the heavy post on the right.
const HEAVY = 4.5;
const MID = 3;
const THIN = 2;
const POST = 6;

// Straight lines, from one end to the other. Square ends, as painted.
const LINES = {
  // The long lines that cross the whole middle.
  'long-a':     [[185.6, 735.5], [1235.9, 945.5], HEAVY],
  'long-b':     [[1218, 523.5], [333.8, 377], HEAVY],
  'long-c':     [[1157.1, 970.4], [263.2, 866.5], THIN],
  'long-d':     [[209.1, 593.3], [1183.8, 853.8], THIN],
  'long-e':     [[1179.3, 887.7], [202.4, 618.1], THIN],
  'long-f':     [[438.7, 288], [1212.9, 853.3], MID],
  'long-g':     [[264.7, 790.5], [1009, 1174.3], MID],
  // The rising diagonals, from lower left to upper right.
  'rise-a':     [[477.6, 1177.1], [1032.7, 247.1], HEAVY],
  'rise-b':     [[332.1, 938.5], [815.2, 311.2], HEAVY],
  'rise-c':     [[261.3, 797.3], [681.8, 406.8], MID],
  // The near-verticals on the right, one angle, and the post with its two bars.
  'fall-a':     [[1052.4, 270.1], [904.4, 1204.9], MID],
  'fall-b':     [[1077.6, 269.9], [922.7, 1248.5], THIN],
  'fall-c':     [[1022.2, 303.5], [884.2, 1174.5], THIN],
  'post':       [[1076.9, 468.5], [1084.1, 1070.5], POST],
  'bar-a':      [[1063.7, 525.5], [1126.5, 525.5], HEAVY],
  'bar-b':      [[1064.8, 547.3], [1149, 547.3], HEAVY],
  // The hatch at the top, across the heavy rising diagonal.
  'hatch-a':    [[746.1, 317.6], [808.3, 395.2], HEAVY],
  'hatch-b':    [[767.2, 292.4], [820.3, 372.4], HEAVY],
  // The short pair at the far left, and the short stroke by the red disc.
  'tick-a':     [[206.8, 671], [268.2, 563.4], THIN],
  'tick-b':     [[219.9, 661.6], [293.8, 565.6], THIN],
  'tick-c':     [[360.5, 675.5], [380.4, 608.2], THIN],
  // The crossing at the bottom left.
  'low-a':      [[351.5, 1118.4], [643.5, 1065.7], MID],
  'low-b':      [[421.3, 1044.6], [626.6, 1161], MID],
  'low-c':      [[413.7, 1174.4], [546.4, 982.2], MID],
  'low-d':      [[384, 1164.5], [495.7, 1011.4], THIN],
  // The three-line hatch at the bottom right, one angle.
  'grate-a':    [[823.3, 1157.4], [983.3, 1058.6], THIN],
  'grate-b':    [[838.1, 1174.2], [996.2, 1076.4], THIN],
  'grate-c':    [[867, 1182.5], [1005.2, 1097], THIN],
};

const RING = { cx: 736, cy: 722.6, r: 628.1, width: 60.4 };
const RING_TOP = [RING.cx, RING.cy - RING.r];

const circle = ([cx, cy, r, w = 0]) => ({ cx, cy, r: r - w / 2 });

// One tempo for the whole piece: every start time and duration below is
// scaled by it, so the families keep their shared settings (rule 3.30).
const TEMPO = 1.392;
const TIMES = ['at', 'time', 'duration'];
const scaled = value => (Array.isArray(value) || typeof value !== 'object' ? value
  : Object.fromEntries(Object.entries(value).map(([k, v]) => [k, TIMES.includes(k) ? v * TEMPO : scaled(v)])));
const tempo = entrances => Object.fromEntries(Object.entries(entrances).map(([id, e]) => [id, scaled(e)]));

// Shared settings, so each family moves in one world (rule 3.30).

// The bands: beams of light, each shining out from its source along its own
// splaying edges and coming to rest past the far edge of the canvas.
const light = { ending: 'land', time: 1.05, alongSides: true };

// A line ruled along its length: a square front, starting at speed and
// braking all the way.
const rule = time => ({ cut: { time, head: 0 } });

// A small circle that grows from nothing where it rests, without moving:
// a swoop whose path stays at its centre. It grows late and brakes into its
// size, like the others.
function grow(id, time) {
  const [cx, cy] = CIRCLES[id] ?? DISCS[id];
  return { swoop: { duration: time, path: [[cx, cy], [cx, cy], [cx, cy]], startRadius: 0 } };
}

// Every circle spirals in towards the centre of the ring, clockwise, growing
// from a speck: a swoop whose path winds `turns` times round the ring's centre,
// starting `gap` units further out than it rests. Circles near the centre
// have a short way round, so they wind more than once; those near the ring
// wind less, so none races. `rest` overrides where it ends, for the orange
// disc's eye.
function spiral(id, { turns, gap, time, rest = CIRCLES[id] ?? DISCS[id] }) {
  const [cx, cy] = rest;
  const reach = Math.hypot(cx - RING.cx, cy - RING.cy) + gap;
  return { swoop: { duration: time, spiral: { centre: [RING.cx, RING.cy], turns, reach }, startRadius: 0 } };
}

// The overlap plane for a set of shapes: the topmost drawn in the region's
// colour, clipped by the others.
const ORDER = ['teal', 'tan', ...Object.keys(CIRCLES)];
function overlap([members, fill]) {
  const sorted = [...members].sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const of = sorted.pop();
  return { id: `${sorted.join('+')}+${of}`, of, within: sorted, fill };
}

export default {
  title: 'Kandinsky',
  label: 'Reconstruction of Circles in a Circle by Wassily Kandinsky',

  viewBox: { width: W, height: H },
  ground: '#D9D0BE',

  planes: [
    // The bands, then the circles, each followed straight away by the
    // overlaps it is the topmost shape of. So every overlap sits under every
    // shape drawn above its members: the bands' crossing stays under all the
    // circles, as the bands themselves do. Each circle's geometry is its
    // outline's centreline, so the outline, drawn later, covers exactly its
    // painted width inside the edge.
    ...ORDER.flatMap(id => [
      id === 'teal' ? { id, points: wedge(TEAL_SW, TEAL_NE), fill: FILL.teal }
        : id === 'tan' ? { id, points: wedge(TAN_NW, TAN_SE), fill: FILL.tan }
          : { id, circle: circle(CIRCLES[id]), fill: FILL[id] },
      ...OVERLAPS.map(overlap).filter(plane => plane.of === id),
    ]),

    ...Object.entries(DISCS).map(([id, c]) => ({ id, circle: circle(c), fill: INK })),

    ...Object.entries(CIRCLES).filter(([, c]) => c[3]).map(([id, c]) => ({ id: `${id}-outline`, of: id, outline: c[3], fill: INK })),

    ...Object.entries(LINES).map(([id, [a, b, width]]) => ({ id, fill: INK, stroke: { points: [a, b], width } })),

    // The ring is a curved stroke, drawn round from its top.
    {
      id: 'ring',
      arc: { cx: RING.cx, cy: RING.cy, rx: RING.r, ry: RING.r, from: RING_TOP, to: RING_TOP },
      width: RING.width,
      fill: INK,
    },
  ],

  lines: [],

  // Bands, then the ring, then the construction lines and the big circles in
  // the crescendo, then the small circles, and the short lines to close.
  //
  // The two bands run past the canvas at both ends, so they set the stage
  // (rule 3.22) as landing beams (rule 3.13). Each is the beam of a light off
  // the canvas, so it shines out from its source, its corners travelling down
  // its own splaying edges: the pale tan first, alone for 0.45s, from the top
  // right; then the teal from the top left, the other way (rule 3.20).
  //
  // The ring is a curved stroke, so it's drawn round (rule 3.5), like a
  // compass: the frame the circles arrive in.
  //
  // The lines are ruled along their length with a square front, starting at
  // speed and braking all the way (rule 3.33's one-segment case; the pen fits
  // the medium, rule 3.4). The long ones build the structure early, in
  // alternating directions; the heavy diagonals are thrown upward at the peak
  // (rule 3.23); the near-verticals fall; the short lines sprout last, one
  // after another round the canvas (rule 3.31).
  //
  // The circles spiral clockwise in towards the centre of the ring, growing
  // from a speck (rule 3.6, carried to the painting's motif): the big
  // translucent ones in the crescendo, the smaller ones as the piece
  // subsides. Those near the centre wind round more than once. The very small
  // circles out by the ring just grow in place, among the short lines, to
  // close. Overlaps recolour as circles cross (rule 3.32).
  entrances: tempo({
    'tan':  { at: 0,    beam: { front: 2, ...light } },
    'teal': { at: 0.45, beam: { front: 2, ...light } },

    'ring': { at: 0.75, draw: { time: 1.3 } },

    'long-a': { at: 0.95, ...rule(0.75) },
    'long-b': { at: 1.08, ...rule(0.75) },
    'long-d': { at: 1.22, ...rule(0.7) },
    'long-e': { at: 1.36, ...rule(0.7) },
    'long-c': { at: 1.52, ...rule(0.7) },
    'long-f': { at: 1.62, ...rule(0.7) },
    'long-g': { at: 1.9,  ...rule(0.65) },

    'yellowLeft': { at: 1.15, ...spiral('yellowLeft', { turns: 1.1, gap: 140, time: 1.41 }) },
    'olive':      { at: 1.25, ...spiral('olive', { turns: 2, gap: 140, time: 1.45 }) },
    'pink':       { at: 1.42, ...spiral('pink', { turns: 0.75, gap: 140, time: 1.5 }) },
    'tealGreen':  { at: 1.52, ...spiral('tealGreen', { turns: 1.1, gap: 140, time: 1.7 }) },
    'redBig':     { at: 1.64, ...spiral('redBig', { turns: 1.1, gap: 140, time: 1.56 }) },
    'blackTop':   { at: 1.72, ...spiral('blackTop', { turns: 0.75, gap: 140, time: 1.39 }) },
    'grey':       { at: 1.8,  ...spiral('grey', { turns: 1.1, gap: 140, time: 1.56 }) },
    'yellowBR':   { at: 1.86, ...spiral('yellowBR', { turns: 0.75, gap: 140, time: 1.29 }) },
    'purple':     { at: 2.0,  ...spiral('purple', { turns: 0.55, gap: 140, time: 1.34 }) },

    'rise-a': { at: 1.78, ...rule(0.75) },
    'rise-b': { at: 1.94, ...rule(0.7) },
    'fall-a': { at: 2.04, ...rule(0.7) },
    'fall-b': { at: 2.14, ...rule(0.7) },
    'fall-c': { at: 2.24, ...rule(0.7) },
    'rise-c': { at: 2.3,  ...rule(0.6) },
    'post':   { at: 2.36, ...rule(0.6) },

    'orange':     { at: 2.1,  ...spiral('orange', { turns: 2, gap: 140, time: 1.44 }) },
    'eye':        { at: 2.1,  ...spiral('eye', { turns: 2, gap: 140, time: 1.44, rest: CIRCLES.orange }) },
    'blueRight':  { at: 2.2,  ...spiral('blueRight', { turns: 0.55, gap: 140, time: 1.28 }) },
    'blackTeal':  { at: 2.28, ...spiral('blackTeal', { turns: 0.75, gap: 140, time: 1.38 }) },
    'redSmall':   { at: 2.36, ...spiral('redSmall', { turns: 0.75, gap: 140, time: 1.39 }) },
    'tealSmall':  { at: 2.42, ...spiral('tealSmall', { turns: 0.55, gap: 140, time: 1.18 }) },
    'blackBR':    { at: 2.56, ...spiral('blackBR', { turns: 0.55, gap: 140, time: 1.22 }) },
    'redBL':      { at: 2.62, ...spiral('redBL', { turns: 0.75, gap: 140, time: 1.43 }) },
    'redMid':     { at: 2.55, ...spiral('redMid', { turns: 1.5, gap: 140, time: 1.66 }) },

    // The very small circles out towards the ring don't travel: each grows
    // from nothing in place, among the short lines, in the closing act.
    'redLeft':     { at: 3.05, ...grow('redLeft', 0.55) },
    'redTop':      { at: 3.15, ...grow('redTop', 0.55) },
    'mauve':       { at: 3.25, ...grow('mauve', 0.55) },
    'salmon':      { at: 3.35, ...grow('salmon', 0.55) },
    'pinkBottom':  { at: 3.45, ...grow('pinkBottom', 0.55) },
    'blueDot':     { at: 3.55, ...grow('blueDot', 0.55) },
    'yellowSmall': { at: 3.62, ...grow('yellowSmall', 0.55) },
    'blackSmall':  { at: 3.7, ...grow('blackSmall', 0.55) },

    'hatch-b': { at: 2.95, ...rule(0.4) },
    'hatch-a': { at: 3.03, ...rule(0.4) },
    'bar-a':   { at: 3.12, ...rule(0.4) },
    'bar-b':   { at: 3.2,  ...rule(0.4) },
    'grate-a': { at: 3.3,  ...rule(0.42) },
    'grate-b': { at: 3.38, ...rule(0.42) },
    'grate-c': { at: 3.46, ...rule(0.42) },
    'tick-a':  { at: 3.42, ...rule(0.42) },
    'tick-b':  { at: 3.5,  ...rule(0.42) },
    'tick-c':  { at: 3.58, ...rule(0.42) },
    'low-a':   { at: 3.62, ...rule(0.45) },
    'low-b':   { at: 3.7,  ...rule(0.45) },
    'low-c':   { at: 3.78, ...rule(0.45) },
    'low-d':   { at: 3.86, ...rule(0.45) },
  }),
};
