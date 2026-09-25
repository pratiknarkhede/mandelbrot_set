import type { FractalDefinition } from './types'

export const julia: FractalDefinition = {
  id: 'julia',
  name: 'Julia',
  description: 'The quadratic Julia set z ← z² + c with fixed c',
  glsl: `
vec4 f_init(vec4 point) {
  return point;
}

vec4 f_c(vec4 point) {
  return u_juliaC;
}

vec4 f_iterate(vec4 z, vec4 c) {
  return dfc_add(dfc_mul(z, z), c);
}
`,
  requiresJuliaC: true,
  params: [],
  defaultView: { cx: 0, cy: 0, zoom: 1 },
}
