import type { FractalDefinition } from './types'

export const burningship: FractalDefinition = {
  id: 'burningship',
  name: 'Burning Ship',
  description: 'The Burning Ship: z ← (|Re z| + i|Im z|)² + c',
  glsl: `
vec4 f_init(vec4 point) {
  return dfc_from_float(0.0, 0.0);
}

vec4 f_c(vec4 point) {
  return point;
}

vec4 f_iterate(vec4 z, vec4 c) {
  vec4 w = vec4(df_abs(z.xy), df_abs(z.zw));
  return dfc_add(dfc_mul(w, w), c);
}
`,
  requiresJuliaC: false,
  params: [],
  defaultView: { cx: -0.45, cy: -0.5, zoom: 1 },
}
