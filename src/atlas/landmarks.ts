/**
 * Atlas of the Set — curated famous locations on the Mandelbrot set.
 *
 * Pure content module (no engine imports): clicking a landmark flies the
 * camera there and shows its info card; stops marked `tour` form the
 * narrated auto-tour.
 *
 * Notes for curators:
 * - `cx/cy` are VIEWING CENTERS, often tuned slightly off the mathematical
 *   point (see `notation`) so the named structure fills the frame instead
 *   of a black interior or a pinch point.
 * - `iterBase` is an iteration floor applied while the landmark's card is
 *   open: deep landmarks need far more iterations than the default slider
 *   provides, or their structure collapses into flat color.
 * - Dive depths stay within the range a GPU renders richly in real time.
 *
 * The copy is written for beginners: short sentences, vivid pictures,
 * zero unexplained jargon — the goal is wonder first, math second.
 */

export interface Landmark {
  id: string
  name: string
  /** Viewing center in the complex plane (tuned for framing, see notation) */
  cx: number
  cy: number
  /** Arrival magnification — the named structure clearly visible */
  zoom: number
  /** Optional deeper target for the tour's cinematic dive */
  diveTo?: number
  /** Include as a stop in the narrated auto-tour */
  tour?: boolean
  /**
   * Iteration floor (slider-equivalent base) enforced while this landmark's
   * card is open — deep landmarks starve at the default detail level.
   */
  iterBase?: number
  /** Munafo-style notation or mathematical label (monospace display) */
  notation?: string
  /** Plain-language description (1–2 sentences, beginner-friendly) */
  summary: string
  /** Optional extra fact, still beginner-friendly */
  detail?: string
  /** Which fractal the landmark lives on (all Mandelbrot for now) */
  fractalId: string
}

