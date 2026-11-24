// László Moholy-Nagy, references/nagy2.jpg. Geometry comes from references/nagy2.svg.
//
// `planes` run bottom to top, which is also the blending order. See
// engine/render.js for what `transmit` and `emit` mean, and engine/motion.js for
// the settings in `entrances`. The paint here is opaque, so every `transmit` is
// black: it blocks what's behind, and `emit` supplies the colour.

const opaque = emit => ({ transmit: '#000000', emit });

const opening = { sliver: 0, bounce: { time: 0.7, restitution: 0.25, bounces: 2 } };

export default {
  title: 'Moholy-Nagy',
  label: 'Reconstruction of a painting by László Moholy-Nagy',

  viewBox: { width: 512, height: 797 },
  ground: '#DCCDAE',

  planes: [
    {
      id: 'grey-bar',
      points: [[264, 114.27], [298.5, 137.33], [298.5, 547.35], [264, 533.05]],
      ...opaque('#8C8574'),
    },
    {
      id: 'yellow-bar',
      rod: { from: [326, 640], to: [326, 23] },
      width: 12,
      cap: 'round',
      ...opaque('#CDA12C'),
    },
    {
      id: 'arc',
      arc: { cx: 246, cy: 619, rx: 176.5, ry: 241.5, from: [416.78, 680], to: [80.52, 535] },
      width: 17.5,
      ...opaque('#20201F'),
    },
    {
      id: 'brown-bar',
      points: [[172, 209.05], [206.5, 174.55], [206.5, 677.27], [172, 700.33]],
      ...opaque('#5F392D'),
    },
    {
      id: 'grey-band',
      points: [[25.5, 495.61], [474, 681.39], [474, 722.39], [25.5, 536.61]],
      ...opaque('#898377'),
    },
    {
      id: 'black-bar',
      points: [[239.5, 261.7], [267, 273.1], [267, 770.5], [239.5, 759.1]],
      ...opaque('#20201F'),
    },
    {
      id: 'red-band',
      points: [[25.5, 555.61], [474, 741.39], [474, 777.39], [25.5, 591.61]],
      ...opaque('#98342C'),
    },
  ],

  lines: [],

  // The four intersecting rectangles are the construction: one family, so they
  // all fold open from nothing with the same bounce, each from its far end, in
  // four different directions. The bounce belongs to these four alone. The rest
  // build from them, overlapping their end: the arc sweeps anti-clockwise out of
  // the grey band, the grey bar folds open to the right, balancing the arc's
  // leftward sweep, and the yellow rod is thrown up from behind the grey band.
  entrances: {
    'grey-band': { at: 0.0, edge: 3, ...opening },
    'red-band':  { at: 0.3, edge: 1, ...opening },
    'black-bar': { at: 0.7, edge: 2, ...opening },
    'brown-bar': { at: 1.1, edge: 0, ...opening },
    'grey-bar':  { at: 2.05, edge: 3, sliver: 0, fold: { time: 0.8 } },
    'arc':       { at: 1.0, draw: { time: 1.5 } },
    'yellow-bar': { at: 2.15, rise: { time: 1.1 } },
  },
};
