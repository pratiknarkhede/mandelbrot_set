<script lang="ts">
  import type { JuliaValue } from './props';

  interface Props {
    value: JuliaValue;
    onPick: (re: number, im: number) => void;
  }

  let { value, onPick }: Props = $props();

  let pad: HTMLDivElement | null = $state(null);
  let dragging = $state(false);

  const dotLeft = $derived(((value.re + 2) / 4) * 100);
  const dotTop = $derived(((2 - value.im) / 4) * 100);

  function toPoint(e: PointerEvent): { re: number; im: number } {
    const rect = pad?.getBoundingClientRect();
    if (!rect || rect.width === 0) return { re: 0, im: 0 };
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    return { re: x * 4 - 2, im: 2 - y * 4 };
  }

  function handleDown(e: PointerEvent) {
    e.preventDefault();
    pad?.setPointerCapture(e.pointerId);
    dragging = true;
    const p = toPoint(e);
    onPick(p.re, p.im);
  }

  function handleMove(e: PointerEvent) {
    if (!dragging) return;
    const p = toPoint(e);
    onPick(p.re, p.im);
  }

  function handleUp(e: PointerEvent) {
    if (!dragging) return;
    dragging = false;
    if (pad?.hasPointerCapture(e.pointerId)) {
      pad.releasePointerCapture(e.pointerId);
    }
  }
</script>

<div class="cpad-block">
  <div
    bind:this={pad}
    class="cpad"
    class:dragging
    onpointerdown={handleDown}
    onpointermove={handleMove}
    onpointerup={handleUp}
    onpointercancel={handleUp}
    role="application"
    aria-label="Julia constant picker"
  >
    <span class="cross cross-h" aria-hidden="true"></span>
    <span class="cross cross-v" aria-hidden="true"></span>
    <span class="unit-circle" aria-hidden="true"></span>
    <span class="axis axis-left">−2</span>
    <span class="axis axis-right">2</span>
    <span class="axis axis-bottom">−2i</span>
    <span class="axis axis-top">2i</span>
    <span class="dot" style={`left: ${dotLeft}%; top: ${dotTop}%;`} aria-hidden="true"></span>
  </div>
  <p class="readout">
    c = {value.re >= 0 ? '+' : '−'}{Math.abs(value.re).toFixed(4)}
    {value.im >= 0 ? '+' : '−'}{Math.abs(value.im).toFixed(4)}i
  </p>
</div>

<style>
  .cpad-block {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .cpad {
    position: relative;
    width: 100%;
    aspect-ratio: 1 / 1;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    cursor: crosshair;
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
  }

  .cpad.dragging {
    border-color: var(--accent);
  }

  .cross {
    position: absolute;
    background: rgba(255, 255, 255, 0.14);
    pointer-events: none;
  }

  .cross-h {
    left: 0;
    right: 0;
    top: 50%;
    height: 1px;
  }

  .cross-v {
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
  }

  .unit-circle {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 50%;
    aspect-ratio: 1 / 1;
    transform: translate(-50%, -50%);
    border: 1px dashed rgba(177, 140, 255, 0.35);
    border-radius: 50%;
    pointer-events: none;
  }

  .axis {
    position: absolute;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 10px;
    color: var(--text-dim);
    opacity: 0.7;
    pointer-events: none;
  }

  .axis-left {
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
  }

  .axis-right {
    right: 6px;
    top: 50%;
    transform: translateY(-50%);
  }

  .axis-bottom {
    left: 50%;
    bottom: 4px;
    transform: translateX(-50%);
  }

  .axis-top {
    left: 50%;
    top: 4px;
    transform: translateX(-50%);
  }

  .dot {
    position: absolute;
    width: 12px;
    height: 12px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: var(--accent);
    box-shadow: 0 0 10px rgba(124, 158, 255, 0.8), 0 0 0 3px rgba(124, 158, 255, 0.2);
    pointer-events: none;
    transition: left 0.06s ease-out, top 0.06s ease-out;
  }

  .cpad.dragging .dot {
    transition: none;
  }

  .readout {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 11.5px;
    color: var(--text-dim);
    text-align: center;
    letter-spacing: 0.02em;
  }
</style>
