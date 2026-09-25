<script lang="ts">
  /**
   * JuliaInset — a small live Julia set that follows the cursor while you
   * explore the Mandelbrot (or Multibrot) set. Every point you hover is a
   * valid Julia constant c; this preview renders that set in real time,
   * using the same palette and the matching z^n power. Click it to open
   * the full Julia view at that c.
   */
  import { FractalRenderer, type RenderSettings } from '../engine/renderer'
  import { Camera } from '../engine/camera'
  import { bakePalette, getPalette } from '../engine/palette'
  import type { FractalDefinition } from '../fractals/types'
  import { app, hud, selectFractal } from '../stores/app.svelte'

  /** The classic duality only exists for c = point fractals. */
  const visible = $derived(app.fractalId === 'mandelbrot' || app.fractalId === 'multibrot')

  /** Reactive: the canvas unmounts/remounts when `visible` flips, and the
   * mount effect must re-run to build a fresh renderer for the new element. */
  let canvasEl = $state<HTMLCanvasElement | null>(null)
  let renderer: FractalRenderer | null = null
  let failed = $state(false)
  const camera = new Camera({ cx: 0, cy: 0, zoom: 1 })

  let phase = 0
  let dirty = true
  let raf = 0
  let lastT = 0

  /**
   * Julia set of z ← z^n + c with z0 = point (the true dual of whatever
   * Mandelbrot variant is active — u_power carries the exponent).
   */
  const juliaPreview: FractalDefinition = {
    id: 'julia-preview',
    name: 'Julia preview',
    description: 'Live Julia preview of the hovered point',
    requiresJuliaC: true,
    params: [],
    defaultView: { cx: 0, cy: 0, zoom: 1 },
    glsl: `
vec4 f_init(vec4 point) {
  return point;
}

vec4 f_c(vec4 point) {
  return u_juliaC;
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
  }

  function settings(): RenderSettings {
    return {
      iterations: 250,
      escape: 4,
      power: app.params['power'] ?? 2,
      juliaC: { re: hud.re, im: hud.im },
      density: app.density,
      cycle: phase,
    }
  }

  // Mount: own renderer + tiny render loop (runs only while visible).
  $effect(() => {
    const c = canvasEl
    if (!c) return
    try {
      renderer = new FractalRenderer(c)
      renderer.setFractal(juliaPreview)
      renderer.resize(190, 190, 1)
    } catch {
      renderer = null
      failed = true
      return
    }

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const dt = lastT ? Math.min(t - lastT, 100) : 16.7
      lastT = t
      if (!renderer) return
      if (app.cycleSpeed > 0) {
        phase = (phase + (app.cycleSpeed * dt) / 1000) % 1
        dirty = true
      }
      if (dirty) {
        renderer.render(camera, settings())
        dirty = false
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      renderer = null
    }
  })

  // Inputs that change the preview → rebake palette / flag redraw.
  $effect(() => {
    void hud.re
    void hud.im
    void app.density
    void app.escape
    void app.params['power']
    const pid = app.paletteId
    renderer?.setPalette(bakePalette(getPalette(pid)))
    dirty = true
  })

  const cText = $derived(
    `${hud.re < 0 ? '−' : '+'}${Math.abs(hud.re).toFixed(4)} ${hud.im < 0 ? '−' : '+'}${Math.abs(hud.im).toFixed(4)}i`,
  )

  function openJulia() {
    app.juliaC = { re: hud.re, im: hud.im }
    selectFractal('julia')
  }
</script>

{#if visible && !failed}
  <div class="inset" role="button" tabindex="0" title="Click to explore this Julia set" onclick={openJulia} onkeydown={(e) => e.key === 'Enter' && openJulia()}>
    <div class="inset-head">
      <span class="inset-title">Julia preview</span>
      <span class="inset-c">{cText}</span>
    </div>
    <canvas bind:this={canvasEl} width="190" height="190" aria-label="Julia set preview of the hovered point"></canvas>
    <p class="inset-hint">click to explore this Julia set</p>
  </div>
{/if}

<style>
  .inset {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: border-color 0.2s ease;
  }

  .inset:hover {
    border-color: var(--accent);
  }

  .inset-head {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
  }

  .inset-title {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-variant: small-caps;
    color: var(--text-dim);
  }

  .inset-c {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 10.5px;
    color: var(--accent);
  }

  canvas {
    width: 190px;
    height: 190px;
    display: block;
    border-radius: 8px;
    background: #000;
  }

  .inset-hint {
    font-size: 10.5px;
    text-align: center;
    color: var(--text-dim);
    opacity: 0.7;
  }

  .inset:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(124, 158, 255, 0.25);
  }
</style>