export const LANDMARKS: Landmark[] = [
  {
    id: 'utter-west',
    name: 'Tip of the Antenna',
    cx: -2,
    cy: 0,
    zoom: 150,
    diveTo: 30000,
    tour: true,
    iterBase: 800,
    notation: '−2 + 0i · R2F(1/2B1)t',
    summary:
      'The far western edge of the entire set — the tip of a needle-thin tail. Zoom in and the tail never really ends: it just grows new branches, forever.',
    detail:
      'Mathematicians once could not tell whether this spike was even connected to the rest of the set. It is — by a thread so thin it is invisible at almost any scale.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'largest-island',
    name: 'The Largest Island',
    cx: -1.7548776662,
    cy: 0,
    zoom: 300,
    diveTo: 50000,
    tour: true,
    iterBase: 800,
    notation: '≈ −1.7549 + 0i · R2F(1/2B1)S.C(0)',
    summary:
      'A tiny, almost perfect copy of the whole Mandelbrot set, hanging off the antenna like a pearl. Every valley, elephant and seahorse you can see from the surface exists inside this little copy too — and inside its copies, forever.',
    detail: 'About 70 times smaller than the parent set. Zooming into its cusp replays the entire story again in miniature.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'seahorse-west',
    name: 'Seahorse River West',
    cx: -1.75,
    cy: 0,
    zoom: 1000,
    diveTo: 30000,
    iterBase: 800,
    notation: '−11⁄4 + 0i · R2.1⁄2.C(1⁄2)',
    summary:
      'On the western slope of the big bud, currents of seahorse tails stream toward the largest island — a river of spirals winding along the set\u2019s boundary.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'bond-2-4',
    name: 'Bond Point',
    cx: -1,
    cy: 0.25,
    zoom: 400,
    diveTo: 20000,
    tour: true,
    iterBase: 800,
    notation: '−1 + ¼i · R2.1⁄2a ↔ R2.1⁄2.1⁄4a',
    summary:
      'Two buds of the set touching at a single point. Zoom in and watch two different spiral patterns weave through each other like clasped hands.',
    detail:
      '“Bond” points are the exact places where two perfectly round buds meet — and the pattern you see when you zoom into one is unique to that meeting.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'neck',
    name: 'Root of the Big Bud',
    cx: -0.75,
    cy: 0,
    zoom: 400,
    diveTo: 10000,
    tour: true,
    iterBase: 800,
    notation: '−¾ + 0i · R2.C(1⁄2) — the cardioid\u2019s cusp',
    summary:
      'The exact spot where the set\u2019s heart and its biggest bud touch. This single point anchors the entire bud — one of the special “root” points that organize the whole set.',
    detail:
      'Dive straight into the pinch and the two black chambers narrow around you like a canyon closing.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'seahorse-valley',
    name: 'Seahorse Valley',
    cx: -0.74519683,
    cy: 0.10186989,
    zoom: 1500,
    diveTo: 2000000,
    tour: true,
    iterBase: 1200,
    notation: '≈ −0.7452 + 0.1019i',
    summary:
      'A narrow strait between the set\u2019s heart and its biggest bud, where the walls curl into paired spirals that look just like seahorse tails. Every tail hides a smaller tail inside — forever.',
    detail: 'One of the most photographed places in mathematics.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'misiurewicz-i',
    name: 'Point i',
    cx: 0,
    cy: 1,
    zoom: 300,
    diveTo: 30000,
    tour: true,
    iterBase: 800,
    notation: '0 + i · terminal, period 2, ext. arg. 1⁄6',
    summary:
      'The point c = i sits exactly on the set\u2019s coastline. Coasts like this have a magic property: zoom in and the same scene reappears at every scale, like a hall of mirrors.',
    detail:
      'Named after mathematician Micha\u0142 Misiurewicz — points where the formula\u2019s orbit falls into a repeating loop after just a few steps.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'quad-spiral',
    name: 'Quad Spiral Valley',
    cx: 0.25,
    cy: 0.5,
    zoom: 2000,
    diveTo: 100000,
    iterBase: 1000,
    notation: '¼ + ½i · R2.C(1⁄4)',
    summary:
      'Four-armed spirals wind around each other here like galaxies mid-collision — and every arm eventually ends in a smaller copy of the whole set.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'elephant-valley',
    name: 'Elephant Valley',
    // View center sits a hair east of the cusp (¼) so the parade — not the
    // black interior — fills the frame.
    cx: 0.2505,
    cy: 0,
    zoom: 2500,
    diveTo: 100000,
    tour: true,
    iterBase: 1000,
    notation: '¼ + 0i · R2.C(0)',
    summary:
      'Where the heart of the set comes to a sharp point, dozens of miniature copies parade outward like elephants walking trunk-to-tail. Each “elephant” is a complete Mandelbrot set in miniature.',
    detail: 'Zoom toward the tip and the parade never ends — there are always more elephants.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'wormhole',
    name: 'The Wormhole',
    cx: -1.739715655693,
    cy: -9.1575e-8,
    zoom: 20000,
    diveTo: 500000,
    iterBase: 1000,
    notation: '−1.739715655693 − 9.1575×10⁻⁸i',
    summary:
      'A thread on the set\u2019s far western edge that closes around you like a tunnel as you dive in — walls of filament branching into more filament, with no floor in sight.',
    detail:
      'The deepest published dive here reaches about ten billion times magnification. What you see is only the mouth of the wormhole.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'carousel',
    name: 'The Carousel',
    cx: 0.35787121,
    cy: -0.1081397,
    zoom: 20000,
    diveTo: 500000,
    iterBase: 1000,
    notation: '0.35787121 − 0.10813970i',
    summary:
      'Swirls riding swirls, turning like a carousel of galaxies. Watch long enough and you can feel the same rotation repeat at every scale.',
    fractalId: 'mandelbrot',
  },
  {
    id: 'dendrite-tip',
    name: 'Deep Dendrite Tip',
    cx: -0.743643887037151,
    cy: 0.13182590420533,
    zoom: 50000,
    diveTo: 2000000,
    tour: true,
    iterBase: 1200,
    notation: '−0.743643887037151 + 0.131825904205330i',
    summary:
      'Lightning frozen mid-strike: pure branching tendrils with no interior at all. Here the set is all coastline and no land.',
    detail:
      'One of the most famous deep-zoom coordinates in mathematics, animated countless times since the 1980s.',
    fractalId: 'mandelbrot',
  },
]

export function getLandmark(id: string): Landmark {
  return LANDMARKS.find((l) => l.id === id) ?? LANDMARKS[0]
}

/** The narrated auto-tour's itinerary, in order. */
export const TOUR_STOPS: Landmark[] = LANDMARKS.filter((l) => l.tour)
