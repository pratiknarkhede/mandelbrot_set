import type { FractalDefinition } from './types'
import { mandelbrot } from './mandelbrot'
import { multibrot } from './multibrot'
import { julia } from './julia'
import { burningship } from './burningship'
import { tricorn } from './tricorn'

export const FRACTALS: FractalDefinition[] = [
  mandelbrot,
  multibrot,
  julia,
  burningship,
  tricorn,
]

export function getFractal(id: string): FractalDefinition {
  return FRACTALS.find((f) => f.id === id) ?? FRACTALS[0]
}
