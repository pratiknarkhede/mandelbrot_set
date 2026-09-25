/**
 * FractalRenderer — WebGL2 pipeline for escape-time fractals.
 *
 * One attribute-less fullscreen triangle, one fragment shader per
 * FractalDefinition (compiled on fractal change), one 256×1 palette
 * texture. Numeric settings travel via uniforms every frame.
 */

import { VERTEX_SHADER } from './shaders/vertex'
import { buildFragmentShader } from './shaders/fragment'
import type { FractalDefinition } from '../fractals/types'
import type { Camera } from './camera'

export interface RenderSettings {
  iterations: number
  /** Escape radius (compared against squared magnitude) */
  escape: number
  /** Formula power (2 unless the fractal exposes a power param) */
  power: number
  juliaC: { re: number; im: number }
  density: number
  /** Palette cycling phase, 0..1 */
  cycle: number
}

/** Split a JS double into a (hi, lo) float32 pair — the JS side of df64. */
export function split(x: number): [number, number] {
  const hi = Math.fround(x)
  return [hi, Math.fround(x - hi)]
}

const UNIFORM_NAMES = [
  'u_res',
  'u_ox',
  'u_oy',
  'u_scale',
  'u_maxIter',
  'u_escape',
  'u_power',
  'u_juliaC',
  'u_palette',
  'u_cycle',
  'u_density',
] as const

export class FractalRenderer {
  readonly gl: WebGL2RenderingContext

  private canvas: HTMLCanvasElement
  private program: WebGLProgram | null = null
  private u: Record<string, WebGLUniformLocation | null> = {}
  private paletteTex: WebGLTexture
  private vao: WebGLVertexArrayObject

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl2', {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
      powerPreference: 'high-performance',
    })
    if (!gl) {
      throw new Error('WebGL2 is not supported by this browser or GPU.')
    }
    this.gl = gl

    this.vao = gl.createVertexArray()!
    gl.bindVertexArray(this.vao)

    this.paletteTex = gl.createTexture()!
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      256,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array(256 * 4),
    )
  }

  /** Compile + link the shell shader with the fractal's GLSL chunk. */
  setFractal(def: FractalDefinition) {
    const gl = this.gl
    const vs = this.compile(gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = this.compile(gl.FRAGMENT_SHADER, buildFragmentShader(def.glsl))
    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      const log = gl.getProgramInfoLog(prog) ?? 'unknown link error'
      gl.deleteProgram(prog)
      throw new Error(`Fractal shader link failed: ${log}`)
    }
    if (this.program) gl.deleteProgram(this.program)
    this.program = prog
    this.u = {}
    for (const name of UNIFORM_NAMES) {
      this.u[name] = gl.getUniformLocation(prog, name)
    }
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl
    const sh = gl.createShader(type)!
    gl.shaderSource(sh, src)
    gl.compileShader(sh)
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(sh) ?? 'unknown error'
      gl.deleteShader(sh)
      throw new Error(`Shader compile failed: ${log}`)
    }
    return sh
  }

  setPalette(rgba: Uint8Array) {
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTex)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba)
  }

  /** Size the drawing buffer from CSS dimensions × DPR × quality scale. */
  resize(cssW: number, cssH: number, scale = 1) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const w = Math.max(Math.round(cssW * dpr * scale), 1)
    const h = Math.max(Math.round(cssH * dpr * scale), 1)
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w
      this.canvas.height = h
    }
  }

  render(camera: Camera, s: RenderSettings) {
    const gl = this.gl
    const prog = this.program
    if (!prog) return
    const canvas = this.canvas

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.useProgram(prog)
    gl.bindVertexArray(this.vao)

    const [oxHi, oxLo] = split(camera.cx)
    const [oyHi, oyLo] = split(camera.cy)
    const [sHi, sLo] = split(camera.worldPerPx(canvas.height))
    const [cReHi, cReLo] = split(s.juliaC.re)
    const [cImHi, cImLo] = split(s.juliaC.im)

    gl.uniform2f(this.u.u_res, canvas.width, canvas.height)
    gl.uniform2f(this.u.u_ox, oxHi, oxLo)
    gl.uniform2f(this.u.u_oy, oyHi, oyLo)
    gl.uniform2f(this.u.u_scale, sHi, sLo)
    gl.uniform1f(this.u.u_maxIter, s.iterations)
    gl.uniform1f(this.u.u_escape, s.escape)
    gl.uniform1f(this.u.u_power, s.power)
    gl.uniform4f(this.u.u_juliaC, cReHi, cReLo, cImHi, cImLo)
    gl.uniform1f(this.u.u_cycle, s.cycle)
    gl.uniform1f(this.u.u_density, s.density)

    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, this.paletteTex)
    if (this.u.u_palette) gl.uniform1i(this.u.u_palette, 0)

    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }
}
