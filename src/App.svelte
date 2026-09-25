<script lang="ts">
  import Canvas from './components/Canvas.svelte'
  import TopBar from './components/TopBar.svelte'
  import ControlPanel from './components/ControlPanel.svelte'
  import ZoomHud from './components/ZoomHud.svelte'
  import JuliaInset from './components/JuliaInset.svelte'
  import LandmarkCard from './components/LandmarkCard.svelte'
  import { FRACTALS, getFractal } from './fractals/registry'
  import { PALETTES, paletteCss } from './engine/palette'
  import { LANDMARKS, getLandmark } from './atlas/landmarks'
  import { app, hud, selectFractal, saveBookmark, deleteBookmark } from './stores/app.svelte'

  let canvasRef = $state<Canvas>()

  /** Mobile bottom-sheet collapse state (the sheet otherwise eats the view) */
  let sheetOpen = $state(true)

  const fractalOptions = FRACTALS.map((f) => ({
    id: f.id,
    name: f.name,
    description: f.description,
  }))
  const paletteOptions = PALETTES.map((p) => ({
    id: p.id,
    name: p.name,
    css: paletteCss(p),
  }))

  const current = $derived(getFractal(app.fractalId))

  function onFractal(id: string) {
    selectFractal(id)
  }

  function onPalette(id: string) {
    app.paletteId = id
  }

  function onParam(id: string, v: number) {
    app.params[id] = v
  }

  function onJulia(re: number, im: number) {
    app.juliaC = { re, im }
  }

  function onIterations(v: number) {
    app.iterations = v
  }

  function onEscape(v: number) {
    app.escape = v
  }

  function onDensity(v: number) {
    app.density = v
  }

  function onCycleSpeed(v: number) {
    app.cycleSpeed = v
  }

  function onBookmark() {
    if (canvasRef) saveBookmark(canvasRef.snapshot())
  }

  function onExport() {
    canvasRef?.exportPNG()
  }

  function onToggleUi() {
    app.showUi = !app.showUi
  }

  /** Tour side effects (fractal switch, color cycling) live in Canvas. */
  function onTour() {
    app.touring = !app.touring
  }

  function onReset() {
    canvasRef?.resetView()
  }

  // ---------- Atlas landmarks ----------
  const activeLm = $derived(app.activeLandmark ? getLandmark(app.activeLandmark) : null)

  function onLandmark(id: string) {
    canvasRef?.flyToLandmark(getLandmark(id))
  }

  function closeLandmarkCard() {
    app.activeLandmark = null
  }

  function onBookmarkClick(id: string) {
    const b = app.bookmarks.find((x) => x.id === id)
    if (!b || !canvasRef) return
    // Apply settings first; the view comes last (Canvas consumes it).
    selectFractal(b.fractalId)
    app.params = { ...b.params }
    app.juliaC = { ...b.juliaC }
    app.iterations = b.iterations
    app.escape = b.escape
    app.paletteId = b.paletteId
    app.density = b.density
    app.cycleSpeed = b.cycleSpeed
    canvasRef.loadBookmarkView(b.fractalId, b.view)
  }

  function onBookmarkDelete(id: string) {
    deleteBookmark(id)
  }

  // Global keyboard shortcuts
  $effect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
      const k = e.key.toLowerCase()
      if (k >= '1' && k <= '5') {
        selectFractal(FRACTALS[Number(k) - 1].id)
      } else if (k === 'r') {
        canvasRef?.resetView()
      } else if (k === 'h') {
        app.showUi = !app.showUi
      } else if (k === 'escape') {
        app.showUi = true
      } else if (k === 'a') {
        // Cycle through the Atlas landmarks
        const idx = app.activeLandmark
          ? LANDMARKS.findIndex((l) => l.id === app.activeLandmark)
          : -1
        canvasRef?.flyToLandmark(LANDMARKS[(idx + 1) % LANDMARKS.length])
      } else if (k === 'b') {
        if (canvasRef) saveBookmark(canvasRef.snapshot())
      } else if (k === 'e') {
        canvasRef?.exportPNG()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })
</script>

