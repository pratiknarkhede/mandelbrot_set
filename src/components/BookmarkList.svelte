<script lang="ts">
  import type { BookmarkItem } from './props';

  interface Props {
    bookmarks: BookmarkItem[];
    onBookmarkClick: (id: string) => void;
    onBookmarkDelete: (id: string) => void;
  }

  let { bookmarks, onBookmarkClick, onBookmarkDelete }: Props = $props();
</script>

{#if bookmarks.length === 0}
  <p class="empty">No bookmarks yet — press 🔖 to save this view.</p>
{:else}
  <ul class="list">
    {#each bookmarks as b (b.id)}
      <li class="row">
        <button type="button" class="row-main" onclick={() => onBookmarkClick(b.id)}>
          <span class="name">{b.name}</span>
          <span class="chip">{b.fractalId}</span>
        </button>
        <button
          type="button"
          class="delete"
          title="Delete bookmark"
          aria-label={`Delete bookmark ${b.name}`}
          onclick={() => onBookmarkDelete(b.id)}
        >
          ×
        </button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .empty {
    padding: 14px 12px;
    font-size: 12.5px;
    line-height: 1.6;
    color: var(--text-dim);
    text-align: center;
    border: 1px dashed var(--panel-border);
    border-radius: 8px;
  }

  .list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    border: 1px solid var(--panel-border);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .row:hover {
    border-color: rgba(124, 158, 255, 0.5);
    background: rgba(124, 158, 255, 0.06);
  }

  .row-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
    padding: 8px 10px;
    background: none;
    border: none;
    cursor: pointer;
    text-align: left;
  }

  .name {
    font-size: 12.5px;
    color: var(--text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .chip {
    flex-shrink: 0;
    padding: 2px 8px;
    font-size: 10.5px;
    font-family: ui-monospace, 'Cascadia Mono', Consolas, monospace;
    letter-spacing: 0.04em;
    color: var(--accent);
    background: rgba(124, 158, 255, 0.1);
    border: 1px solid rgba(124, 158, 255, 0.25);
    border-radius: 999px;
  }

  .delete {
    flex-shrink: 0;
    width: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 4px 4px 0;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 15px;
    line-height: 1;
    color: var(--text-dim);
    cursor: pointer;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .delete:hover {
    color: var(--danger);
    background: rgba(255, 124, 158, 0.12);
  }
</style>
