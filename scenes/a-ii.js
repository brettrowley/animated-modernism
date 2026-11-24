// László Moholy-Nagy, A18 (1927). Long called A II in this project, which is
// really the painting in nagy4.js; the file keeps its old name. Geometry comes
// from references/a-ii-v2.svg.
//
// `planes` run bottom to top, which is also the blending order. See
// engine/render.js for what `transmit` and `emit` mean, and engine/motion.js for
// the settings in `entrances`.

export default {
  title: 'Moholy-Nagy, A18',
  label: 'Reconstruction of László Moholy-Nagy, A18',

  viewBox: { width: 567, height: 787 },
  ground: '#D3CFC6',

  planes: [
    {
      id: 'black-wedge',
      points: [[582.24, 831.561], [-127.76, 443.561], [-127.76, 831.561]],
      transmit: '#2A2A2A',
      emit: null,
    },
    {
      id: 'circle',
      circle: { cx: 264.5, cy: 525.5, r: 137.5 },
      transmit: null,
      emit: '#EEC2B4',
    },
    {
      id: 'shadow',
      points: [[123.5, 852.5], [315, -22.5], [-34, -22.5], [-34, 786]],
      transmit: '#D9DBDC',
      emit: null,
    },
    {
      id: 'red',
      points: [[247, 394.5], [301.5, 475.5], [288.5, 534.5], [236, 447.5]],
      transmit: '#D9401F',
      emit: '#2A0500',
    },
    {
      id: 'yellow',
      points: [[196.5, 360], [250, 368.5], [320, 451], [265.5, 442.5]],
      transmit: '#F7D23A',
      emit: '#B08A20',
    },
    {
      id: 'black-bar',
      points: [[411.5, 364.5], [475, 462], [420.5, 667.5], [365, 583]],
      transmit: '#1B1F2C',
      emit: '#0B0F1A',
    },
    {
      id: 'blue',
      points: [[315, 542.5], [416, 484.5], [376, 670], [275.5, 727.5]],
      transmit: '#8FB0EA',
      emit: '#1F3570',
    },
    {
      id: 'triangle',
      points: [[354, 643.5], [525.5, 546], [386.5, 848], [274.5, 815]],
      transmit: null,
      emit: '#8C8A84',
    },
  ],

  // Fine dotted construction lines, drawn over the planes with normal blending.
  lines: [
    { id: 'red-line', from: [43.5, 276.5], to: [549.5, 559], stroke: '#9D3921', dash: '1 3' },
    { id: 'yellow-line', from: [43.5, 219.5], to: [472.5, 727.5], stroke: '#CEB25F', dash: '1 3' },
    { id: 'black-line', from: [499.5, 241], to: [206, 650], stroke: '#191919', dash: '0.5 3' },
  ],

  // Red and yellow pass through from the top and left; the black bar and blue
  // land one after the other, thrusting up from the bottom. The pale triangle
  // slides in as a sliver along its top edge from the right, and unfolds.
  entrances: {
    'black-wedge': { at: 0.0, edge: 0, from: -1 },
    'circle':      { at: 0.5, swoop: { duration: 2.4, path: [[-40, 150], [330, -60], [560, 330]], startRadius: 3 } },
    'shadow':      { at: 0.3, edge: 2, bounce: { time: 0.9, restitution: 0.22, bounces: 3 } },
    'red':         { at: 1.7, beam: { front: 2, ending: 'pass', time: 1.2 } },
    'yellow':      { at: 1.9, beam: { front: 1, ending: 'pass', time: 1.2 } },
    'black-bar':   { at: 1.8, beam: { front: 0, ending: 'land', time: 1.2 } },
    'blue':        { at: 2.25, beam: { front: 0, ending: 'land', time: 1.2 } },
    'triangle':    { at: 2.5, edge: 0, from: 1, sweep: 0.9 },
  },

  // When the first line starts, the gap between lines, and how long each takes.
  lineTiming: { at: 1.0, stagger: 0.3, draw: 2.0 },
};
