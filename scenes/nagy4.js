// László Moholy-Nagy, references/nagy4.jpg. Geometry comes from references/nagy4.svg.
//
// `planes` run bottom to top, which is also the blending order. See
// engine/render.js for what `transmit` and `emit` mean, and engine/motion.js for
// the settings in `entrances`.

const smallGroup = { sliver: 0, fold: { time: 1.25 } };

export default {
  title: 'Moholy-Nagy, A II',
  label: 'Reconstruction of László Moholy-Nagy, A II',

  viewBox: { width: 900, height: 761 },
  ground: '#976F34',

  planes: [
    {
      id: 'black-band',
      points: [[27.7, 254], [766.42, 254], [860.35, 427], [121.63, 427]],
      transmit: '#03001F',
      emit: '#1D1B1A',
    },
    {
      id: 'grey-small',
      points: [[102.41, 524], [406.68, 524], [437.9, 581.5], [133.63, 581.5]],
      transmit: '#4755AD',
      emit: '#4C4C4D',
    },
    {
      id: 'black-small',
      points: [[265.81, 538], [366.93, 538], [298.24, 664.5], [197.13, 664.5]],
      transmit: '#1A0D00',
      emit: '#0D1719',
    },
    {
      id: 'pale-sheet',
      points: [[377.12, 303], [690.33, 303], [513.05, 629.5], [199.85, 629.5]],
      transmit: '#FFFFFF',
      emit: '#8A8D92',
    },
    {
      id: 'yellow-small',
      points: [[222.89, 439], [266.75, 439], [358.24, 607.5], [314.37, 607.5]],
      transmit: '#F40020',
      emit: '#9DC985',
    },
    {
      id: 'pink-disc',
      circle: { cx: 312.91, cy: 524, r: 34.5 },
      transmit: '#C7B699',
      emit: '#774F5A',
    },
    {
      id: 'red-disc',
      circle: { cx: 529.07, cy: 254, r: 79 },
      transmit: '#FB004B',
      emit: '#0C0700',
    },
    {
      id: 'yellow-bar',
      points: [[335.72, 88.5], [439.21, 88.5], [665.89, 506], [562.4, 506]],
      transmit: '#FFFF78',
      emit: '#736300',
    },
  ],

  lines: [],

  // The near-square pale sheet starts the piece, folding open from nothing off
  // its right edge, which runs through the knot where the yellow bar and the black
  // band's bottom edge meet. The black band answers, folding the other way. The
  // two yellows are partners: each crosses as an elastic beam and breaks, the
  // large one down to the right and the small one up to the left, close behind;
  // the break's wobble is the only bounce in the piece. The small grey band and
  // small black sheet are subdued and only balance the composition, so they fold
  // open quietly from nothing, each in its own direction. The discs swoop
  // in on curves that mirror each other through the point between their centres,
  // turning the same way like a pinwheel: the red grows from a speck off the right
  // edge, and the pink shrinks from five times its size off the left, finishing
  // the piece in the small group.
  entrances: {
    'pale-sheet':   { at: 0.0,  edge: 1, sliver: 0, fold: { time: 1.4 } },
    'black-band':   { at: 0.45, edge: 3, sliver: 0, fold: { time: 1.4 } },
    'yellow-bar':   { at: 0.85, beam: { front: 2, ending: 'pass', time: 2.0, entry: 1.8 } },
    'grey-small':   { at: 1.15, edge: 3, ...smallGroup },
    'red-disc':     { at: 1.0,  swoop: { duration: 2.0, path: [[1032, 470], [760, 560], [620, 40]], startRadius: 3 } },
    'black-small':  { at: 1.45, edge: 2, ...smallGroup },
    'yellow-small': { at: 1.05, beam: { front: 0, ending: 'pass', time: 2.0, entry: 1.8 } },
    'pink-disc':    { at: 1.4,  swoop: { duration: 2.1, path: [[-190, 308], [82, 218], [222, 738]], startRadius: 172 } },
  },
};
