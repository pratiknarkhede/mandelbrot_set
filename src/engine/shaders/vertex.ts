/**
 * Trivial `#version 300 es` vertex shader: an attribute-less fullscreen
 * triangle driven by gl_VertexID (3 vertices cover clip space).
 */
export const VERTEX_SHADER: string = `#version 300 es

out vec2 v_uv;

void main() {
  // Vertex 0: (-1,-1), vertex 1: (3,-1), vertex 2: (-1,3).
  vec2 p = vec2(
    (gl_VertexID == 1) ? 3.0 : -1.0,
    (gl_VertexID == 2) ? 3.0 : -1.0
  );
  v_uv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`
