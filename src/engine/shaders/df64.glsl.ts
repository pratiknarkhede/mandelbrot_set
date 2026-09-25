/**
 * DF64_GLSL — double-float (df64) arithmetic library for GLSL ES 3.00.
 *
 * A df64 number is a `vec2(hi, lo)` of two float32s representing
 * hi + lo, giving ~46 bits of mantissa (~10^12 zoom depth).
 *
 * A complex double-float ("dfc") is a `vec4(reHi, reLo, imHi, imLo)`.
 *
 * Algorithms are the canonical Knuth two-sum / Dekker split & two-product,
 * as used in Bailey's QD double-double libraries. No `double`, no `fma`.
 */
export const DF64_GLSL: string = `
// ---------- df64: vec2(hi, lo) double-float arithmetic ----------

// Promote a float to df64.
vec2 df(float x) {
  return vec2(x, 0.0);
}

// Knuth two-sum: s = fl(a + b), e = exact round-off error.
vec2 two_sum(float a, float b) {
  float s = a + b;
  float v = s - a;
  float e = (a - (s - v)) + (b - v);
  return vec2(s, e);
}

// Quick two-sum: like two_sum but requires |a| >= |b|.
vec2 quick_two_sum(float a, float b) {
  float s = a + b;
  float e = b - (s - a);
  return vec2(s, e);
}

// Dekker split constant: 2^12 + 1 splits a 24-bit float32 mantissa
// into two 12-bit halves so their product is exact to float32.
const float SPLITTER = 4097.0;

// Dekker two-product: p = fl(a * b), e = exact error from split parts.
vec2 two_prod(float a, float b) {
  float p = a * b;
  float t = SPLITTER * a;
  float ah = t - (t - a);
  float al = a - ah;
  t = SPLITTER * b;
  float bh = t - (t - b);
  float bl = b - bh;
  float e = ((ah * bh - p) + ah * bl + al * bh) + al * bl;
  return vec2(p, e);
}

vec2 df_add(vec2 a, vec2 b) {
  vec2 s = two_sum(a.x, b.x);
  vec2 t = two_sum(a.y, b.y);
  s.y += t.x;
  s = quick_two_sum(s.x, s.y);
  s.y += t.y;
  return quick_two_sum(s.x, s.y);
}

vec2 df_neg(vec2 a) {
  return vec2(-a.x, -a.y);
}

vec2 df_sub(vec2 a, vec2 b) {
  return df_add(a, df_neg(b));
}

// abs of the represented number: negate both parts when hi < 0.
vec2 df_abs(vec2 a) {
  return (a.x < 0.0) ? vec2(-a.x, -a.y) : a;
}

vec2 df_mul(vec2 a, vec2 b) {
  vec2 p = two_prod(a.x, b.x);
  p.y += a.x * b.y + a.y * b.x;
  return quick_two_sum(p.x, p.y);
}

// Division: float reciprocal refined by one linearized Newton step,
// then a df64 multiply for the final quotient (~46 bits).
vec2 df_div(vec2 a, vec2 b) {
  float s1 = 1.0 / b.x;
  vec2 s = df(s1);
  vec2 r = df_sub(df(1.0), df_mul(b, s)); // residual 1 - b * s
  s = df_add(s, df_mul(df(s1), r));       // s + s1 * r  (one Newton step)
  return df_mul(a, s);
}

// ---------- dfc: complex double-float, vec4(reHi, reLo, imHi, imLo) ----------

vec4 dfc_from_float(float re, float im) {
  return vec4(re, 0.0, im, 0.0);
}

vec4 dfc_add(vec4 z, vec4 w) {
  return vec4(df_add(z.xy, w.xy), df_add(z.zw, w.zw));
}

vec4 dfc_sub(vec4 z, vec4 w) {
  return vec4(df_sub(z.xy, w.xy), df_sub(z.zw, w.zw));
}

// Full complex multiply from df ops: (ac - bd) + i(ad + bc),
// all four cross terms via df_mul, summed with df_add/df_sub.
vec4 dfc_mul(vec4 z, vec4 w) {
  vec2 re = df_sub(df_mul(z.xy, w.xy), df_mul(z.zw, w.zw));
  vec2 im = df_add(df_mul(z.xy, w.zw), df_mul(z.zw, w.xy));
  return vec4(re, im);
}

vec4 dfc_conj(vec4 z) {
  return vec4(z.x, z.y, -z.z, -z.w);
}

// |z|^2 as df64.
vec2 dfc_abs2(vec4 z) {
  return df_add(df_mul(z.xy, z.xy), df_mul(z.zw, z.zw));
}
`
