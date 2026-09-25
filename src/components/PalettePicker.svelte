<script lang="ts">
  import type { PaletteOption } from './props';

  interface Props {
    palettes: PaletteOption[];
    paletteId: string;
    onPick: (id: string) => void;
  }

  let { palettes, paletteId, onPick }: Props = $props();
</script>

<div class="palette-list" role="listbox" aria-label="Palette">
  {#each palettes as p (p.id)}
    <button
      type="button"
      class="swatch"
      class:selected={p.id === paletteId}
      role="option"
      aria-selected={p.id === paletteId}
      style={`--swatch: ${p.css}`}
      onclick={() => onPick(p.id)}
      title={p.name}
    >
      <span class="swatch-bg" aria-hidden="true"></span>
      <span class="name">{p.name}</span>
      {#if p.id === paletteId}
        <span class="check" aria-hidden="true">✓</span>
      {/if}
    </button>
  {/each}
</div>

<style>
  .palette-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .swatch {
    position: relative;
    height: 44px;
    padding: 0;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    background: none;
    transition: transform 0.15s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }

  .swatch-bg {
    position: absolute;
    inset: 0;
    background: var(--swatch);
  }

  .swatch::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(11, 13, 18, 0.35);
    transition: background 0.2s ease;
  }

  .swatch:hover {
    transform: translateY(-1px);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .swatch:hover::after {
    background: rgba(11, 13, 18, 0.15);
  }

  .swatch.selected {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 14px rgba(124, 158, 255, 0.35);
  }

  .swatch.selected::after {
    background: transparent;
  }

  .name {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    height: 100%;
    padding: 0 14px;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.03em;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.6);
    pointer-events: none;
  }

  .check {
    position: absolute;
    z-index: 1;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    text-shadow: 0 0 6px rgba(0, 0, 0, 0.8);
    pointer-events: none;
  }
</style>
