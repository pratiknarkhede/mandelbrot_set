<script lang="ts">
  /**
   * Canvas — owns the WebGL renderer, camera, and all pointer/wheel
   * interactions. Reacts to the global app state (Svelte 5 effects) and
   * publishes stats into the `hud` store. Exposes instance methods
   * (snapshot / resetView / loadBookmarkView / exportPNG) for App via bind:this.
   */
  import { untrack } from 'svelte'
  import { FractalRenderer, type RenderSettings } from '../engine/renderer'
  import { Camera, MAX_ZOOM, type View } from '../engine/camera'
  import { bakePalette, getPalette } from '../engine/palette'
  import { getFractal } from '../fractals/registry'
  import { TOUR_STOPS, getLandmark, type Landmark } from '../atlas/landmarks'
  import { app, hud, selectFractal } from '../stores/app.svelte'

  let root: HTMLDivElement | null = null
  let canvasEl: HTMLCanvasElement | null = null

  let webglError = $state('')

  let renderer: FractalRenderer | null = null
  const camera = new Camera()

  /** View applied by the next fractal switch (bookmark jump across fractals). */
  let pendingView: View | null = null
  let lastFractalId: string | null = null

  let cyclePhase = 0
  let dirty = true
  let quality = 1
  let lastInteract = 0
  let cssW = 1
  let cssH = 1
  let dpr = 1

  let raf = 0
  let lastFrame = 0
  let fpsEma = 60

  const pointers = new Map<number, { x: number; y: number }>()
  let pinchDist = 0
  let juliaDragging = false

  // ---------- cinematic auto-tour (finite: one narrated lap, then stops) ----------
  /**
   * The tour's itinerary is the curated Atlas (atlas/landmarks.ts) — every
   * stop carries its own arrival zoom, narrated info card, and a dive target
   * tuned to what the GPU can render RICH in real time. Beyond ~1e6 the
   * iteration counts needed to resolve filaments make frames take seconds
   * and the image collapses into flat color mush.
   */

  /** Lower render resolution while diving — the freed GPU budget goes
   *  into iterations (detail), which is what actually matters on screen. */
  const TOUR_DIVE_QUALITY = 0.55
  /** Hard safety valve: the tour ALWAYS ends on its own. */
  const TOUR_MAX_MS = 240_000

  type TourPhase = 'idle' | 'out' | 'to' | 'dive' | 'hold'
  let tourPhase: TourPhase = 'idle'
  let tourIndex = 0
  let tourHold = 0
  let tourElapsed = 0
  let savedCycleSpeed = 0
  let savedIterations = 0
  /** True while a landmark fly-in is underway (lighter frames in flight,
   *  full resolution snapped on arrival). */
  let landmarkFlight = false
  /** True while the tour itself is switching fractals — suppresses auto-cancel. */
  let tourSwitchingFractal = false

  function tourStart() {
    if (tourPhase !== 'idle') return
    tourIndex = 0
    tourElapsed = 0
    const stop = TOUR_STOPS[0]
    savedCycleSpeed = app.cycleSpeed
    savedIterations = app.iterations
    app.cycleSpeed = Math.max(app.cycleSpeed, 0.035)
    // Tour dives need a much higher iteration base than interactive zooming —
    // this is what keeps deep structure from flattening into single-color mush.
    app.iterations = Math.max(app.iterations, 1000)
    app.activeLandmark = stop.id // narration card for the first stop
    if (app.fractalId !== stop.fractalId) {
      // Tour stops are Mandelbrot territory — switch over.
      tourSwitchingFractal = true
      pendingView = { cx: stop.cx, cy: stop.cy, zoom: stop.zoom }
      selectFractal(stop.fractalId)
    } else {
      camera.setView({ cx: stop.cx, cy: stop.cy, zoom: stop.zoom })
    }
    setQuality(TOUR_DIVE_QUALITY)
    tourPhase = 'dive'
    dirty = true
  }

  function tourEnd() {
    if (tourPhase === 'idle') return
    tourPhase = 'idle'
    app.cycleSpeed = savedCycleSpeed
    app.iterations = savedIterations
    app.activeLandmark = null // narration over
    setQuality(1)
    dirty = true
  }

  function cancelTour() {
    if (app.touring) app.touring = false // touring effect runs tourEnd()
  }

  /** Advance the tour one frame. Camera fly animations are advanced by tick's camera.update. */
  function tourStep(dt: number) {
    tourElapsed += dt
    if (tourElapsed > TOUR_MAX_MS) {
      // Safety valve — the tour must never run forever.
      app.touring = false
      return
    }
    const stop = TOUR_STOPS[tourIndex % TOUR_STOPS.length]
    const stopDepth = stop.diveTo ?? stop.zoom * 4
    if (tourPhase === 'dive') {
      // Continuous logarithmic dive (~55% zoom growth per second).
      const k = Math.exp((dt / 1000) * 0.55)
      const ease = 1 - Math.exp(-dt / 600)
      camera.cx += (stop.cx - camera.cx) * ease
      camera.cy += (stop.cy - camera.cy) * ease
      camera.zoom = Math.min(camera.zoom * k, stopDepth, MAX_ZOOM)
      if (camera.zoom >= stopDepth) {
        tourPhase = 'hold'
        tourHold = 3000
        setQuality(1) // full-res, full-detail hold on the deep view
      }
    } else if (tourPhase === 'hold') {
      tourHold -= dt
      if (tourHold <= 0) {
        tourIndex++
        camera.flyTo({ cx: -0.6, cy: 0, zoom: 1 }, 2600) // pull out to overview
        tourPhase = 'out'
      }
    } else if (tourPhase === 'out') {
      if (!camera.animating) {
        if (tourIndex >= TOUR_STOPS.length) {
          // Lap complete — end the tour parked at the overview.
          app.touring = false
          return
        }
        const next = TOUR_STOPS[tourIndex % TOUR_STOPS.length]
        camera.flyTo({ cx: next.cx, cy: next.cy, zoom: next.zoom }, 2600)
        tourPhase = 'to'
      }
    } else if (tourPhase === 'to') {
      if (!camera.animating) {
        app.activeLandmark = stop.id // announce the next narration card
        setQuality(TOUR_DIVE_QUALITY)
        tourPhase = 'dive'
      }
    }
  }

  const dprOf = () => Math.min(window.devicePixelRatio || 1, 2)

  /**
   * Full-resolution device dimensions — the canonical reference space for
   * ALL screen↔world math. The canvas backing buffer shrinks during
   * interaction (quality scale), so using canvas.width/height here would
   * mix coordinate scales and break zoom-toward-cursor anchoring.
   */
  const devW = () => Math.max(Math.round(cssW * dpr), 1)
  const devH = () => Math.max(Math.round(cssH * dpr), 1)

  /**
   * Iterations auto-boosted with zoom depth — the "seemingly infinite" feel.
   * Escape-time fractals need roughly O(log zoom) more iterations as you
   * dive; a fixed count paints deep regions solid long before the df64
   * precision wall (~10^13). Base comes from the slider; depth does the rest.
   */
  /**
   * Iteration floor for the active landmark — deep landmarks need far more
   * iterations than the default slider provides or their structure collapses
   * into flat color. Applies while the landmark's card is open.
   */
  function activeIterBase(): number {
    const id = app.activeLandmark
    return id ? (getLandmark(id).iterBase ?? 0) : 0
  }

  function effectiveIterations(): number {
    const depth = Math.max(Math.log10(Math.max(camera.zoom, 1)), 0)
    // During tours the ceiling is lower: a frame at 30k+ iterations takes
    // seconds and the "cinematic" becomes a slideshow of flat colors.
    const cap = app.touring ? 12000 : 50000
    const base = Math.max(app.iterations, activeIterBase())
    return Math.min(Math.round(base * (1 + 2.2 * depth)), cap)
  }

  function settings(): RenderSettings {
    return {
      iterations: effectiveIterations(),
      escape: app.escape,
      power: app.params['power'] ?? 2,
      juliaC: app.juliaC,
      density: app.density,
      cycle: cyclePhase,
    }
  }

  function setQuality(q: number) {
    if (quality === q) return
    quality = q
    renderer?.resize(cssW, cssH, q)
    dirty = true
  }

  /**
   * Progressive quality ladder:
   *   0.65 — while the user is actively interacting (was 0.4, which caused
   *          the chunky "blurry pixels" feel on standard-DPR screens)
   *   1.0  — 160ms after the last gesture, full resolution
   *   1.5  — after 700ms of stillness, supersampled idle pass: the GPU
   *          renders 1.5× over-resolution and the browser downscales it,
   *          giving a crisper image than native rendering.
   */
  function beginInteract() {
    lastInteract = performance.now()
    setQuality(0.65)
  }

  function refreshHud(px?: number, py?: number) {
    if (!renderer || !canvasEl) return
    hud.mag = camera.zoom
    hud.iter = effectiveIterations()
    if (px !== undefined && py !== undefined) {
      const w = camera.worldFromScreen(px * dpr, py * dpr, devW(), devH())
      hud.re = w.x
      hud.im = w.y
    } else {
      hud.re = camera.cx
      hud.im = camera.cy
    }
  }

  // ---------- mount / unmount: renderer + render loop + observers ----------
  $effect(() => {
    const c = canvasEl
    const wrapper = root
    if (!c || !wrapper) return

    dpr = dprOf()
    try {
      renderer = new FractalRenderer(c)
    } catch (err) {
      webglError = err instanceof Error ? err.message : 'WebGL2 is not supported.'
      return
    }

    const rect = wrapper.getBoundingClientRect()
    cssW = Math.max(rect.width, 1)
    cssH = Math.max(rect.height, 1)
    renderer.resize(cssW, cssH, quality)

    const ro = new ResizeObserver(() => {
      const r = wrapper.getBoundingClientRect()
      cssW = Math.max(r.width, 1)
      cssH = Math.max(r.height, 1)
      dpr = dprOf()
      renderer?.resize(cssW, cssH, quality)
      dirty = true
    })
    ro.observe(wrapper)

    // Wheel needs a non-passive native listener for preventDefault.
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (!renderer || !c) return
      cancelTour()
      landmarkFlight = false
      beginInteract()
      // Normalize wheel units: Firefox reports lines (mode 1) or pages (mode 2).
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1
      const factor = Math.exp(-e.deltaY * unit * 0.002)
      camera.zoomAtPx(e.offsetX * dpr, e.offsetY * dpr, factor, devW(), devH())
      dirty = true
      refreshHud(e.offsetX, e.offsetY)
    }
    c.addEventListener('wheel', onWheel, { passive: false })

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick)
      const dt = lastFrame ? Math.min(t - lastFrame, 100) : 16.7
      lastFrame = t
      if (!renderer) return
      const now = performance.now()

      const animating = camera.update(dt)
      if (animating) dirty = true

      // Async callback reads are not effect-tracked — safe here.
      if (app.cycleSpeed > 0) {
        cyclePhase = (cyclePhase + (app.cycleSpeed * dt) / 1000) % 1
        dirty = true
      }

      if (app.touring && tourPhase !== 'idle') {
        tourStep(dt)
        dirty = true
      }

      // Landmark arrival: snap back to full resolution once the flight ends.
      if (landmarkFlight && !animating) {
        landmarkFlight = false
        setQuality(1)
      }

      // Progressive sharpening: full res 160ms after the last gesture,
      // then a supersampled pass once the view is truly still.
      // Guards: during a tour quality is managed by tourStep; during a
      // landmark flight it snaps on arrival. Beyond ~40k effective
      // iterations a full-res frame can take seconds and risks tripping the
      // GPU watchdog (context loss) — extreme-depth views deliberately
      // stay at interactive resolution: depth over sharpness at the frontier.
      // Supersampling likewise stops past 10k iterations.
      if (
        !app.touring &&
        !landmarkFlight &&
        quality < 1 &&
        now - lastInteract > 160 &&
        effectiveIterations() <= 40000
      ) {
        setQuality(1)
      } else if (
        quality === 1 &&
        !animating &&
        !app.touring &&
        !landmarkFlight &&
        now - lastInteract > 700 &&
        effectiveIterations() < 10000
      ) {
        setQuality(1.5)
      }

      if (dirty) {
        renderer.render(camera, settings())
        dirty = false
        fpsEma = fpsEma * 0.9 + (1000 / Math.max(dt, 0.1)) * 0.1
        hud.fps = Math.round(fpsEma)
        hud.mag = camera.zoom
        hud.iter = effectiveIterations()
        if (app.touring) {
          hud.re = camera.cx
          hud.im = camera.cy
        }
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      c.removeEventListener('wheel', onWheel)
      renderer = null
    }
  })

  // ---------- fractal change → recompile shader, reset/consume view ----------
  $effect(() => {
    const id = app.fractalId
    if (!renderer) return
    if (id === lastFractalId) return
    const f = getFractal(id)
    lastFractalId = id
    renderer.setFractal(f)
    camera.setView(pendingView ?? f.defaultView)
    pendingView = null
    // A user-initiated fractal switch mid-tour ends the tour.
    if (app.touring && !tourSwitchingFractal) app.touring = false
    tourSwitchingFractal = false
    dirty = true
    refreshHud()
  })

  // ---------- tour start/stop (side effects untracked) ----------
  $effect(() => {
    const touring = app.touring
    if (touring) untrack(tourStart)
    else untrack(tourEnd)
  })

  // ---------- numeric settings → just flag a redraw ----------
  $effect(() => {
    void app.iterations
    void app.escape
    void app.density
    void app.juliaC.re
    void app.juliaC.im
    void app.params['power']
    dirty = true
  })

  // ---------- palette change → rebake texture ----------
  $effect(() => {
    const id = app.paletteId
    renderer?.setPalette(bakePalette(getPalette(id)))
    dirty = true
  })

  // ---------- pointer interactions ----------
  function pickJulia(e: PointerEvent) {
    if (!canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    const w = camera.worldFromScreen(
      (e.clientX - rect.left) * dpr,
      (e.clientY - rect.top) * dpr,
      devW(),
      devH(),
    )
    app.juliaC = { re: w.x, im: w.y }
  }

  function onPointerDown(e: PointerEvent) {
    if (!renderer || !canvasEl) return
    cancelTour()
    landmarkFlight = false
    canvasEl.setPointerCapture(e.pointerId)
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    beginInteract()
    if (e.shiftKey && getFractal(app.fractalId).requiresJuliaC) {
      juliaDragging = true
      pickJulia(e)
    }
  }

  function onPointerMove(e: PointerEvent) {
    if (!renderer || !canvasEl) return
    const rect = canvasEl.getBoundingClientRect()
    refreshHud(e.clientX - rect.left, e.clientY - rect.top)

    // Plain hover (no button held): HUD updates only, never pan.
    if (!pointers.has(e.pointerId)) return

    if (juliaDragging && e.shiftKey) {
      pickJulia(e)
      return
    }

    if (pointers.size === 2) {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      const [a, b] = [...pointers.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      if (pinchDist > 0 && dist > 0) {
        const midX = (a.x + b.x) / 2 - rect.left
        const midY = (a.y + b.y) / 2 - rect.top
        camera.zoomAtPx(midX * dpr, midY * dpr, dist / pinchDist, devW(), devH())
        dirty = true
        beginInteract()
      }
      pinchDist = dist
      return
    }

    // Single pressed pointer → pan by the pointer's own last position.
    const prev = pointers.get(e.pointerId)
    if (prev) {
      const dx = (e.clientX - prev.x) * dpr
      const dy = (e.clientY - prev.y) * dpr
      camera.panPx(dx, dy, devH())
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
      dirty = true
      beginInteract()
    }
  }

  function onPointerUp(e: PointerEvent) {
    pointers.delete(e.pointerId)
    if (pointers.size < 2) pinchDist = 0
    juliaDragging = false
  }

  function onDblClick(e: MouseEvent) {
    if (!renderer || !canvasEl) return
    cancelTour()
    // Full-resolution flight: no beginInteract() here — fly-to is the
    // cinematic moment and should stay sharp the whole way.
    const rect = canvasEl.getBoundingClientRect()
    const w = camera.worldFromScreen(
      (e.clientX - rect.left) * dpr,
      (e.clientY - rect.top) * dpr,
      devW(),
      devH(),
    )
    camera.flyTo({ cx: w.x, cy: w.y, zoom: camera.zoom * 4 })
    dirty = true
  }

  // ---------- instance API (used by App via bind:this) ----------
  export function snapshot(): View {
    return camera.view
  }

  export function resetView() {
    cancelTour()
    camera.flyTo(getFractal(app.fractalId).defaultView)
    dirty = true
  }

  /**
   * Jump to a bookmark: if it targets a different fractal, stash the view so
   * the fractal-change effect applies it instead of the default view;
   * otherwise fly straight there.
   */
  export function loadBookmarkView(fractalId: string, view: View) {
    cancelTour()
    if (fractalId === app.fractalId) {
      camera.flyTo(view)
      dirty = true
    } else {
      pendingView = view
      app.fractalId = fractalId
    }
  }

  /**
   * Fly to an Atlas landmark and open its info card.
   * The flight renders a little lighter (landmark views boost iterations);
   * full resolution snaps in on arrival.
   */
  export function flyToLandmark(lm: Landmark) {
    cancelTour()
    app.activeLandmark = lm.id
    if (lm.fractalId !== app.fractalId) {
      pendingView = { cx: lm.cx, cy: lm.cy, zoom: lm.zoom }
      selectFractal(lm.fractalId)
    } else {
      camera.flyTo({ cx: lm.cx, cy: lm.cy, zoom: lm.zoom })
    }
    setQuality(0.65)
    landmarkFlight = true
    dirty = true
  }

  export function exportPNG() {
    if (!renderer || !canvasEl) return
    setQuality(1)
    renderer.render(camera, settings())
    canvasEl.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fractal-${app.fractalId}-${Date.now()}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }, 'image/png')
    dirty = true
  }
