// Builds a scene into an <svg>.
//
// Each plane is modelled as a sheet of tinted glass rather than an opaque
// shape with reduced opacity. A sheet does two things to whatever is behind it:
//
//   transmit  – filters the light coming through it        (mix-blend-mode: multiply)
//   emit      – adds light scattered/reflected off its face (mix-blend-mode: screen)
//
//   result = screen(multiply(backdrop, transmit), emit)
//
// So a pale sheet with a warm `emit` reads as near-white over a light ground but
// as salmon over black, and a blue sheet darkens light areas while still glowing
// deep blue over black. Either term can be null to skip it.
//
// Paintings whose overlaps are each painted their own colour use the other
// model instead (rule 1.7): every plane has a flat `fill`, and each recoloured
// overlap is an overlap plane, drawn as one plane clipped by the planes it lies
// within (see render() below). Overlaps follow their planes as they move.

// A woodcut's lines are strokes: polylines of constant width whose every join
// and end is cut as the painting cuts it (see engine/strokes.js). A plane with
// a `stroke` is drawn that way, in its `fill`. A plane with a `grain` carries a
// texture over its fill, generated from a seed (see engine/grain.js).

import { strokeSegments, strokeOutline } from './strokes.js';
import { grain } from './grain.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function el(name, attrs = {}) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  return node;
}

export function setPoints(shape, points) {
  shape.setAttribute('points', points.map(p => p.join(',')).join(' '));
}

export function setCircle(shape, { cx, cy, r }) {
  shape.setAttribute('cx', cx);
  shape.setAttribute('cy', cy);
  shape.setAttribute('r', r);
}

export function setLine(shape, [x1, y1], [x2, y2]) {
  shape.setAttribute('x1', x1);
  shape.setAttribute('y1', y1);
  shape.setAttribute('x2', x2);
  shape.setAttribute('y2', y2);
}

export function setCurve(shape, points) {
  shape.setAttribute('d', `M${points.map(p => p.join(' ')).join('L')}`);
}

// A filled circular segment: the chord from `from` to `to`, closed by an arc of
// `radius` bulging to the left of that direction of travel (on screen). With
// `back`, the outline returns from `to` by way of that point.
export function setSegment(shape, [x1, y1], [x2, y2], radius, back) {
  const via = back ? `L${back[0]} ${back[1]}` : '';
  shape.setAttribute('d', `M${x1} ${y1}A${radius} ${radius} 0 0 1 ${x2} ${y2}${via}Z`);
}

// Draws the head of a line being laid down: a narrow wedge whose flat front
// edge, `width` across, sits at `tip`, tapering to a point `length` back along
// unit direction `dir`. A width or length of 0 hides it.
export function setHead(head, { tip: [x, y], dir: [ux, uy], width, length }) {
  if (!(width > 0 && length > 0)) {
    head.style.visibility = 'hidden';
    return;
  }
  const [nx, ny] = [(-uy * width) / 2, (ux * width) / 2];
  setPoints(head, [[x + nx, y + ny], [x - nx, y - ny], [x - ux * length, y - uy * length]]);
  head.style.visibility = '';
}

