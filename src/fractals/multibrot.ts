import type { FractalDefinition } from './types'

export const multibrot: FractalDefinition = {
  id: 'multibrot',
  name: 'Multibrot',
  description: 'Generalized z ← zⁿ + c for integer power n',
  glsl: `
vec4 f_init(vec4 point) {
  return dfc_from_float(0.0, 0.0);
}

vec4 f_c(vec4 point) {
  return point;
}

vec4 f_iterate(vec4 z, vec4 c) {
  vec4 acc = dfc_from_float(1.0, 0.0);
  int n = int(u_power);
  for (int i = 0; i < n; i++) {
    acc = dfc_mul(acc, z);
  }
  return dfc_add(acc, c);
}
`,
  requiresJuliaC: false,
  params: [
    { id: 'power', label: 'Power n', min: 2, max: 8, step: 1, default: 3 },
  ],
  defaultView: { cx: -0.6, cy: 0, zoom: 1 },
}