</script>

<div class="canvas-root" bind:this={root}>
  <canvas
    bind:this={canvasEl}
    onpointerdown={onPointerDown}
    onpointermove={onPointerMove}
    onpointerup={onPointerUp}
    onpointercancel={onPointerUp}
    ondblclick={onDblClick}
    oncontextmenu={(e) => e.preventDefault()}
  ></canvas>
  {#if webglError}
    <div class="webgl-error">
      <h2>WebGL2 unavailable</h2>
      <p>{webglError}</p>
      <p class="hint">Try a recent Chrome, Edge, or Firefox with hardware acceleration enabled.</p>
    </div>
  {/if}
</div>

<style>
  .canvas-root {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  canvas {
    width: 100%;
    height: 100%;
    display: block;
    cursor: grab;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    /* Long-press on touch: no callout sheet, no selection */
    -webkit-touch-callout: none;
  }

  canvas:active {
    cursor: grabbing;
  }

  .webgl-error {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px;
    text-align: center;
    background: var(--bg);
  }

  .webgl-error h2 {
    font-size: 18px;
    color: var(--text);
  }

  .webgl-error p {
    color: var(--text-dim);
    max-width: 420px;
    line-height: 1.6;
  }

  .webgl-error .hint {
    font-size: 12px;
    opacity: 0.7;
  }
</style>
