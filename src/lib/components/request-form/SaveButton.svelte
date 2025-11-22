<script lang="ts">
    import SaveSvg from "$lib/assets/icons/save.svg?raw";

    let { onSave } = $props();
</script>

<button
    type="button"
    class="save-btn icon"
    onclick={onSave}
    title="Save request"
>
    {@html SaveSvg}
</button>

<style>
    .icon :global(svg) {
        width: 1rem;
        height: 1rem;
    }
</style>
