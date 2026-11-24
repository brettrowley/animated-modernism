// What the focused view shows about each painting, beyond its scene file.
// Hand-checked against RULEBOOK.md (section 6's worked examples) and
// CORRECTIONS.md, rather than parsed from them.
//
//   artist, title, year – the caption under the painting (title and year
//                  only where they're confirmed)
//   families     – the rows of the timeline: shapes that share a motion, in
//                  the order they start, as section 6 groups them. `ids` are
//                  entrance ids from the scene; `why` is the worked example's
//                  reason, with the rules it cites.
//   corrections  – motion corrections the director gave (null where they
//                  weren't counted)
//   visible      – the rules most visible in this painting, about three, by
//                  number, each with where to look; the titles come from
//                  RULE_TITLES below. A rule appears in more than one painting
//                  only when each shows a different case of it.
//   note         – a sentence on how this painting shaped the Rulebook
//
// A painting with no entry here still opens: it shows the painting, its
// caption from the scene, and the duration and playback controls.

const f = (label, motion, ids, why, rules) => ({ label, motion, ids, why, rules });

export const DETAILS = {
  'a-ii': {
    artist: 'László Moholy-Nagy',
    title: 'A18',
    year: 1927,
    corrections: null,
    note: 'The exploratory first piece, made before the Rulebook existed. Its corrections weren’t counted, but they became the Rulebook’s first draft.',
    visible: [
      ['3.11', 'The black bar and the blue braking into place.'],
      ['3.17', 'The pale shape sweeps open where its neighbours thrust up.'],
      ['3.4', 'The pen head drawing the dotted construction lines.'],
    ],
    families: [
      f('Black triangle', 'Slide + unfold', ['black-wedge'],
        'Runs past the canvas on three sides, so it sets the stage.', ['3.22']),
      f('Grey triangle', 'Bounce fan-out', ['shadow'],
        'Only one side is seen to move, so a bounce helps it read.', ['3.14']),
      f('Circle', 'Swoop', ['circle'],
        'A curved path, changing size, to contrast with the straight shapes.', ['3.6']),
      f('Construction lines', 'Drawing head', ['red-line', 'yellow-line', 'black-line'],
        'A pen lays down the composition’s construction as it forms.', ['3.4']),
      f('Red and yellow bars', 'Beam, pass', ['red', 'yellow'],
        'Beams of light that cross the canvas and leave the shape behind.', ['3.13']),
      f('Black bar and blue', 'Beam, land', ['black-bar', 'blue'],
        'Thrusting up from the bottom as a family, arriving one at a time.', ['3.16']),
      f('Pale shape', 'Angular sweep', ['triangle'],
        'It’s cut off by the canvas edge, so a thrust could never clear it; it sweeps open inside the frame instead.', ['3.9', '3.17']),
    ],
  },

  'nagy2': {
    artist: 'László Moholy-Nagy',
    title: 'Architektur or Excentrische Konstruktion (Eccentric Construction)',
    year: 1921,
    corrections: 11,
    note: 'The first painting animated from the Rulebook. Its eleven corrections added most of the rules about families, room and rhythm, and one rule that was later rejected.',
    visible: [
      ['3.18', 'The four intersecting bars, which arrive first.'],
      ['3.20', 'Four bars from four directions; the grey rectangle opening against the arc.'],
      ['3.9', 'The grey rectangle folds out of nothing instead of travelling as a sliver.'],
    ],
    families: [
      f('Four intersecting bars', 'Bounce fan-out', ['grey-band', 'red-band', 'black-bar', 'brown-bar'],
        'The painting’s fundamental construction. They share a motion reserved for them, open from their own ends because they sit close to the canvas edges, and enter from four directions for balance.', ['3.18', '3.16', '3.12', '3.20']),
      f('Arc', 'Arc draw', ['arc'],
        'Treated like a line, drawn anticlockwise from its right end; it emerges from the grey band and builds the crescendo.', ['3.5', '3.7', '3.21']),
      f('Grey rectangle', 'Fold', ['grey-bar'],
        'Folds out of nothing rather than travelling as a thin sliver, with no bounce on its short axis, opening right to balance the arc’s leftward sweep.', ['3.9', '3.15', '3.20']),
      f('Yellow line', 'Rod rise', ['yellow-bar'],
        'Thrown up from behind the grey band, slowing to its apex. The bounce stays with the four bars.', ['3.7', '3.16']),
    ],
  },

  'nagy3': {
    artist: 'László Moholy-Nagy',
    title: 'E IV (Konstruktion VIII)',
    year: 1922,
    corrections: 9,
    note: 'Curved shapes, shadows and visual weight: nine corrections, and the rules on radial sweeps and setting the stage.',
    visible: [
      ['3.5', 'The black disc and the grey sail, swept round their pivots.'],
      ['1.3', 'The white bar’s shadow, moving exactly with it.'],
      ['3.14', 'The sail lands fast, so its bounce is earned: the closing note.'],
    ],
    families: [
      f('White bar and its shadow', 'Beam, land', ['white-bar', 'shadow'],
        'Runs past the canvas at both ends, so it sets the stage, and its subtle grey eases the eye in. The shadow has no motion of its own.', ['3.22', '3.13', '1.3']),
      f('Yellow bar', 'Beam, land', ['yellow-bar'],
        'Also runs past the canvas, rising from the lower left in a direction of its own.', ['3.13', '3.20']),
      f('Navy bar', 'Beam, pass', ['navy-bar'],
        'Hard to see, so it passes and breaks to keep more of it on screen, entering fast and slowing to its break.', ['3.13', '3.12']),
      f('Black disc', 'Radial sweep', ['black-disc'],
        'Swept out about its circle’s centre, “emanating” from the grey line as the navy crosses.', ['3.5']),
      f('Sail', 'Radial sweep, bounce', ['sail'],
        'Swept about the midpoint of its straight edge. Its far edge lands fast, so the bounce is earned, and it’s the closing note; it starts with the disc for its visual weight.', ['3.5', '3.14', '3.23']),
      f('Red strip', 'Ricochet', ['red-strip'],
        'A different role from the straight bars: it glances off its corner, with motion all around to answer the turn.', ['3.17', '3.24']),
    ],
  },

  'nagy4': {
    artist: 'László Moholy-Nagy',
    title: 'A II',
    year: 1924,
    corrections: 13,
    note: 'The most corrected painting: thirteen notes on symmetry, partners, circles and quiet shapes.',
    visible: [
      ['3.20', 'The yellows, and the two sheets, opening in opposite directions.'],
      ['3.6', 'One disc grows as it arrives, the other shrinks.'],
      ['3.14', 'The only bounce is the yellows’ snap as they break away.'],
    ],
    families: [
      f('Pale sheet', 'Fold', ['pale-sheet'],
        'Near-square, so it unfolds from nothing. With no clearer opener, the shape that dominates the structure starts the piece.', ['3.22', '3.1']),
      f('Black band', 'Fold', ['black-band'],
        'Answers the pale sheet in the opposite direction; close to the canvas edges.', ['3.20', '3.12']),
      f('Yellow bar and small yellow', 'Beam, pass', ['yellow-bar', 'yellow-small'],
        'Partners: the same motion in opposite directions, 0.2s apart. The break’s wobble is the only bounce in the piece.', ['3.19', '3.14']),
      f('Red disc', 'Swoop', ['red-disc'],
        'Grows from a speck off the right edge on an S-curve.', ['3.6']),
      f('Small grey band and black sheet', 'Fold, quiet', ['grey-small', 'black-small'],
        'Subdued shapes that balance the composition: no bounce, and slightly slower.', ['3.25']),
      f('Pink disc', 'Swoop', ['pink-disc'],
        'Shrinks from five times its size on the mirrored S-curve; the last to finish.', ['3.6', '3.21']),
    ],
  },

  'malevich': {
    artist: 'Kazimir Malevich',
    title: 'Suprematism',
    year: 1916,
    corrections: 7,
    note: 'The first busy painting, with 48 shapes. Seven corrections, three of them about timing, settled its length and its ending.',
    visible: [
      ['3.22', 'The grey sail, alone for the first half second.'],
      ['3.13', 'The spine: two bars pass and break, the cream lands.'],
      ['3.27', 'Forty-eight shapes, and still only four seconds.'],
    ],
    families: [
      f('Grey sail', 'Hoist', ['sail'],
        'A crescent, so it’s hoisted. Almost every other shape sits on it, so it opens, alone until 0.57s.', ['3.5', '3.22']),
      f('Spine: cream, yellow and purple bars', 'Beam, land and pass', ['cream-long', 'yellow-long', 'purple'],
        'They pass wherever there’s room; the cream nearly spans the canvas, so it lands.', ['3.13', '3.16']),
      f('Top cluster', 'Bounce fan-out', ['big-black', 'dark-grey', 'top-black-small', 'black-upper-right', 'cream-thin-top', 'beige'],
        'Close to the top edge, so they open from themselves; bounces along their long axes add energy before the crescendo.', ['3.12', '3.14', '3.15']),
      f('Crossing cluster and small shapes', 'Fold', ['black-notch', 'black-square-top', 'grey-right', 'yellow-top-small', 'black-rect-mid', 'black-small-behind', 'cream-small', 'yellow-small-2', 'yellow-block', 'yellow-tall', 'black-square-bottom', 'black-right-low', 'cream-small-mid', 'black-trapezoid', 'blue-small', 'yellow-b1', 'black-small-low', 'yellow-b3', 'yellow-small-low'],
        'Small clustered shapes read as a group, each folding from nothing in turn, in varied directions.', ['3.16', '3.20']),
      f('Lower-left yellow and black bars', 'Beam, pass and land', ['yellow-big', 'black-lowleft'],
        'A pair moving opposite ways; the black has no room to break, so it lands.', ['3.20', '3.13']),
      f('Cross bar', 'Beam, pass', ['cross-bar'],
        'The heaviest shape, in the crescendo, slowing to give its break room.', ['3.23', '3.13']),
      f('Curved black stroke', 'Arc draw', ['black-arc'],
        'Drawn in the middle of the piece, not saved for the end as a flourish.', ['3.31']),
      f('Lower family', 'Beam, pass', ['yellow-thin-cross', 'cream-lower', 'blue-lower', 'black-thin-line', 'yellow-thin-low'],
        'One family with one ending, spread across directions; the yellow crossing the cross bar goes the other way.', ['3.16', '3.20']),
      f('Black bars beside the cross bar', 'Fold', ['black-right', 'black-left'],
        'They emerge from the cross bar’s sides, a pair moving opposite ways.', ['3.7', '3.20']),
      f('Short lines', 'Fold, sprouting', ['black-tip', 'cream-thin-1', 'grey-thin', 'black-stick', 'cream-thin-2', 'yellow-stick-1', 'yellow-b2', 'yellow-stick-2'],
        'The small lines sprouting one after another are the conclusion.', ['3.31']),
    ],
  },

  'bayer': {
    artist: 'Herbert Bayer',
    title: 'Moon Bridge',
    year: 1976,
    corrections: 0,
    note: 'Accepted with no corrections. Its flat, chosen overlap colours and its swirl of crescents still added eight rules.',
    visible: [
      ['3.21', 'The horizon band alone, the swirl at the peak, the small disc to close.'],
      ['1.3', 'The pale dome sinking as the sun rises.'],
      ['1.7', 'Flat, chosen colours wherever shapes overlap.'],
    ],
    families: [
      f('Sea bands', 'Beam, land', ['s1', 's2', 's3', 's4', 's5'],
        'They run past both edges, so they open as landing beams, alternating directions, the horizon band alone first.', ['3.22', '3.13', '3.20']),
      f('Sun', 'Lift', ['sun'],
        'It sits on the horizon, so it rises out of it rather than swooping; the heaviest shape, near the peak.', ['3.6', '3.28', '3.23']),
      f('Pale dome', 'Mirror', ['dome'],
        'The sun mirrored in the horizon: no motion of its own, so it sinks as the sun rises.', ['1.3']),
      f('Arch, teal and moon', 'Lune draw', ['arch', 'teal', 'moon'],
        'Lunes, drawn tip to tip, one after another clockwise: the painting’s swirl. Overlaps recolour as they pass.', ['3.5', '3.20', '3.32']),
      f('Small disc', 'Swoop', ['disc'],
        'A full circle, growing from nothing on an S-curve into the eye of the swirl, to close the piece.', ['3.6', '3.21']),
      f('Orange triangle', 'Hoist', ['triangle'],
        'A crescent with a curved closing edge, hoisted from where the moon’s and teal’s edges meet.', ['3.5']),
    ],
  },

  'albers': {
    artist: 'Josef Albers',
    title: 'Multiplex A',
    year: 1947,
    corrections: 0,
    note: 'A woodcut, accepted with no corrections. It taught the Rulebook about lines: how they’re drawn, how they join, and which tool draws them.',
    visible: [
      ['3.22', 'The inked block rolling in, alone, before anything is cut.'],
      ['3.4', 'A gouge’s pointed tip cutting each line out of the ink.'],
      ['3.11', 'Every cut braking into its end, never speeding up.'],
    ],
    families: [
      f('Inked block and grain', 'Roll', ['block'],
        'It fills the frame and runs past every edge, so it sets the stage, arriving the way it was made: inked by a roller.', ['3.22']),
      f('Long verticals', 'Cut', ['spine-left', 'spine-right'],
        'Partners under the half turn, cut in opposite directions, starting at speed from nothing.', ['3.19', '3.28']),
      f('Thin line through the middle', 'Cut', ['thin-left', 'thin-right'],
        'One stroke turning its corners, opening from the centre both ways at once; it builds the crescendo.', ['3.33', '3.19', '3.21']),
      f('Panel’s top and bottom edges', 'Cut', ['foot', 'head'],
        'Each starts at the corner a vertical has just reached.', ['3.7', '3.19']),
      f('Thick outline', 'Cut', ['ribbon-bottom', 'ribbon-top'],
        'The heaviest lines start at the peak; the two halves meet at the centre, last.', ['3.23', '3.21', '3.11']),
    ],
  },

  'kandinsky1': {
    artist: 'Wassily Kandinsky',
    title: 'Circles in a Circle',
    year: 1923,
    corrections: 3,
    note: 'The busiest piece, with 57 elements. Three corrections: the circles spiral in, the smallest grow in place, and it runs six seconds.',
    visible: [
      ['3.6', 'The circles spiralling into the ring like a vortex.'],
      ['3.16', 'Each family of circles and lines shares one motion, each in its own moment.'],
      ['3.5', 'The black ring, drawn all the way round like a compass.'],
    ],
    families: [
      f('Tan and teal bands', 'Beam, land', ['tan', 'teal'],
        'They run past the canvas, so they open, the subtler tan first. A wedge from a point off the canvas is a beam of light.', ['3.22', '3.13']),
      f('Ring', 'Arc draw', ['ring'],
        'A closed curved stroke, drawn all the way round like a compass: the frame the circles arrive in.', ['3.5']),
      f('Long lines', 'Cut, ruled', ['long-a', 'long-b', 'long-d', 'long-e', 'long-c', 'long-f', 'long-g'],
        'Ruled with a pen, braking all the way; they build the structure early, in alternating directions.', ['3.4', '3.33', '3.23']),
      f('Big circles', 'Spiral', ['yellowLeft', 'olive', 'pink', 'tealGreen', 'redBig', 'grey', 'yellowBR', 'purple', 'orange', 'eye'],
        'They spiral clockwise in towards the ring’s centre in the crescendo; the olive and orange wind twice, so all travel at one speed. Overlaps recolour as they cross.', ['3.6', '3.30', '3.32']),
      f('Smaller circles and black discs', 'Spiral', ['blackTop', 'blueRight', 'blackTeal', 'redSmall', 'tealSmall', 'redMid', 'blackBR', 'redBL'],
        'They spiral in as the piece subsides, with fewer turns the further out they rest.', ['3.6', '3.21']),
      f('Heavy diagonals and post', 'Cut, ruled', ['rise-a', 'rise-b', 'fall-a', 'fall-b', 'fall-c', 'rise-c', 'post'],
        'The heaviest lines, in the crescendo: the diagonals thrown upward, the near-verticals falling.', ['3.23', '3.24']),
      f('Short lines', 'Cut, ruled', ['hatch-b', 'hatch-a', 'bar-a', 'bar-b', 'grate-a', 'grate-b', 'grate-c', 'tick-a', 'tick-b', 'tick-c', 'low-a', 'low-b', 'low-c', 'low-d'],
        'Ruled one after another round the canvas: the small lines close the piece.', ['3.31']),
      f('Smallest circles', 'Grow', ['redLeft', 'redTop', 'mauve', 'salmon', 'pinkBottom', 'blueDot', 'yellowSmall', 'blackSmall'],
        'Too small to need a path: they grow from nothing where they rest, among the short lines.', ['3.31']),
    ],
  },
};

