<script lang="ts">
    import SendIcon from "$lib/ui/icons/SendIcon.svelte";
</script>

<button type="submit" class="send-btn icon" title="Send request">
    <SendIcon />
</button>

<style>
    .send-btn {
        height: 40px;
        background: var(--blue);
        box-shadow: 0 2px 2px rgba(0, 0, 0, 0.2);
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
