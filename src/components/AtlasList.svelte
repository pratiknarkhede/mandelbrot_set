<script lang="ts">
  import type { Landmark } from '../atlas/landmarks';

  interface Props {
    landmarks: Landmark[];
    activeId: string | null;
    onPick: (id: string) => void;
  }

  let { landmarks, activeId, onPick }: Props = $props();
</script>

<ul class="list">
  {#each landmarks as l (l.id)}
    <li>
      <button
        type="button"
        class="row"
        class:active={l.id === activeId}
        aria-current={l.id === activeId ? 'true' : undefined}
        onclick={() => onPick(l.id)}
      >
        <span class="name">{l.name}</span>
        {#if l.notation}
          <span class="notation" title={l.notation}>{l.notation}</span>
        {/if}
      </button>
    </li>
  {/each}
</ul>

<style>
  .list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 220px;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding-right: 4px;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
  }

  .list::-webkit-scrollbar {
    width: 5px;
  }

  .list::-webkit-scrollbar-track {
    background: transparent;
  }

  .list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.18);
    border-radius: 999px;
  }

  .list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-height: 34px;
    padding: 6px 10px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid var(--panel-border);
    border-left: 2px solid transparent;
    border-radius: 8px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .row:hover {
    border-color: rgba(124, 158, 255, 0.5);
    border-left-color: transparent;
    background: rgba(124, 158, 255, 0.06);
  }

  .row.active {
    border-color: rgba(124, 158, 255, 0.4);
    border-left-color: var(--accent);
    background: rgba(124, 158, 255, 0.1);
  }

  .row:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 2px rgba(124, 158, 255, 0.25);
  }

  .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 12.5px;
    color: var(--text);
  }

  .notation {
    flex-shrink: 0;
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 10.5px;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    letter-spacing: 0.02em;
    color: var(--text-dim);
  }
</style>
