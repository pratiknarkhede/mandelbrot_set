<script lang="ts">
  interface Props {
    re: number;
    im: number;
    mag: number;
    iter: number;
    fps: number;
  }

  let { re, im, mag, iter, fps }: Props = $props();

  /** Compact formatting on narrow screens — the 10-decimal desktop strip
   *  overflows a phone viewport, so coordinates shrink to 4 decimals. */
  let compact = $state(false)

  $effect(() => {
    const mq = window.matchMedia('(max-width: 700px)')
    const update = () => {
      compact = mq.matches
    }
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  })

  function signed(v: number, decimals: number): string {
    const s = Math.abs(v).toFixed(decimals)
    return (v < 0 ? '−' : '+') + s
  }

  const reText = $derived(signed(re, compact ? 4 : 10))
  const imText = $derived(signed(im, compact ? 4 : 10))
  const magText = $derived(
    compact
      ? mag < 1e4
        ? `×${mag.toFixed(0)}`
        : `×${mag.toExponential(0)}`
      : mag < 1e5
        ? `×${mag.toFixed(0)}`
        : `×${mag.toExponential(1)}`,
  )
  const fpsText = $derived(String(Math.round(fps)))
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
    max-width: calc(100vw - 20px);
  }

  @media (max-width: 700px) {
    .hud {
      gap: 10px;
      padding: 6px 10px;
      font-size: 11px;
    }
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
