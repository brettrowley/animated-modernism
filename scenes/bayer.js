// Herbert Bayer, references/bayer.jpg. Geometry comes from references/bayer.svg.
//
// `planes` run bottom to top, which is also the drawing order. The paint is
// opaque and flat, so planes have a `fill` rather than glass. Bayer gives each
// overlap its own colour, and no drawing order can produce them all, so an
// overlap plane (`of`, `within`) recolours the place where one plane meets
// others: the moon is orange where it crosses the teal and pale yellow where it
// crosses the sun. Overlaps follow the planes they're made of, so each one
// appears only as its planes meet. Planes with no fill are geometry for others
// to be clipped by. See engine/render.js for the details, and engine/motion.js
// for the settings in `entrances`.

const H = 852; // the horizon

// The sea's bands, edge to edge and past both sides of the canvas.
const band = (top, bottom) => [[-10, top], [1210, top], [1210, bottom], [-10, bottom]];

// Shared settings, so each family moves in one world (rule 3.30).
const sea = { ending: 'land', time: 0.85 };
const lune = time => ({ lune: { time } });

// The arch's airbrushing, in two layers that are each continuous, so it holds
// together at every moment of the motion: a darkness that's solid on the left
// and fades out to the right over the sun, under a white that's solid at the
// left tip and fades out up and to the right.
const veilDark = {
  linear: [620, 0, 1085, 0],
  stops: [[0, '#000', 1], [0.172, '#000', 0.85], [0.333, '#000', 0.8], [0.495, '#000', 0.55], [0.602, '#000', 0.33],
    [0.71, '#000', 0.2], [0.817, '#000', 0.1], [0.925, '#000', 0.02], [1, '#000', 0]],
};
const veilLight = {
  linear: [-102.3, 95.5, 175.4, -163.7],
  stops: [[0, '#DADADF', 1], [0.063, '#DADADF', 0.963], [0.121, '#DADADF', 0.908], [0.179, '#DADADF', 0.794],
    [0.24, '#DADADF', 0.67], [0.297, '#DADADF', 0.509], [0.355, '#DADADF', 0.376], [0.416, '#DADADF', 0.275],
    [0.474, '#DADADF', 0.216], [0.532, '#DADADF', 0.174], [0.579, '#DADADF', 0.147], [0.789, '#DADADF', 0.06],
    [1, '#DADADF', 0]],
};
// The arch's shade on the teal: none above the small disc, dark below and right
// of it. The change happens behind the disc.
const tealShade = {
  linear: [646.3, 427.8, 770.4, 633.2],
  stops: [[0, '#000', 0], [0.375, '#000', 0.74], [1, '#000', 0.68]],
};

const NAVY = '#00006A';
const UNDERWATER_RED = '#340001';

// The dome as it shows in the sky: only where it crosses the sun.
const domeSeen = { of: 'dome', within: ['sun', 'sky'] };
// Its reflection, mirrored in the line between the top two bands, in the red band.
const reflected = { ...domeSeen, mirror: 896 };