// Every painting's artist, for the caption, until it has full details.
export const ARTISTS = Object.fromEntries(Object.entries(DETAILS).map(([name, d]) => [name, d.artist]));

// The Rulebook's rule titles, by number, as of version 11.
export const RULE_TITLES = {
  '1.1': "Idealise the geometry onto the painting’s grid",
  '1.2': "Let shapes run past the canvas where the painting implies it",
  '1.3': "Identify shadows",
  '1.4': "Match the spirit, not the exact colours",
  '1.5': "Model each shape as tinted glass, not reduced opacity",
  '1.6': "Draw order is blend order",
  '1.7': "Where each overlap has its own colour, draw it as one shape clipped by another",
  '1.8': "Cut each line’s ends and joins as painted",
  '3.1': "Move along the painting’s own lines",
  '3.2': "Give every motion a physical story",
  '3.3': "Let geometry set the numbers",
  '3.4': "Whatever is added must belong to the painting’s geometry",
  '3.5': "Curved areas sweep radially; curved lines are drawn",
  '3.6': "Full circles travel in, changing size",
  '3.7': "Nothing pops into view",
  '3.9': "Don’t hold a shape far thinner than everything around it",
  '3.10': "A shape’s first appearance must show its true extent",
  '3.11': "Arrivals only slow down",
  '3.12': "A motion needs room to be seen",
  '3.13': "Choose an entrance by where the shape’s ends are",
  '3.14': "A bounce needs speed at the moment of arrival",
  '3.15': "Bounce along the major axis",
  '3.16': "Group shapes by family, separate them in time",
  '3.17': "A shape with a different role gets a different motion",
  '3.18': "Build from the fundamental family",
  '3.19': "In a symmetric painting, move partners against each other",
  '3.20': "Use direction for visual balance",
  '3.21': "Shape the whole animation as a bell curve of motion",
  '3.22': "Open with what sets the stage",
  '3.23': "Put visual weight in the crescendo",
  '3.24': "Surround a big gesture with motion",
  '3.25': "Quiet shapes get quiet motion",
  '3.26': "No dead tails",
  '3.27': "An intro runs about 3–4 seconds, once",
  '3.28': "Visible starts ease out",
  '3.30': "One world, one physics",
  '3.31': "Close on the small lines; keep a flourish in the middle",
  '3.32': "Let overlaps recolour along a shape’s journey",
  '3.33': "A connected polyline is one stroke that turns its corners",
};

// The rules settled enough for the visitor's guide (site/guide.md), and the
// number each has there: the guide numbers its rules in reading order, so
// they differ from the working Rulebook's. Only these are named on the page.
export const GUIDE_NUMBER = {
  '1.1': '1.1',
  '1.2': '1.2',
  '1.3': '1.3',
  '1.4': '1.4',
  '1.5': '1.5',
  '1.6': '1.6',
  '1.7': '1.7',
  '3.1': '3.1',
  '3.2': '3.2',
  '3.3': '3.3',
  '3.4': '3.4',
  '3.5': '3.5',
  '3.6': '3.6',
  '3.7': '3.7',
  '3.9': '3.8',
  '3.10': '3.9',
  '3.11': '3.10',
  '3.12': '3.11',
  '3.13': '3.12',
  '3.14': '3.13',
  '3.15': '3.14',
  '3.16': '4.1',
  '3.17': '4.2',
  '3.18': '4.3',
  '3.20': '4.4',
  '3.21': '4.5',
  '3.22': '4.6',
  '3.26': '4.7',
  '3.27': '4.8',
};
export const SETTLED = new Set(Object.keys(GUIDE_NUMBER));