<div class="app">
  <Canvas bind:this={canvasRef} />

  {#if app.showUi}
    <div class="topbar-wrap">
      <TopBar
        fractals={fractalOptions}
        fractalId={app.fractalId}
        palettes={paletteOptions}
        paletteId={app.paletteId}
        touring={app.touring}
        {onFractal}
        {onPalette}
        {onTour}
        {onReset}
        {onBookmark}
        {onExport}
        {onToggleUi}
      />
    </div>

    <div class="panel-wrap" class:collapsed={!sheetOpen}>
      <button
        class="sheet-toggle"
        type="button"
        aria-label={sheetOpen ? 'Collapse panel' : 'Expand panel'}
        onclick={() => (sheetOpen = !sheetOpen)}
      >
        <span aria-hidden="true">{sheetOpen ? '⌄' : '⌃'}</span>
      </button>
      <ControlPanel
        fractal={{ id: current.id, name: current.name, description: current.description }}
        params={current.params}
        paramValues={app.params}
        showJulia={current.requiresJuliaC}
        juliaC={app.juliaC}
        iterations={app.iterations}
        escape={app.escape}
        density={app.density}
        cycleSpeed={app.cycleSpeed}
        palettes={paletteOptions}
        paletteId={app.paletteId}
        landmarks={LANDMARKS}
        activeLandmarkId={app.activeLandmark}
        onLandmark={onLandmark}
        bookmarks={app.bookmarks}
        {onParam}
        {onJulia}
        {onIterations}
        {onEscape}
        {onDensity}
        {onCycleSpeed}
        {onPalette}
        {onBookmarkClick}
        {onBookmarkDelete}
      />
    </div>
  {/if}

  {#if !app.showUi}
    <div class="floating-tools">
      <button class="tool-btn" type="button" title="Show UI (H)" onclick={onToggleUi}>
        <span aria-hidden="true">👁</span>
      </button>
      <button class="tool-btn" type="button" title="Reset view (R)" onclick={onReset}>
        <span aria-hidden="true">⟲</span>
      </button>
    </div>
  {/if}

  {#if app.showUi}
    <div class="inset-wrap">
      <JuliaInset />
    </div>
  {/if}

  {#if activeLm}
    <div class="landmark-wrap">
      <LandmarkCard landmark={activeLm} onClose={closeLandmarkCard} />
    </div>
  {/if}

  <div class="hud-wrap">
    <ZoomHud re={hud.re} im={hud.im} mag={hud.mag} iter={hud.iter} fps={hud.fps} />
  </div>
</div>

<style>
  .app {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--bg);
  }

  .topbar-wrap {
    position: absolute;
    top: 14px;
    left: 14px;
    right: 14px;
    z-index: 10;
    pointer-events: none;
  }

  .topbar-wrap :global(*) {
    pointer-events: auto;
  }

  .panel-wrap {
    position: absolute;
    top: 74px;
    right: 14px;
    bottom: 14px;
    width: 330px;
    z-index: 10;
    pointer-events: none;
  }

  .panel-wrap :global(*) {
    pointer-events: auto;
  }

  /* Mobile bottom-sheet handle (hidden on desktop) */
  .sheet-toggle {
    display: none;
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 44px;
    height: 30px;
    align-items: center;
    justify-content: center;
    padding: 0;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-bottom: none;
    border-radius: 10px 10px 0 0;
    color: var(--text-dim);
    font-size: 16px;
    line-height: 1;
    cursor: pointer;
    transition: color 0.2s ease;
  }

  .sheet-toggle:hover {
    color: var(--text);
  }

  .hud-wrap {
    position: absolute;
    left: 14px;
    bottom: 14px;
    z-index: 10;
    pointer-events: none;
  }

  .hud-wrap :global(*) {
    pointer-events: auto;
  }

  /* Floating restore buttons when the UI chrome is hidden */
  .floating-tools {
    position: absolute;
    top: 14px;
    left: 14px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .tool-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .tool-btn:hover {
    border-color: var(--accent);
    background: rgba(124, 158, 255, 0.1);
  }

  /* Julia inset preview — above the HUD, bottom-left */
  .inset-wrap {
    position: absolute;
    left: 14px;
    bottom: 56px;
    z-index: 10;
    pointer-events: none;
  }

  .inset-wrap :global(*) {
    pointer-events: auto;
  }

  /* Landmark info card — bottom-center; visible even when the UI chrome
     is hidden (it narrates the tour in cinematic mode). */
  .landmark-wrap {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 12;
    pointer-events: none;
  }

  .landmark-wrap :global(*) {
    pointer-events: auto;
  }

  @media (max-width: 900px) {
    /* Notch/safe-area aware chrome */
    .topbar-wrap {
      top: max(10px, env(safe-area-inset-top));
      left: 10px;
      right: 10px;
    }

    /* Bottom sheet: collapsible so the fractal stays the star */
    .panel-wrap {
      top: auto;
      bottom: max(10px, env(safe-area-inset-bottom));
      left: 10px;
      right: 10px;
      width: auto;
      height: 42%;
      transition: height 0.25s ease;
    }

    .panel-wrap.collapsed {
      height: 42px;
      overflow: hidden;
    }

    .sheet-toggle {
      display: flex;
    }

    /* HUD rides just above the sheet; drops down when it's collapsed */
    .hud-wrap {
      top: auto;
      bottom: calc(42% + 30px);
      left: 10px;
    }

    .panel-wrap.collapsed ~ .hud-wrap {
      bottom: 64px;
    }

    /* Landmark card below the two-row topbar, full-width-ish */
    .landmark-wrap {
      bottom: auto;
      top: 128px;
      left: 10px;
      right: 10px;
      transform: none;
      max-width: none;
    }

    .inset-wrap {
      display: none;
    }
  }
</style>