export default {
  title: 'Bayer',
  label: 'Reconstruction of a painting by Herbert Bayer',

  viewBox: { width: 1200, height: 1200 },
  ground: '#0146C5',

  planes: [
    // Geometry only.
    { id: 'sky', points: [[-20, -20], [1220, -20], [1220, H], [-20, H]] },
    { id: 'hollow', circle: { cx: 597, cy: 1347, r: 773 } }, // inside the arch's inner edge
    { id: 'sea', points: [[-20, H], [1220, H], [1220, 1220], [-20, 1220]] },
    { id: 'deep', points: [[-20, 940], [1220, 940], [1220, 1220], [-20, 1220]] }, // below the second band

    {
      id: 'triangle',
      path: 'M243.3,452.4 A600 600 0 0 1 381.7,376.9 A382.3 382.3 0 0 0 213.0,370.0 A325.6 325.6 0 0 0 243.3,452.4 Z',
      fill: '#EC6700',
    },
    {
      id: 'moon',
      path: 'M777.5,512.7 A393 393 0 1 1 373.9,14.8 A325.6 325.6 0 1 0 777.5,512.7 Z',
      fill: '#DE848F',
    },
    { id: 'moon-under-arch', of: 'moon', within: ['hollow'], fill: '#A3B6DB' },
    {
      id: 'arch',
      path: 'M3.0,852.3 A600 600 0 0 1 1191.0,852.3 A773 773 0 0 0 3.0,852.3 Z',
      fill: '#DADADF',
    },
    { id: 'sun', circle: { cx: 719, cy: 582, r: 390 } },
    { id: 'sun-seen', of: 'sun', within: ['sky'], fill: '#E4AF01' },
    { id: 'moon-over-sun', of: 'moon', within: ['sun'], fill: '#E6C43F' },
    { id: 'arch-dark', of: 'arch', fill: veilDark },
    { id: 'arch-light', of: 'arch', fill: veilLight },
    { id: 'teal', path: 'M213.1,370.0 A405 405 0 1 1 437.2,1095.4 A382.3 382.3 0 0 0 213.1,370.0 Z' },
    { id: 'teal-seen', of: 'teal', within: ['sky'], fill: '#16B1AD' },
    { id: 'teal-shade', of: 'teal', within: ['arch'], fill: tealShade },
    { id: 'moon-over-teal', of: 'moon', within: ['teal'], fill: '#EC6700' },
    { id: 'dome', circle: { cx: 719, cy: 2 * H - 582, r: 390 } },
    { id: 'dome-seen', ...domeSeen, fill: '#88A3D4' },
    { id: 'disc', circle: { cx: 667, cy: 462, r: 97 }, fill: '#E7AF01' },

    { id: 's1', points: band(H, 896), fill: '#8C0330' },
    { id: 's2', points: band(896, 940), fill: '#A00042' },
    { id: 's3', points: band(940, 1060), fill: '#9E0001' },
    { id: 's4', points: band(1060, 1098), fill: '#BE214A' },
    { id: 's5', points: band(1098, 1210), fill: '#C7290E' },
    { id: 'reflection', ...reflected, after: ['s3'], fill: '#2B0054' },

    // The teal under water: navy, dark red below the second band, and navy again
    // over the reflection. (One region each, not one per band, so no seams.)
    { id: 'teal-under', of: 'teal', within: ['sea'], fill: NAVY },
    { id: 'teal-deep', of: 'teal', within: ['deep'], fill: UNDERWATER_RED },
    { id: 'teal-reflection', ...reflected, after: ['s3', 'teal'], fill: NAVY },
  ],

  lines: [],

  // The sea's five bands run past both sides of the canvas, so they set the
  // stage (rule 3.22) as landing beams (rule 3.13). The horizon band plays alone
  // for the first 0.45s; the others follow quickly, alternating directions.
  //
  // The sun rises straight out of the sea, braking into place. Its pale dome is
  // its mirror image in the horizon, so it sinks as the sun rises: while the
  // sun's centre is below the horizon, all of it that shows is pale; once it
  // clears, the yellow sun grows out of the top of the pale and the pale sinks
  // back to the dome. The indigo in the red band is the dome's own reflection.
  //
  // The three crescents (arch, teal and moon) are one family, the painting's
  // swirl. Each is drawn from tip to tip, clockwise: the arch from the left
  // horizon to the right, the teal from its top tip down into the sea, the moon
  // from its tip in the centre round to its top. Where they cross other shapes,
  // the overlaps recolour as they pass.
  //
  // The orange triangle, where the moon's and teal's inner edges meet, is
  // hoisted from that point once both have passed it, and the small disc swoops
  // into the eye of the swirl, growing from a speck, to close the piece.
  entrances: {
    's1':       { at: 0,    beam: { front: 1, ...sea } },
    's2':       { at: 0.45, beam: { front: 3, ...sea } },
    's3':       { at: 0.55, beam: { front: 1, ...sea } },
    's4':       { at: 0.64, beam: { front: 3, ...sea } },
    's5':       { at: 0.76, beam: { front: 1, ...sea } },

    'sun':      { at: 0.85, lift: { from: [719, H + 390 + 10], time: 1.6 } },
    'dome':     { mirrorOf: 'sun', axis: H },

    'arch':     { at: 1.0,  ...lune(1.3) },
    'teal':     { at: 1.35, ...lune(1.45) },
    'moon':     { at: 1.75, ...lune(1.3) },

    'triangle': { at: 2.75, hoist: { time: 0.45 } },
    'disc':     { at: 2.4,  swoop: { duration: 1.15, path: [[1090, 110], [820, 40], [1010, 520]], startRadius: 0 } },
  },
};
