import type { FractalDefinition } from './types'

export const mandelbrot: FractalDefinition = {
  id: 'mandelbrot',
  name: 'Mandelbrot',
  description: 'The classic z ← z² + c',
  glsl: `
vec4 f_init(vec4 point) {
  return dfc_from_float(0.0, 0.0);
}

vec4 f_c(vec4 point) {
  return point;
}

vec4 f_iterate(vec4 z, vec4 c) {
  return dfc_add(dfc_mul(z, z), c);
}
`,
  requiresJuliaC: false,
  params: [],
  defaultView: { cx: -0.6, cy: 0, zoom: 1 },
}
