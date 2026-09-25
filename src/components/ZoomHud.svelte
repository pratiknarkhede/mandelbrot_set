<script lang="ts">
  interface Props {
    re: number;
    im: number;
    mag: number;
    iter: number;
    fps: number;
  }

  let { re, im, mag, iter, fps }: Props = $props();

  function signed(v: number): string {
    const s = Math.abs(v).toFixed(10);
    return (v < 0 ? '−' : '+') + s;
  }

  const reText = $derived(signed(re));
  const imText = $derived(signed(im));
  const magText = $derived(mag < 1e5 ? `×${mag.toFixed(0)}` : `×${mag.toExponential(1)}`);
  const fpsText = $derived(String(Math.round(fps)));
</script>

<div class="hud" role="status" aria-label="Coordinates and rendering stats">
  <span class="cell">re <span class="val">{reText}</span></span>
  <span class="cell">im <span class="val">{imText}</span></span>
  <span class="cell"><span class="val">{magText}</span></span>
  <span class="cell">it <span class="val">{iter}</span></span>
  <span class="cell"><span class="val">{fpsText}</span> fps</span>
</div>

<style>
  .hud {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 14px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 11.5px;
    letter-spacing: 0.02em;
    color: var(--text-dim);
    white-space: nowrap;
  }

  .cell {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }

  .val {
    color: var(--accent);
  }
</style>
