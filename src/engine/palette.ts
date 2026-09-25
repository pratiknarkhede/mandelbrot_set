/**
 * Palette engine: gradient presets, baking to a 256×1 RGBA texture,
 * and CSS gradient strings for UI swatches.
 */

export interface ColorStop {
  pos: number
  hex: string
}

export interface Palette {
  id: string
  name: string
  stops: ColorStop[]
}

export const PALETTES: Palette[] = [
  {
    id: 'aurora',
    name: 'Aurora',
    stops: [
      { pos: 0.0, hex: '#020b1c' },
      { pos: 0.16, hex: '#0b3d91' },
      { pos: 0.38, hex: '#00b3a4' },
      { pos: 0.58, hex: '#7cff9e' },
      { pos: 0.78, hex: '#b18cff' },
      { pos: 1.0, hex: '#101426' },
    ],
  },
  {
    id: 'ultra',
    name: 'Ultra',
    stops: [
      { pos: 0.0, hex: '#000764' },
      { pos: 0.16, hex: '#206bcb' },
      { pos: 0.42, hex: '#f2f0c9' },
      { pos: 0.6425, hex: '#ff5a01' },
      { pos: 0.8575, hex: '#02010a' },
      { pos: 1.0, hex: '#000000' },
    ],
  },
  {
    id: 'inferno',
    name: 'Inferno',
    stops: [
      { pos: 0.0, hex: '#000004' },
      { pos: 0.25, hex: '#420a68' },
      { pos: 0.5, hex: '#932667' },
      { pos: 0.75, hex: '#dd513a' },
      { pos: 0.95, hex: '#fca50a' },
      { pos: 1.0, hex: '#fcffa4' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    stops: [
      { pos: 0.0, hex: '#000212' },
      { pos: 0.3, hex: '#003f88' },
      { pos: 0.6, hex: '#00a6fb' },
      { pos: 0.85, hex: '#bfefff' },
      { pos: 1.0, hex: '#ffffff' },
    ],
  },
  {
    id: 'mono',
    name: 'Mono',
    stops: [
      { pos: 0.0, hex: '#000000' },
      { pos: 1.0, hex: '#ffffff' },
    ],
  },
]

export function getPalette(id: string): Palette {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0]
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const n = parseInt(full, 16)
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff]
}

/** Bake a palette into a 256×1 RGBA Uint8Array for the GPU palette texture. */
export function bakePalette(p: Palette): Uint8Array {
  const stops = [...p.stops].sort((a, b) => a.pos - b.pos)
  const out = new Uint8Array(256 * 4)
  const first = hexToRgb(stops[0].hex)
  const last = hexToRgb(stops[stops.length - 1].hex)

  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let rgb: [number, number, number]
    if (t <= stops[0].pos) {
      rgb = first
    } else if (t >= stops[stops.length - 1].pos) {
      rgb = last
    } else {
      rgb = first
      for (let j = 0; j < stops.length - 1; j++) {
        const a = stops[j]
        const b = stops[j + 1]
        if (t >= a.pos && t <= b.pos) {
          const k = (t - a.pos) / Math.max(b.pos - a.pos, 1e-9)
          const ca = hexToRgb(a.hex)
          const cb = hexToRgb(b.hex)
          rgb = [
            Math.round(ca[0] + (cb[0] - ca[0]) * k),
            Math.round(ca[1] + (cb[1] - ca[1]) * k),
            Math.round(ca[2] + (cb[2] - ca[2]) * k),
          ]
          break
        }
      }
    }
    out[i * 4] = rgb[0]
    out[i * 4 + 1] = rgb[1]
    out[i * 4 + 2] = rgb[2]
    out[i * 4 + 3] = 255
  }
  return out
}

/** CSS linear-gradient string for UI swatches. */
export function paletteCss(p: Palette): string {
  const stops = [...p.stops]
    .sort((a, b) => a.pos - b.pos)
    .map((s) => `${s.hex} ${Math.round(s.pos * 100)}%`)
  return `linear-gradient(to right, ${stops.join(', ')})`
}
