<script lang="ts">
    import { dragStore } from "$lib/stores/drag.svelte";
    import { onMount, onDestroy } from "svelte";

    let lineEl: HTMLDivElement | null = null;

    onMount(() => {
        lineEl = document.createElement("div");
        lineEl.style.position = "fixed";
        lineEl.style.height = "2px";
        lineEl.style.background = "var(--accent, #4a9eff)";
        lineEl.style.borderRadius = "1px";
        lineEl.style.pointerEvents = "none";
        lineEl.style.zIndex = "999999";
        lineEl.style.boxShadow = "0 0 6px var(--accent, #4a9eff)";
        lineEl.style.display = "none";
        document.body.appendChild(lineEl);
    });

    onDestroy(() => {
        lineEl?.remove();
        lineEl = null;
    });

    $effect(() => {
        const pt = dragStore.insertionPoint;
        if (!lineEl) return;
        if (pt) {
            lineEl.style.display = "block";
            lineEl.style.top = `${pt.lineY - 1}px`;
            lineEl.style.left = `${pt.lineLeft}px`;
            lineEl.style.width = `${pt.lineWidth}px`;
        } else {
            lineEl.style.display = "none";
        }
    });
</script>
