import type { FractalDefinition } from './types'

export const tricorn: FractalDefinition = {
  id: 'tricorn',
  name: 'Tricorn',
  description: 'The Tricorn (Mandelbar): z ← (conj z)² + c',
  glsl: `
vec4 f_init(vec4 point) {
  return dfc_from_float(0.0, 0.0);
}

vec4 f_c(vec4 point) {
  return point;
}

vec4 f_iterate(vec4 z, vec4 c) {
  vec4 w = dfc_conj(z);
  return dfc_add(dfc_mul(w, w), c);
}
`,
  requiresJuliaC: false,
  params: [],
  defaultView: { cx: 0, cy: 0, zoom: 1 },
}
