<script lang="ts">
    import SendIcon from "$lib/ui/icons/SendIcon.svelte";
</script>

<section class="no-response">
    <div>
        <h2>
            Hit the send button
            <SendIcon />
        </h2>
        <h4>And start making your requests!</h4>
    </div>
</section>

<style>
    .no-response {
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        color: var(--text-primary);
        font-weight: 400;
    }
</style>
