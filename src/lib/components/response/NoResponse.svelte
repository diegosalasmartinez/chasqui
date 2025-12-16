<script lang="ts">
    import SendSvg from "$lib/assets/icons/send.svg?raw";
</script>

<section class="no-response">
    <div>
        <h2>
            Hit the send button
            {@html SendSvg}
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
