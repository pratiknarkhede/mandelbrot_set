<script lang="ts">
  interface Props {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    onInput: (v: number) => void;
    format?: (v: number) => string;
  }

  let { label, min, max, step, value, onInput, format }: Props = $props();

  const decimals = $derived.by(() => {
    const s = String(step);
    const dot = s.indexOf('.');
    if (dot === -1) return 0;
    let count = s.length - dot - 1;
    if (s.includes('e-')) {
      count = Math.max(count, Number(s.slice(s.indexOf('e-') + 2)));
    }
    return count;
  });

  const display = $derived(format ? format(value) : value.toFixed(decimals));
</script>

<div class="slider-row">
  <div class="label-row">
    <span class="label">{label}</span>
    <span class="value">{display}</span>
  </div>
  <input
    class="range"
    type="range"
    {min}
    {max}
    {step}
    {value}
    oninput={(e) => onInput(Number(e.currentTarget.value))}
    aria-label={label}
  />
</div>

<style>
  .slider-row {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
  }

  .label {
    font-size: 12.5px;
    color: var(--text-dim);
    letter-spacing: 0.02em;
  }

  .value {
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    font-size: 12px;
    color: var(--accent);
  }

  .range {
    width: 100%;
    height: 18px;
    appearance: none;
    background: transparent;
    cursor: pointer;
    accent-color: var(--accent);
  }

  .range::-webkit-slider-runnable-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.12);
  }

  .range::-webkit-slider-thumb {
    appearance: none;
    width: 13px;
    height: 13px;
    margin-top: -5px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    box-shadow: 0 0 8px rgba(124, 158, 255, 0.55);
    transition: transform 0.15s ease;
  }

  .range:hover::-webkit-slider-thumb {
    transform: scale(1.15);
  }

  .range::-moz-range-track {
    height: 3px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.12);
  }

  .range::-moz-range-thumb {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    box-shadow: 0 0 8px rgba(124, 158, 255, 0.55);
  }
</style>
