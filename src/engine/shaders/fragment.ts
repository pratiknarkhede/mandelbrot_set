import { DF64_GLSL } from './df64.glsl'

/**
 * Assembles the complete fragment shader: header + uniforms + DF64 library +
 * the fractal chunk (f_init / f_c / f_iterate) + main() escape loop.
 */
export function buildFragmentShader(fractalGlsl: string): string {
  return `#version 300 es

precision highp float;
precision highp int;

uniform vec2 u_res;      // drawing-buffer size in pixels
uniform vec2 u_ox;       // view-center x as df64 (hi, lo)
uniform vec2 u_oy;       // view-center y as df64 (hi, lo)
uniform vec2 u_scale;    // world units per pixel as df64 (hi, lo)
uniform float u_maxIter; // max iterations
uniform float u_escape; // escape radius (compared against squared magnitude)
uniform float u_power;   // formula power (2 for plain Mandelbrot)
uniform vec4 u_juliaC;   // Julia constant as complex df64
uniform sampler2D u_palette; // 256x1 RGBA palette texture
uniform float u_cycle;   // palette cycling phase, 0..1
uniform float u_density;  // color density multiplier

in vec2 v_uv;
out vec4 fragColor;

${DF64_GLSL}

${fractalGlsl}

void main() {
  // Screen point -> complex df64. gl_FragCoord.y points up, matching +im up.
  vec2 d = gl_FragCoord.xy - 0.5 * u_res;
  vec2 re = df_add(u_ox, df_mul(df(d.x), u_scale));
  vec2 im = df_add(u_oy, df_mul(df(d.y), u_scale));
  vec4 point = vec4(re.x, re.y, im.x, im.y);

  vec4 c = f_c(point);
  vec4 z = f_init(point);

  float n = 0.0;
  bool escaped = false;
  for (int i = 0; i < 100000; i++) {
    if (float(i) >= u_maxIter) break;
    z = f_iterate(z, c);
    vec2 m = dfc_abs2(z);
    if (m.x > u_escape * u_escape) {
      n = float(i) + 1.0;
      escaped = true;
      break;
    }
  }

  // Interior: never escaped -> solid black.
  if (!escaped) {
    fragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  // Smooth iteration count. Hi parts only; float32 is fine here.
  float mag = max(length(vec2(z.x, z.z)), 1.0001);
  float nu = n + 1.0 - log(log(mag)) / log(max(u_power, 2.0));

  float t = fract(nu * u_density + u_cycle);
  vec3 col = texture(u_palette, vec2(t, 0.5)).rgb;
  fragColor = vec4(col, 1.0);
}
`
}
