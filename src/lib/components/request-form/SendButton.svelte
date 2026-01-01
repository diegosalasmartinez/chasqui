<script lang="ts">
    import SendIcon from "$lib/ui/icons/SendIcon.svelte";
</script>

<button type="submit" class="send-btn icon" title="Send request">
    <SendIcon />
</button>

<style>
    .send-btn {
        background: var(--blue);
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
