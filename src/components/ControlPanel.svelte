<script lang="ts">
  import type { BookmarkItem, FractalOption, JuliaValue, PaletteOption } from './props';
  import type { Landmark } from '../atlas/landmarks';
  import ParamSlider from './ParamSlider.svelte';
  import PalettePicker from './PalettePicker.svelte';
  import CPad from './CPad.svelte';
  import BookmarkList from './BookmarkList.svelte';
  import AtlasList from './AtlasList.svelte';

  interface FractalParam {
    id: string;
    label: string;
    min: number;
    max: number;
    step: number;
  }

  interface Props {
    fractal: FractalOption;
    params: FractalParam[];
    paramValues: Record<string, number>;
    showJulia: boolean;
    juliaC: JuliaValue;
    iterations: number;
    escape: number;
    density: number;
    cycleSpeed: number;
    palettes: PaletteOption[];
    paletteId: string;
    landmarks: Landmark[];
    activeLandmarkId: string | null;
    bookmarks: BookmarkItem[];
    onParam: (id: string, v: number) => void;
    onJulia: (re: number, im: number) => void;
    onIterations: (v: number) => void;
    onEscape: (v: number) => void;
    onDensity: (v: number) => void;
    onCycleSpeed: (v: number) => void;
    onPalette: (id: string) => void;
    onLandmark: (id: string) => void;
    onBookmarkClick: (id: string) => void;
    onBookmarkDelete: (id: string) => void;
  }

  let {
    fractal,
    params,
    paramValues,
    showJulia,
    juliaC,
    iterations,
    escape,
    density,
    cycleSpeed,
    palettes,
    paletteId,
    landmarks,
    activeLandmarkId,
    bookmarks,
    onParam,
    onJulia,
    onIterations,
    onEscape,
    onDensity,
    onCycleSpeed,
    onPalette,
    onLandmark,
    onBookmarkClick,
    onBookmarkDelete
  }: Props = $props();
</script>

<aside class="panel">
  <section class="section">
    <h2 class="section-title">Formula</h2>
    <div class="fractal-head">
      <h3 class="fractal-name">{fractal.name}</h3>
      <p class="fractal-desc">{fractal.description}</p>
    </div>
    {#if params.length > 0}
      <div class="params">
        {#each params as p (p.id)}
          <ParamSlider
            label={p.label}
            min={p.min}
            max={p.max}
            step={p.step}
            value={paramValues[p.id] ?? 0}
            onInput={(v) => onParam(p.id, v)}
          />
        {/each}
      </div>
    {/if}
  </section>

  {#if showJulia}
    <section class="section">
      <h2 class="section-title">Julia constant</h2>
      <CPad value={juliaC} onPick={onJulia} />
    </section>
  {/if}

  <section class="section">
    <h2 class="section-title">Rendering</h2>
    <div class="params">
      <ParamSlider
        label="Iterations"
        min={100}
        max={5000}
        step={50}
        value={iterations}
        onInput={onIterations}
      />
      <p class="hint">Base detail — iterations auto-boost as you zoom (live count in the HUD).</p>
      <ParamSlider
        label="Escape radius"
        min={2}
        max={64}
        step={0.5}
        value={escape}
        onInput={onEscape}
      />
      <ParamSlider
        label="Color density"
        min={0.005}
        max={0.5}
        step={0.005}
        value={density}
        format={(v) => v.toFixed(3)}
        onInput={onDensity}
      />
      <ParamSlider
        label="Color cycle"
        min={0}
        max={0.5}
        step={0.005}
        value={cycleSpeed}
        onInput={onCycleSpeed}
      />
    </div>
  </section>

  <section class="section">
    <h2 class="section-title">Palette</h2>
    <PalettePicker {palettes} {paletteId} onPick={onPalette} />
  </section>

  <section class="section">
    <h2 class="section-title">Atlas — famous locations</h2>
    <AtlasList landmarks={landmarks} activeId={activeLandmarkId} onPick={onLandmark} />
  </section>

  <section class="section">
    <h2 class="section-title">Bookmarks</h2>
    <BookmarkList {bookmarks} {onBookmarkClick} {onBookmarkDelete} />
  </section>
</aside>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 22px;
    max-height: 100%;
    padding: 18px;
    overflow-y: auto;
    overscroll-behavior: contain;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    color: var(--text);
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }

  .panel::-webkit-scrollbar {
    width: 5px;
  }

  .panel::-webkit-scrollbar-track {
    background: transparent;
  }

  .panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
  }

  .panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .section-title {
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    font-variant: small-caps;
    color: var(--text-dim);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--panel-border);
  }

  .fractal-head {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .fractal-name {
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .fractal-desc {
    font-size: 12px;
    line-height: 1.55;
    color: var(--text-dim);
  }

  .params {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  @media (max-width: 900px) {
    .panel {
      padding: 12px 14px;
      gap: 14px;
    }

    .section {
      gap: 9px;
    }
  }

  .hint {
    font-size: 11px;
    line-height: 1.5;
    color: var(--text-dim);
    opacity: 0.75;
  }
</style>
