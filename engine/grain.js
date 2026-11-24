// Wood grain, for a woodcut printed from a plank: the fine pale streaks where
// the inked surface's grain didn't take the ink, so the paper shows through.
//
// The grain is a texture, not traced shapes: it's generated from a seed and a
// few numbers measured from the photograph, so it reads as the same wood
// without copying its pixels (rule 1.1). It's still geometry, not a raster or
// a filter, so it stays crisp at any size and can move with the motion.
//
// Fibres run across the block at an uneven pitch, all following one gently
// undulating flow, like the rings of a plank. Each fibre is broken into
// dashes of random length, more of them where the wood is denser (a coarse
// map of how much paper shows, measured from the photo). Dashes are grouped
// into a few tiers by strength, each drawn as one path of thin lines, so the
// whole texture is a handful of SVG elements.
//
// Settings (`grain` in a scene), in viewBox units:
//   seed     – any integer; another seed gives another plank
//   pitch    – mean distance between fibres, and how much it varies (±)
//   tilt     – the grain's overall slope (rise per unit across)
//   wave     – [amplitude, wavelength across, wavelength down] of each of the
//              flow's undulations
//   dash     – median dash length, and its spread (a lognormal's sigma)
//   gap      – median gap between dashes at average density, and its spread
//   density  – rows of relative density, top to bottom, left to right; it's
//              interpolated smoothly across the block
//   tiers    – [width, opacity] of each strength of dash, faintest first

// A small, fast, seeded random number generator (mulberry32).
export function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A lognormal sample with the given median and spread.
function lognormal(rand, median, sigma) {
  const u = Math.max(rand(), 1e-9);
  const v = rand();
  return median * Math.exp(sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v));
}

// Bilinear interpolation of a grid of rows over a width × height area.
function field(rows, width, height) {
  const R = rows.length;
  const C = rows[0].length;
  return (x, y) => {
    const fy = Math.min(Math.max((y / height) * R - 0.5, 0), R - 1);
    const fx = Math.min(Math.max((x / width) * C - 0.5, 0), C - 1);
    const [i, j] = [Math.min(Math.floor(fy), R - 2), Math.min(Math.floor(fx), C - 2)];
    const [ty, tx] = [fy - i, fx - j];
    const at = (r, c) => rows[Math.max(r, 0)]?.[Math.max(c, 0)] ?? rows[0][0];
    const top = at(i, j) * (1 - tx) + at(i, j + 1) * tx;
    const bottom = at(i + 1, j) * (1 - tx) + at(i + 1, j + 1) * tx;
    return top * (1 - ty) + bottom * ty;
  };
}

// The grain over a width × height block, as one path per tier:
// [{ d, width, opacity }]. Fibres start and end a little past the block's
// edges, as the plank does.
export function grain({ width, height }, settings) {
  const { seed, pitch: [pitch, spread], tilt, wave, dash, gap, density, tiers } = settings;
  const rand = random(seed);
  const densityAt = field(density, width, height);

  // The flow: how far a fibre is displaced at (x, y), from a few undulations
  // with random phases, plus the overall tilt.
  const waves = wave.map(([amplitude, across, down]) => ({ amplitude, across, down, phase: rand() * 2 * Math.PI }));
  const flow = (x, y) => tilt * (x - width / 2)
    + waves.reduce((sum, w) => sum + w.amplitude * Math.sin((2 * Math.PI * x) / w.across + (2 * Math.PI * y) / w.down + w.phase), 0);

  const paths = tiers.map(() => []);
  const margin = 12;
  for (let y = -margin + rand() * pitch; y < height + margin; y += pitch + (rand() * 2 - 1) * spread) {
    let x = -margin - rand() * gap[0] * 2;
    while (x < width + margin) {
      const length = lognormal(rand, dash[0], dash[1]);
      const x2 = x + length;
      const tier = Math.min(tiers.length - 1, Math.floor(rand() * rand() * tiers.length * 1.6));
      paths[tier].push(`M${round(x)} ${round(y + flow(x, y))}L${round(x2)} ${round(y + flow(x2, y))}`);
      const dense = Math.max(densityAt((x + x2) / 2, y), 0.05);
      x = x2 + lognormal(rand, gap[0] / dense, gap[1]);
    }
  }
  return tiers.map(([w, opacity], i) => ({ d: paths[i].join(''), width: w, opacity }));
}

const round = v => Math.round(v * 10) / 10;
