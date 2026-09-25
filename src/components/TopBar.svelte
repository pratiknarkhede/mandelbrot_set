<script lang="ts">
  import type { FractalOption, PaletteOption } from './props';

  interface Props {
    fractals: FractalOption[];
    fractalId: string;
    palettes: PaletteOption[];
    paletteId: string;
    touring: boolean;
    onFractal: (id: string) => void;
    onPalette: (id: string) => void;
    onTour: () => void;
    onReset: () => void;
    onBookmark: () => void;
    onExport: () => void;
    onToggleUi: () => void;
  }

  let {
    fractals,
    fractalId,
    palettes,
    paletteId,
    touring,
    onFractal,
    onPalette,
    onTour,
    onReset,
    onBookmark,
    onExport,
    onToggleUi
  }: Props = $props();

  const currentFractal = $derived(fractals.find((f) => f.id === fractalId));
</script>

<div class="topbar">
  <div class="wordmark">
    <span class="glyph">∞</span>
    <h1 class="title">Fractal Explorer</h1>
  </div>

  <div class="selectors">
    <select
      class="glass-pill"
      value={fractalId}
      onchange={(e) => onFractal(e.currentTarget.value)}
      title={currentFractal?.description ?? ''}
      aria-label="Fractal"
    >
      {#each fractals as f (f.id)}
        <option value={f.id}>{f.name}</option>
      {/each}
    </select>

    <select
      class="glass-pill"
      value={paletteId}
      onchange={(e) => onPalette(e.currentTarget.value)}
      aria-label="Palette"
    >
      {#each palettes as p (p.id)}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
  </div>

  <div class="actions">
    <button
      class="icon-btn"
      class:active={touring}
      type="button"
      title={touring ? 'Stop tour (any interaction)' : 'Cinematic tour — endless dive through famous locations'}
      onclick={() => onTour()}
    >
      <span class="icon" aria-hidden="true">{touring ? '⏹' : '▶'}</span>
      <span class="btn-label">{touring ? 'Stop' : 'Tour'}</span>
    </button>
    <button class="icon-btn" type="button" title="Reset view (R)" onclick={() => onReset()}>
      <span class="icon" aria-hidden="true">⟲</span>
      <span class="btn-label">Reset</span>
    </button>
    <button class="icon-btn" type="button" title="Save view" onclick={() => onBookmark()}>
      <span class="icon" aria-hidden="true">🔖</span>
      <span class="btn-label">Save view</span>
    </button>
    <button class="icon-btn" type="button" title="Export PNG" onclick={() => onExport()}>
      <span class="icon" aria-hidden="true">📷</span>
      <span class="btn-label">Export</span>
    </button>
    <button class="icon-btn" type="button" title="Toggle UI" onclick={() => onToggleUi()}>
      <span class="icon" aria-hidden="true">👁</span>
      <span class="btn-label">Hide UI</span>
    </button>
  </div>
</div>

<style>
  .topbar {
    display: flex;
    align-items: center;
    gap: 24px;
    padding: 10px 18px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    color: var(--text);
  }

  .wordmark {
    display: flex;
    align-items: center;
    gap: 10px;
    white-space: nowrap;
  }

  .glyph {
    font-size: 22px;
    line-height: 1;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .title {
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .selectors {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .glass-pill {
    appearance: none;
    padding: 7px 30px 7px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%239aa3b5' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
  }

  .glass-pill:hover {
    border-color: var(--accent);
    background-color: rgba(255, 255, 255, 0.08);
  }

  .glass-pill:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(124, 158, 255, 0.25);
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .icon-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--panel-border);
    border-radius: 999px;
    color: var(--text-dim);
    cursor: pointer;
    transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
  }

  .icon-btn:hover {
    color: var(--text);
    border-color: var(--accent);
    background: rgba(124, 158, 255, 0.1);
  }

  .icon-btn.active {
    color: var(--text);
    border-color: var(--accent);
    background: rgba(124, 158, 255, 0.16);
  }

  .icon {
    font-size: 13px;
    line-height: 1;
  }

  .btn-label {
    font-size: 12.5px;
    letter-spacing: 0.02em;
  }

  @media (max-width: 860px) {
    .btn-label {
      display: none;
    }

    .icon-btn {
      padding: 7px 11px;
    }
  }
</style>
