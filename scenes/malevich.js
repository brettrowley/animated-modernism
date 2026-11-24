// Kazimir Malevich, references/malevich.jpg. Geometry comes from references/malevich.svg.
//
// `planes` run bottom to top, which is also the blending order. See
// engine/render.js for what `transmit` and `emit` mean, and engine/motion.js for
// the settings in `entrances`. The paint is opaque, so every plane blocks what's
// behind it and shows its own colour.

// Shared settings, so each family moves in one world (rule 3.30).
const spine = { ending: 'land', time: 0.76 };
const stack = { sliver: 0, bounce: { time: 0.38, restitution: 0.25, bounces: 2 } };
const pass = { ending: 'pass', time: 1.74, entry: 1.8 };
const fold = time => ({ sliver: 0, fold: { time } });
const quiet = time => fold(time * 1.1); // subdued shapes, about 10% slower (rule 3.25)
const sprout = fold(0.52); // the short lines that close the piece
const quietSprout = quiet(0.52);

export default {
  title: 'Malevich',
  label: 'Reconstruction of a painting by Kazimir Malevich',

  viewBox: { width: 792, height: 900 },
  ground: '#DADAD7',

  planes: [
    {
      id: 'sail',
      path: 'M79.77,251.34 L482.21,23.67 A349.9 416.4 176 0 1 154.99,746.93 A283.2 403.9 106.9 0 0 79.77,251.34 Z',
      transmit: '#000000',
      emit: '#ADB0B4',
    },
    {
      id: 'grey-thin',
      points: [[137.11, 616.88], [305.11, 568.88], [306.89, 575.12], [138.89, 623.12]],
      transmit: '#000000',
      emit: '#727279',
    },
    {
      id: 'cream-long',
      points: [[129.41, 423.39], [728.91, 39.89], [752.09, 76.11], [152.59, 459.61]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'grey-right',
      points: [[581.7, 189.07], [687.04, 120.67], [696.3, 134.93], [590.96, 203.33]],
      transmit: '#000000',
      emit: '#6D7882',
    },
    {
      id: 'purple',
      points: [[297.31, 295.79], [694.31, 41.79], [699.69, 50.21], [302.69, 304.21]],
      transmit: '#000000',
      emit: '#5B547A',
    },
    {
      id: 'black-square-top',
      points: [[522.6, 96.2], [573.34, 63.24], [599.8, 104], [549.06, 136.96]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'yellow-long',
      points: [[152.74, 414.01], [516.34, 173.41], [535.66, 202.59], [172.06, 443.19]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'black-left',
      points: [[111.12, 390.79], [279.53, 281.43], [298.48, 310.61], [130.07, 419.97]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-right',
      points: [[402.93, 324.22], [550.62, 228.31], [578.07, 270.58], [430.38, 366.49]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'cream-small',
      points: [[216.99, 288.52], [253.89, 264.56], [272.41, 293.08], [235.51, 317.04]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'top-black-small',
      points: [[245.12, 45], [307.96, 9.45], [316.88, 25.2], [254.04, 60.75]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-upper-right',
      points: [[323.55, 73.41], [419.29, 19.25], [428.65, 35.79], [332.91, 89.95]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-tip',
      points: [[411.03, 19.25], [437.03, 4.75], [438.97, 8.25], [412.97, 22.75]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-stick',
      points: [[351.54, 32.05], [389.54, 23.05], [390.46, 26.95], [352.46, 35.95]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'big-black',
      points: [[185.59, 173.58], [386.3, 60.03], [411.41, 104.42], [210.7, 217.97]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'dark-grey',
      points: [[231.31, 209.26], [396.67, 115.7], [411.69, 142.24], [246.33, 235.8]],
      transmit: '#000000',
      emit: '#383C46',
    },
    {
      id: 'cream-thin-top',
      points: [[251.4, 239.32], [369.42, 172.54], [374.6, 181.68], [256.58, 248.46]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'black-notch',
      points: [[219.3, 121.7], [227, 121], [231, 149], [222, 149]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'beige',
      points: [[207.05, 88.02], [322.03, 22.97], [359.95, 89.98], [244.97, 155.03]],
      transmit: '#000000',
      emit: '#D3CBBC',
    },
    {
      id: 'black-rect-mid',
      points: [[350.91, 197.72], [420.14, 186.13], [425.49, 218.08], [356.26, 229.67]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'yellow-top-small',
      points: [[137.16, 128.25], [161.27, 114.61], [169.84, 129.75], [145.73, 143.39]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-small-2',
      points: [[175.78, 224.27], [188.29, 246.38], [176.02, 253.33], [163.51, 231.22]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'black-lowleft',
      points: [[4.96, 590.03], [250.04, 448.53], [270.04, 483.17], [24.96, 624.67]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'yellow-big',
      points: [[30.43, 588.21], [308.07, 427.91], [329.07, 464.29], [51.43, 624.59]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-stick-1',
      points: [[268.87, 488.26], [351.55, 535.04], [346.63, 543.74], [263.95, 496.96]],
      transmit: '#000000',
      emit: '#C4A940',
    },
    {
      id: 'black-arc',
      arc: { cx: -31, cy: 435, rx: 115.5, ry: 115.5, from: [63.84, 500.92], to: [77.81, 396.26] },
      width: 33,
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-trapezoid',
      points: [[330, 440], [377, 450], [372, 485], [325, 495]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'cross-bar',
      points: [[359.59, 236.7], [638.11, 839.46], [580.01, 866.3], [301.49, 263.54]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-small-behind',
      points: [[454.17, 373.69], [473.11, 368.26], [477.03, 381.91], [458.09, 387.34]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'cream-thin-1',
      points: [[487.15, 394.35], [610.07, 352.03], [612.35, 358.65], [489.43, 400.97]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'cream-thin-2',
      points: [[570.06, 411.8], [666.92, 361.81], [669.44, 366.7], [572.58, 416.69]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'yellow-thin-cross',
      points: [[384.4, 410.27], [554.26, 361.56], [556.6, 369.73], [386.74, 418.44]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-block',
      points: [[443.29, 404.31], [480.11, 393.76], [492.71, 437.69], [455.89, 448.24]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-tall',
      points: [[558.3, 374.75], [582.01, 457.42], [557.5, 464.45], [533.79, 381.78]],
      transmit: '#000000',
      emit: '#A79643',
    },
    {
      id: 'cream-small-mid',
      points: [[466.5, 451.46], [526.58, 434.23], [534.3, 461.14], [474.22, 478.37]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'yellow-stick-2',
      points: [[375.29, 521.52], [420.39, 441.8], [428.31, 446.28], [383.21, 526]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'blue-small',
      points: [[521.25, 504.92], [538.41, 462.03], [553.55, 468.08], [536.39, 510.97]],
      transmit: '#000000',
      emit: '#233060',
    },
    {
      id: 'black-right-low',
      points: [[544.22, 499.07], [719.63, 484.65], [722.58, 520.53], [547.17, 534.95]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'cream-lower',
      points: [[97.66, 637.59], [537.73, 511.41], [556.94, 578.41], [116.87, 704.59]],
      transmit: '#000000',
      emit: '#E2E4D4',
    },
    {
      id: 'black-small-low',
      points: [[290.73, 554.91], [333.94, 572.9], [324.87, 594.69], [281.66, 576.7]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'black-thin-line',
      points: [[223.53, 688.04], [354.55, 650.47], [356.07, 655.76], [225.05, 693.33]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
    {
      id: 'blue-lower',
      points: [[196.33, 679.5], [322.83, 643.22], [327.27, 658.7], [200.77, 694.98]],
      transmit: '#000000',
      emit: '#476CB9',
    },
    {
      id: 'yellow-thin-low',
      points: [[324.08, 640.86], [438.67, 608.01], [442.72, 622.14], [328.13, 654.99]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-small-low',
      points: [[378.27, 655.58], [417.59, 644.3], [423.13, 663.62], [383.81, 674.9]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-b1',
      points: [[231.86, 720.52], [273.86, 732.57], [266.14, 759.48], [224.14, 747.43]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'yellow-b2',
      points: [[190.63, 785.72], [250.42, 802.86], [246.97, 814.88], [187.18, 797.74]],
      transmit: '#000000',
      emit: '#A79643',
    },
    {
      id: 'yellow-b3',
      points: [[197.25, 827.62], [215.7, 832.91], [211.95, 845.98], [193.5, 840.69]],
      transmit: '#000000',
      emit: '#BC9636',
    },
    {
      id: 'black-square-bottom',
      points: [[355.36, 756.79], [438.48, 729.14], [464.64, 807.81], [381.52, 835.46]],
      transmit: '#000000',
      emit: '#1E1F23',
    },
  ],

  lines: [],

  // Nothing runs past the canvas and no one family is plainly the construction,
  // so the opening is open. The piece opens with the grey sail, which almost
  // everything else sits on (director's choice). It is hoisted out of its lower
  // point: its straight top edge rises from there with each end riding one of the
  // two curved edges, turning as it goes, until it comes to rest in place
  // (director's sketch). It has the canvas to itself for the first half second
  // (director's note): nothing else shows until 0.57s.
  //
  // The spine follows: the long cream bar lands to the lower left, and the long
  // yellow and purple bars pass through and break, the yellow to the upper right
  // and the purple to the lower left. The cream has no room to break, since it
  // nearly spans the canvas. The top cluster then builds as a stack of slabs
  // fanning open from nothing with a bounce, alternating up-right and down-left
  // along their long axes, the beige sheet last on top.
  //
  // At the crescendo the heavy cross bar shoots up from below the bottom edge,
  // slowing on the way so its break has room, and breaks off the top. The two
  // black bars beside it fold open out of its sides in opposite directions. The
  // lower-left yellow bar passes up to the right and breaks, while the black bar
  // under it lands the other way (it has no room to break on the left). The
  // curved black stroke at the left is drawn up its length. The lower family (the
  // wide cream bar, the blue bar, the thin black line under it and the thin
  // yellow) then passes through to the right, staggered, and breaks, while the
  // thin yellow crossing the cross bar passes the other way. The small shapes of
  // the crossing cluster fold open from nothing in turn around it.
  //
  // The piece ends on the short lines sprouting from nothing along their length,
  // one after another across the canvas, while the breaks' wobbles die away: the
  // thin black lines at the top, the thin creams, the grey stick, the yellow bar
  // at the bottom left, and last the two yellow sticks, opening up from the point
  // where their lower ends nearly meet.
  //
  // Every motion runs at one tempo, about three-quarters of the first draft's,
  // so the piece lasts 4 seconds (director's notes).
  //
  // The painting is busy, and several bars and lines overlap in ways that could
  // read as shadows, like the black line under the blue bar. Here every one is
  // independent (director's note), so nothing uses `shadowOf`.
  entrances: {
    'sail':                { at: 0,    hoist: { time: 1.53 } },

    'cream-long':          { at: 0.56, beam: { front: 3, ...spine } },
    'yellow-long':         { at: 0.71,  beam: { front: 1, ...pass } },
    'purple':              { at: 0.8, beam: { front: 3, ...pass } },

    'big-black':           { at: 0.9, edge: 3, ...stack },
    'black-notch':         { at: 0.93,  edge: 2, ...fold(0.27) },
    'dark-grey':           { at: 1, edge: 1, ...stack },
    'top-black-small':     { at: 1.11, edge: 3, ...stack },
    'black-upper-right':   { at: 1.15,  edge: 1, ...stack },
    'cream-thin-top':      { at: 1.24, edge: 3, ...stack },
    'beige':               { at: 1.31, edge: 1, ...stack },
    'black-tip':           { at: 2.66,  edge: 3, ...sprout },
    'black-stick':         { at: 2.98, edge: 3, ...sprout },
    'black-square-top':    { at: 1.1,  edge: 2, ...fold(0.61) },
    'grey-right':          { at: 1.2,  edge: 3, ...quiet(0.61) },
    'yellow-top-small':    { at: 1.34, edge: 3, ...fold(0.38) },

    'cross-bar':           { at: 1.35, beam: { front: 3, ...pass, time: 2.55, entry: 2.4 } },
    'yellow-big':          { at: 1.31, beam: { front: 1, ...pass } },
    'black-right':         { at: 1.47, edge: 3, ...fold(0.61) },
    'black-lowleft':       { at: 1.52,  beam: { front: 3, ending: 'land', time: 0.76 } },
    'black-left':          { at: 1.61, edge: 1, ...fold(0.61) },
    'black-rect-mid':      { at: 1.67,  edge: 3, ...fold(0.53) },
    'cream-small':         { at: 1.76, edge: 0, ...fold(0.46) },
    'yellow-small-2':      { at: 1.85, edge: 3, ...fold(0.38) },

    'yellow-thin-cross':   { at: 1.45, beam: { front: 3, ...pass } },
    'black-small-behind':  { at: 1.74,  edge: 3, ...fold(0.3) },
    'yellow-block':        { at: 1.9,  edge: 0, ...fold(0.46) },
    'cream-thin-1':        { at: 2.78,  edge: 3, ...sprout },
    'yellow-tall':         { at: 2.01, edge: 3, ...fold(0.53) },
    'cream-thin-2':        { at: 3.05, edge: 3, ...sprout },
    'cream-small-mid':     { at: 2.11, edge: 1, ...fold(0.46) },
    'black-right-low':     { at: 2.08, edge: 1, ...fold(0.68) },
    'blue-small':          { at: 2.23, edge: 3, ...fold(0.38) },

    'cream-lower':         { at: 1.56, beam: { front: 1, ...pass } },
    'blue-lower':          { at: 1.74,  beam: { front: 1, ...pass } },
    'black-thin-line':     { at: 1.83, beam: { front: 1, ...pass } },
    'yellow-thin-low':     { at: 1.93, beam: { front: 1, ...pass } },
    'grey-thin':           { at: 2.87, edge: 3, ...quietSprout },
    'yellow-small-low':    { at: 2.55, edge: 1, ...fold(0.38) },

    'black-square-bottom': { at: 2.01, edge: 3, ...fold(0.68) },
    'black-trapezoid':     { at: 2.2,  edge: 1, ...fold(0.53) },
    'black-small-low':     { at: 2.4, edge: 0, ...fold(0.46) },
    'yellow-stick-1':      { at: 3.17, edge: 1, ...sprout },
    'yellow-stick-2':      { at: 3.36,  edge: 3, ...sprout },

    'yellow-b1':           { at: 2.32,  edge: 1, ...fold(0.42) },
    'yellow-b2':           { at: 3.24,  edge: 1, ...sprout },
    'yellow-b3':           { at: 2.52, edge: 1, ...fold(0.42) },
    'black-arc':           { at: 1.39,  draw: { time: 0.93 } },
  },
};

