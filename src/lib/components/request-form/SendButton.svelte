<script lang="ts">
    import SendSvg from "$lib/assets/icons/send.svg?raw";
</script>

<button type="submit" class="send-btn icon" title="Send request">
    {@html SendSvg}
</button>

<style>
    .send-btn {
        background: var(--blue);
    }
    .icon :global(svg) {
        width: 1rem;
        height: 1rem;
    }
</style>
