/**
 * FractalDefinition — the plug-in contract of the app.
 *
 * Every fractal is a small module that exports a FractalDefinition and is
 * registered in `registry.ts`. The engine never knows about specific
 * formulas; it only consumes this interface. Adding a new fractal
 * (or a future non-escape-time visualization) = one new file + one registry line.
 */

export interface FractalParam {
  /** Unique param id, e.g. "power" */
  id: string
  /** Human label shown in the UI */
  label: string
  min: number
  max: number
  step: number
  default: number
}

export interface FractalView {
  /** Center in the complex plane */
  cx: number
  cy: number
  /** Magnification, 1 = default span (~3.5 units tall) */
  zoom: number
}

export interface FractalDefinition {
  /** Unique id, e.g. "mandelbrot" */
  id: string
  /** Display name */
  name: string
  /** Short description shown in the UI */
  description: string
  /**
   * GLSL ES 3.00 chunk implementing the escape-time iteration.
   *
   * A complex double-float number ("dfc") is a `vec4`:
   *   vec4(reHi, reLo, imHi, imLo)
   *
   * The chunk MUST define these three functions:
   *
   *   vec4 f_init(vec4 point);            // z0 from the on-screen point
   *   vec4 f_c(vec4 point);              // c from the on-screen point
   *   vec4 f_iterate(vec4 z, vec4 c);     // z_{n+1} = F(z, c)
   *
   * Available in scope (provided by the shell):
   *   - the df64 library: df_add, df_sub, df_mul, df_div, df_neg, df_abs,
   *     dfc_add, dfc_sub, dfc_mul, dfc_conj, dfc_abs2, dfc_from_float, ...
   *   - uniforms: u_power (float), u_juliaC (vec4 dfc), u_escape (float)
   */
  glsl: string
  /** Whether this fractal exposes an interactive Julia c-value */
  requiresJuliaC: boolean
  /** Fractal-specific slider params (e.g. power for Multibrot) */
  params: FractalParam[]
  defaultView: FractalView
}
