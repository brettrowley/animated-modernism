// Straight-edged lines of constant width: the cut lines of a woodcut.
//
// A stroke is a polyline drawn as one outline per segment, so every join and
// every end can be cut exactly as the painting cuts it, rather than as SVG's
// stroke joins and caps would:
//
//   points – the centreline, [[x, y], …]
//   width  – the line's width
//   start, end – how each end is cut: omitted for square (across the line), or
//            { dir, at, extend }: along a line in direction `dir` (default:
//            square) through `at` (default: the end point), pushed `extend`
//            units outward so that two strokes meeting there overlap rather
//            than leave a seam
//   joins  – one entry per interior point: omitted (or null) for a mitre, the
//            two edges meeting in a sharp corner; or a cut as above, shared by
//            both segments, as where a zigzag's corner stops flush on a line
//
// A stroke is revealed from its first point to its last by a cut: a front
// running along each segment in turn, led by a pointed head like a V-gouge's.
// See cutOutline() and engine/motion.js.

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const scale = (a, k) => [a[0] * k, a[1] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const unit = ([x, y]) => {
  const len = Math.hypot(x, y);
  return [x / len, y / len];
};

// Where the line through `p` in direction `u` meets the line through `q` in
// direction `d`.
function meet(p, u, q, d) {
  return add(p, scale(u, cross(sub(q, p), d) / cross(u, d)));
}

// The cut line at an end or join, as a point and a direction.
function cutLine(cut, point, across, outward) {
  if (!cut) return { at: point, dir: across };
  const at = cut.at ?? point;
  return { at: add(at, scale(outward, cut.extend ?? 0)), dir: cut.dir ?? across };
}

// Each segment's outline and the numbers its reveal needs:
//   a, u, n – its start, its direction, and the normal (u turned a quarter)
//   outline – four corners: start left, end left, end right, start right
//   lo, hi  – the outline's extent along u, measured from a
//   half    – half the width
export function strokeSegments({ points, width, start, end, joins = [] }) {
  const half = width / 2;
  const dirs = points.slice(1).map((p, i) => unit(sub(p, points[i])));
  const normal = ([x, y]) => [-y, x];

  // The cut at each point: the ends as given, joins as given or mitred.
  const cuts = points.map((p, i) => {
    if (i === 0) return cutLine(start, p, normal(dirs[0]), scale(dirs[0], -1));
    if (i === points.length - 1) return cutLine(end, p, normal(dirs[i - 1]), dirs[i - 1]);
    if (joins[i - 1]) return cutLine(joins[i - 1], p, null, [0, 0]);
    const mitre = sub(dirs[i], dirs[i - 1]);
    return { at: p, dir: Math.hypot(...mitre) < 1e-9 ? normal(dirs[i]) : unit(mitre) };
  });

  return dirs.map((u, i) => {
    const a = points[i];
    const n = normal(u);
    const left = add(a, scale(n, half));
    const right = add(a, scale(n, -half));
    const [c0, c1] = [cuts[i], cuts[i + 1]];
    const outline = [
      meet(left, u, c0.at, c0.dir),
      meet(left, u, c1.at, c1.dir),
      meet(right, u, c1.at, c1.dir),
      meet(right, u, c0.at, c0.dir),
    ];
    const along = outline.map(p => dot(sub(p, a), u));
    return { a, u, n, half, outline, lo: Math.min(...along), hi: Math.max(...along) };
  });
}

// How far the front travels over the whole stroke: each segment's extent, end
// to end. A cut's progress is a distance in [0, length].
export const cutLength = segments => segments.reduce((sum, { lo, hi }) => sum + hi - lo, 0);

// Keeps the part of convex polygon `poly` where f(p) <= 0, for an affine f.
function clip(poly, f) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const [fp, fq] = [f(p), f(q)];
    if (fp <= 0) out.push(p);
    if ((fp < 0 && fq > 0) || (fp > 0 && fq < 0)) out.push(add(p, scale(sub(q, p), fp / (fp - fq))));
  }
  return out;
}

// The outline of a stroke cut `distance` units along, as SVG path data: every
// segment the front has passed in full, and the one it is in, clipped by the
// front. The front is a chevron: its shoulders, at the line's edges, are
// `distance` along; its point is `head` further on, on the centreline. The head
// grows from nothing as the cut starts, and is simply clipped away by the end's
// own cut as it finishes, so the line comes to rest exactly as traced.
//
// Each segment's front runs on from the last's, so the next segment's point
// starts to show just before the last's shoulders reach its corner: the head
// turns the corner rather than stopping at it.
export function cutOutline(segments, distance, head) {
  const lead = Math.min(head, Math.max(distance, 0));
  let before = 0;
  const parts = [];
  for (const { a, u, n, half, outline, lo, hi } of segments) {
    const shoulder = lo + distance - before;
    before += hi - lo;
    if (shoulder >= hi) {
      parts.push(outline);
      continue;
    }
    if (shoulder + lead <= lo) break;
    const slope = lead / half;
    const along = p => dot(sub(p, a), u);
    const across = p => dot(sub(p, a), n);
    let poly = clip(outline, p => along(p) + slope * across(p) - shoulder - lead);
    poly = clip(poly, p => along(p) - slope * across(p) - shoulder - lead);
    if (poly.length >= 3) parts.push(poly);
  }
  return parts.map(poly => `M${poly.map(([x, y]) => `${round(x)} ${round(y)}`).join('L')}Z`).join('');
}

// The whole stroke, at rest.
export const strokeOutline = segments => cutOutline(segments, Infinity, 0);

const round = v => Math.round(v * 100) / 100;