// Builds `scene` into `svg`. Every plane and line has one geometry in <defs>;
// the visible glass layers are <use> references to it, so changing a shape's
// geometry moves both of its layers together.
//
// `twins` lists plane ids that also get a twin: a second, initially hidden
// plane with the same glass, drawn just above the original, for an animation
// that needs to split a shape in two.
//
// A plane with a `path` is a fixed outline given as SVG path data, for shapes
// with edges the other kinds can't describe, like elliptical arcs.
//
// Returns `shapes` (id → geometry element; each line also has a head element
// under `<line id>-head`, and each twin is under `<plane id>-twin`).
//
// `clips` lists plane ids whose glass layers are drawn through a clip region,
// for an animation that reveals a fixed shape gradually. The region starts
// empty; it is under `<plane id>-clip`.
//
// Instead of glass, a plane can have a flat `fill`: a colour, or a gradient
// `{ linear: [x1, y1, x2, y2], stops: [[offset, colour, opacity], …] }` in
// viewBox units. A plane with neither glass nor a fill draws nothing: it's
// geometry for other planes to be clipped by.
//
// An overlap plane draws another plane's geometry in its own colour, clipped
// by the planes it lies `within`, so it recolours the place where they meet,
// and follows them as they move:
//
//   of     – the plane whose geometry it draws
//   within – planes it is clipped by (all of them: their intersection)
//   fill   – as above
//   mirror – optional; reflects all that in the horizontal line y = mirror
//   after  – optional; planes it is clipped by once reflected
//   outline – optional; draws the plane's outline, this wide and centred on
//            its edge, instead of its area: a circle's painted rim that stays
//            on it as it moves
//
// `prefix` is put in front of every id the drawing defines, so that several
// scenes can share one page without their ids colliding.
export function render(svg, { viewBox, ground, planes, lines }, { twins = [], clips = [], prefix = '' } = {}) {
  const { width, height } = viewBox;
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const defs = el('defs');
  const clip = el('clipPath', { id: `${prefix}frame` });
  clip.append(el('rect', { width, height }));
  defs.append(clip);
  svg.append(defs);

  const canvas = el('g', { class: 'canvas', 'clip-path': `url(#${prefix}frame)` });
  canvas.append(el('rect', { class: 'ground', width, height, fill: ground }));

  const shapes = {};

  function addPlane(plane, key, shape) {
    shape.id = `${prefix}shape-${key}`;
    defs.append(shape);
    shapes[key] = shape;

    // A plane with a `width` is a stroke (rod or arc) rather than a filled shape.
    const paint = colour => (plane.width
      ? { fill: 'none', stroke: colour, 'stroke-width': plane.width, 'stroke-linecap': plane.cap ?? 'butt' }
      : { fill: colour });

    const group = el('g', { class: 'plane', 'data-plane': key });
    if (clips.includes(key)) {
      const region = el('clipPath', { id: `${prefix}clip-${key}` });
      const area = el('polygon');
      region.append(area);
      defs.append(region);
      shapes[`${key}-clip`] = area;
      group.setAttribute('clip-path', `url(#${prefix}clip-${key})`);
    }
    const href = `#${shape.id}`;
    if (plane.transmit) group.append(el('use', { href, class: 'transmit', ...paint(plane.transmit) }));
    if (plane.emit) group.append(el('use', { href, class: 'emit', ...paint(plane.emit) }));
    if (plane.fill) group.append(el('use', { href, ...paint(fillOf(plane.fill, key)) }));
    if (plane.grain) group.append(grainLayer(plane.grain));
    if (group.childNodes.length) canvas.append(group);
  }

  // A plane's texture: its wood grain, drawn over its fill and moving with it.
  function grainLayer(settings) {
    const layer = el('g', { class: 'grain', fill: 'none', stroke: settings.colour, 'stroke-linecap': 'round' });
    for (const { d, width: w, opacity } of grain({ width, height }, settings)) {
      layer.append(el('path', { d, 'stroke-width': w, 'stroke-opacity': opacity }));
    }
    return layer;
  }

  // A colour, or a gradient defined once in <defs> and referred to by url.
  function fillOf(fill, key) {
    if (typeof fill === 'string') return fill;
    const [x1, y1, x2, y2] = fill.linear;
    const gradient = el('linearGradient', { id: `${prefix}fill-${key}`, gradientUnits: 'userSpaceOnUse', x1, y1, x2, y2 });
    for (const [offset, colour, opacity = 1] of fill.stops) {
      gradient.append(el('stop', { offset, 'stop-color': colour, 'stop-opacity': opacity }));
    }
    defs.append(gradient);
    return `url(#${prefix}fill-${key})`;
  }

  // The region inside a plane, live: it follows the plane's geometry as it moves.
  function inside(id) {
    if (!defs.querySelector(`#${prefix}in-${id}`)) {
      const region = el('clipPath', { id: `${prefix}in-${id}` });
      region.append(el('use', { href: `#${prefix}shape-${id}` }));
      defs.append(region);
    }
    return `url(#${prefix}in-${id})`;
  }

  function addOverlap({ id, of, within = [], fill, mirror, after = [], outline }) {
    let node = el('use', outline
      ? { href: `#${prefix}shape-${of}`, fill: 'none', stroke: fillOf(fill, id), 'stroke-width': outline }
      : { href: `#${prefix}shape-${of}`, fill: fillOf(fill, id) });
    const clipBy = ids => {
      for (const other of [...ids].reverse()) {
        const wrap = el('g', { 'clip-path': inside(other) });
        wrap.append(node);
        node = wrap;
      }
    };
    clipBy(within);
    if (mirror !== undefined) {
      const wrap = el('g', { transform: `matrix(1 0 0 -1 0 ${2 * mirror})` });
      wrap.append(node);
      node = wrap;
    }
    clipBy(after);
    const group = el('g', { class: 'plane', 'data-plane': id });
    group.append(node);
    canvas.append(group);
  }

  for (const plane of planes) {
    if (plane.of) {
      addOverlap(plane);
      continue;
    }
    const shape = plane.circle ? el('circle', plane.circle)
      : plane.rod ? el('line')
      : plane.path ? el('path', { d: plane.path })
      : plane.stroke ? el('path', { d: strokeOutline(strokeSegments(plane.stroke)) })
      : plane.arc || plane.segment ? el('path')
      : el('polygon');
    if (plane.points) setPoints(shape, plane.points);
    addPlane(plane, plane.id, shape);

    if (twins.includes(plane.id)) {
      addPlane(plane, `${plane.id}-twin`, el('polygon', { style: 'visibility: hidden' }));
    }
  }

  for (const line of lines) {
    const shape = el('line', { id: `${prefix}shape-${line.id}` });
    setLine(shape, line.from, line.to);
    defs.append(shape);
    shapes[line.id] = shape;

    canvas.append(el('use', {
      href: `#${prefix}shape-${line.id}`,
      class: 'line',
      stroke: line.stroke,
      'stroke-dasharray': line.dash,
      'stroke-linecap': 'round',
    }));

    // The head that lays the line down during the intro; hidden at rest.
    const head = el('polygon', { class: 'head', fill: line.stroke, style: 'visibility: hidden' });
    canvas.append(head);
    shapes[`${line.id}-head`] = head;
  }

  svg.append(canvas);

  return { shapes };
}
