<script lang="ts">
    import SendIcon from "$lib/ui/icons/SendIcon.svelte";
</script>

<button type="submit" class="send-btn icon" title="Send request">
    <SendIcon />
</button>

<style>
    .send-btn {
        height: 40px;
        background: var(--action);
        box-shadow: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }
</style>
