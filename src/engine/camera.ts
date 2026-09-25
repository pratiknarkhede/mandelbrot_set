/**
 * Camera — infinite pan/zoom state for the complex plane.
 *
 * Coordinates are plain JS doubles (~15–16 significant digits). The renderer
 * splits them into (hi, lo) float32 pairs when uploading to the shader, so
 * the effective per-pixel precision on the GPU is ~46 bits (~10^12 zoom).
 */

export const MIN_ZOOM = 0.5
export const MAX_ZOOM = 1e12
/** World units visible vertically at zoom = 1 */
export const BASE_SPAN = 3.0

export interface View {
  cx: number
  cy: number
  /** Magnification, 1 = default span */
  zoom: number
}

function clampZoom(z: number): number {
  return Math.min(Math.max(z, MIN_ZOOM), MAX_ZOOM)
}

export class Camera {
  cx: number
  cy: number
  zoom: number

  private anim: { from: View; to: View; t: number; dur: number } | null = null

  constructor(view: View = { cx: -0.6, cy: 0, zoom: 1 }) {
    this.cx = view.cx
    this.cy = view.cy
    this.zoom = view.zoom
  }

  get view(): View {
    return { cx: this.cx, cy: this.cy, zoom: this.zoom }
  }

  /** True while a flyTo animation is in progress. */
  get animating(): boolean {
    return this.anim !== null
  }

  setView(v: View) {
    this.cx = v.cx
    this.cy = v.cy
    this.zoom = clampZoom(v.zoom)
    this.anim = null
  }

  /** World units per device pixel at the given device-pixel buffer height. */
  worldPerPx(deviceHeight: number): number {
    return BASE_SPAN / (Math.max(deviceHeight, 1) * this.zoom)
  }

  /** Device pixel (top-left origin) → world complex coordinates. */
  worldFromScreen(px: number, py: number, dw: number, dh: number): { x: number; y: number } {
    const s = this.worldPerPx(dh)
    return {
      x: this.cx + (px - dw / 2) * s,
      y: this.cy + (dh / 2 - py) * s,
    }
  }

  /** Pan by a device-pixel delta (dx right, dy down). */
  panPx(dx: number, dy: number, dh: number) {
    const s = this.worldPerPx(dh)
    this.cx -= dx * s
    this.cy += dy * s
    this.anim = null
  }

  /** Zoom by `factor` keeping the world point under (px, py) fixed. */
  zoomAtPx(px: number, py: number, factor: number, dw: number, dh: number) {
    const w = this.worldFromScreen(px, py, dw, dh)
    this.zoom = clampZoom(this.zoom * factor)
    const s = this.worldPerPx(dh)
    this.cx = w.x - (px - dw / 2) * s
    this.cy = w.y + (py - dh / 2) * s
    this.anim = null
  }

  /** Eased, log-space animated zoom/pan. */
  flyTo(v: View, dur = 1200) {
    this.anim = {
      from: this.view,
      to: { cx: v.cx, cy: v.cy, zoom: clampZoom(v.zoom) },
      t: 0,
      dur,
    }
  }

  /**
   * Advance the fly animation. Returns true while still animating.
   * Position is interpolated linearly, zoom logarithmically, with smoothstep easing.
   */
  update(dtMs: number): boolean {
    const a = this.anim
    if (!a) return false
    a.t += dtMs / a.dur
    if (a.t >= 1) {
      this.setView(a.to)
      return false
    }
    const e = a.t * a.t * (3 - 2 * a.t)
    this.cx = a.from.cx + (a.to.cx - a.from.cx) * e
    this.cy = a.from.cy + (a.to.cy - a.from.cy) * e
    this.zoom = a.from.zoom * Math.pow(a.to.zoom / a.from.zoom, e)
    return true
  }
}
