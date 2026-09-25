/**
 * Global app state (Svelte 5 runes).
 *
 * The engine (renderer/camera) never imports this file — Canvas.svelte is
 * the bridge: it reacts to state changes and pushes them into the renderer.
 */

import { getFractal } from '../fractals/registry'

export interface BookmarkView {
  cx: number
  cy: number
  zoom: number
}

export interface Bookmark {
  id: string
  name: string
  fractalId: string
  params: Record<string, number>
  juliaC: { re: number; im: number }
  iterations: number
  escape: number
  paletteId: string
  density: number
  cycleSpeed: number
  view: BookmarkView
}

const LS_KEY = 'fractal-explorer:bookmarks'

function loadBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as Bookmark[]) : []
  } catch {
    return []
  }
}

function persistBookmarks() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(app.bookmarks))
  } catch {
    /* storage unavailable — ignore */
  }
}

export const app = $state({
  fractalId: 'mandelbrot',
  /** Per-fractal parameter values, keyed by param id */
  params: {} as Record<string, number>,
  juliaC: { re: -0.7269, im: 0.1889 },
  iterations: 500,
  escape: 4,
  paletteId: 'aurora',
  density: 0.05,
  cycleSpeed: 0,
  bookmarks: loadBookmarks(),
  showUi: true,
  /** Cinematic auto-tour mode (engine side effects live in Canvas) */
  touring: false,
  /** Id of the landmark whose info card is open (atlas/landmarks.ts) */
  activeLandmark: null as string | null,
})

/** Live rendering stats published by Canvas for the HUD. */
export const hud = $state({
  re: -0.6,
  im: 0,
  mag: 1,
  iter: 300,
  fps: 0,
})

/** Switch the active fractal and reset its params to defaults. */
export function selectFractal(id: string) {
  const f = getFractal(id)
  app.fractalId = f.id
  app.params = Object.fromEntries(f.params.map((p) => [p.id, p.default]))
}

/** Save the current view + all settings as a bookmark. */
export function saveBookmark(view: BookmarkView) {
  const f = getFractal(app.fractalId)
  const b: Bookmark = {
    id: crypto.randomUUID(),
    name: `${f.name} #${app.bookmarks.length + 1}`,
    fractalId: app.fractalId,
    params: { ...app.params },
    juliaC: { ...app.juliaC },
    iterations: app.iterations,
    escape: app.escape,
    paletteId: app.paletteId,
    density: app.density,
    cycleSpeed: app.cycleSpeed,
    view,
  }
  app.bookmarks.push(b)
  persistBookmarks()
}

export function deleteBookmark(id: string) {
  app.bookmarks = app.bookmarks.filter((b) => b.id !== id)
  persistBookmarks()
}

// Initialize the default fractal's params.
selectFractal('mandelbrot')
