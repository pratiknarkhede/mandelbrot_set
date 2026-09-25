<script lang="ts">
  import type { Landmark } from '../atlas/landmarks';

  interface Props {
    landmark: Landmark;
    onClose: () => void;
  }

  let { landmark, onClose }: Props = $props();
</script>

{#key landmark.id}
  <article class="card" role="complementary" aria-label={landmark.name}>
    <header class="head">
      <h3 class="name">{landmark.name}</h3>
      <button type="button" class="close" aria-label="Close" onclick={() => onClose()}>×</button>
    </header>
    {#if landmark.notation}
      <p class="notation">{landmark.notation}</p>
    {/if}
    <p class="summary">{landmark.summary}</p>
    {#if landmark.detail}
      <p class="detail">{landmark.detail}</p>
    {/if}
  </article>
{/key}

<style>
  @keyframes card-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 400px;
    padding: 16px 18px;
    background: var(--panel);
    backdrop-filter: blur(14px);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    color: var(--text);
    animation: card-in 250ms ease;
  }

  .head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }

  .name {
    font-size: 14.5px;
    font-weight: 600;
    letter-spacing: 0.02em;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  .close {
    flex-shrink: 0;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1;
    color: var(--text-dim);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .close:hover {
    color: var(--danger);
    background: rgba(255, 124, 158, 0.12);
  }

  .close:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px rgba(124, 158, 255, 0.25);
  }

  .notation {
    font-size: 11px;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    letter-spacing: 0.02em;
    color: var(--text-dim);
  }

  .summary {
    font-size: 12.5px;
    line-height: 1.55;
    color: var(--text);
    opacity: 0.92;
  }

  .detail {
    margin-top: 4px;
    padding-top: 10px;
    border-top: 1px solid var(--panel-border);
    font-size: 11.5px;
    line-height: 1.55;
    color: var(--text-dim);
  }

  @media (max-width: 700px) {
    .card {
      padding: 12px 14px;
      gap: 6px;
    }

    .close {
      width: 34px;
      height: 34px;
      font-size: 18px;
    }
  }
</style>
