// László Moholy-Nagy, references/nagy3.jpg. Geometry comes from references/nagy3.svg.
//
// `planes` run bottom to top, which is also the blending order. See
// engine/render.js for what `transmit` and `emit` mean, and engine/motion.js for
// the settings in `entrances`.

export default {
  title: 'Moholy-Nagy, nagy3',
  label: 'Reconstruction of a painting by László Moholy-Nagy',

  viewBox: { width: 512, height: 637 },
  ground: '#222222',

  planes: [
    {
      id: 'sail',
      segment: { from: [335.11, 43.99], to: [271.33, 512.6], r: 294.4 },
      transmit: '#808080',
      emit: '#A5A5A6',
    },
    {
      id: 'white-bar',
      points: [[185.1, -18.86], [357.03, 658.14], [366.05, 655.86], [194.11, -21.14]],
      transmit: '#1B272F',
      emit: '#BDBAB6',
    },
    {
      id: 'red-strip',
      points: [[302.17, 123.98], [311.51, 130.7], [95.78, 430.37], [414.75, 660], [395.07, 660], [79.73, 432.99]],
      transmit: '#008889',
      emit: '#D25435',
    },
    {
      id: 'black-disc',
      segment: { from: [274.21, 332.05], to: [236.29, 182.73], r: 77.3 },
      transmit: '#6E5C3A',
      emit: '#000000',
    },
    {
      id: 'navy-bar',
      points: [[66.66, 378.46], [403.85, 523.33], [407.8, 514.14], [70.61, 369.27]],
      transmit: '#506D6F',
      emit: '#00000B',
    },
    {
      id: 'yellow-bar',
      points: [[-22.55, 558.73], [529.45, 196.83], [534.55, 204.61], [-17.45, 566.51]],
      transmit: '#000069',
      emit: '#EFDB5C',
    },
    {
      id: 'shadow',
      points: [[194.11, -21.14], [366.05, 655.86], [370.6, 654.71], [198.66, -22.29]],
      transmit: '#909090',
      emit: '#0E0E0E',
    },
  ],

  lines: [],

  // The subtle white bar eases the eye in, and the yellow bar follows: both run
  // past the canvas at each end, so they land. The navy bar has both ends on the
  // canvas and is hard to see, so it passes through and breaks, which keeps more
  // of it on screen, slowing as it goes so the break has room. It breaks just after
  // the red strip's ricochet. The disc and the sail sweep out clockwise on either side
  // of the white bar while the navy crosses, so the disc rises as the sail falls,
  // and the sail's weight sits in the crescendo, around the red strip's ricochet.
  // The shadow is the white bar's, so it moves exactly with it.
  entrances: {
    'white-bar':  { at: 0.0, beam: { front: 1, ending: 'land', time: 1.0 } },
    'shadow':     { shadowOf: 'white-bar' },
    'yellow-bar': { at: 0.4, beam: { front: 1, ending: 'land', time: 1.0 } },
    'navy-bar':   { at: 0.75, beam: { front: 1, ending: 'pass', time: 3.0, entry: 2.2 } },
    'black-disc': { at: 0.95, radial: { time: 0.85 } },
    'sail':       { at: 0.95, radial: { time: 1.4, pivot: 'chord', bounce: { restitution: 0.25, bounces: 2 } } },
    'red-strip':  { at: 1.05, ricochet: { time: 1.7, keep: 0.6 } },
  },
};
