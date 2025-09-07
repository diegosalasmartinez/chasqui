<script lang="ts">
    import { response } from "$lib/stores/request";
</script>

<section>
    <h4>Response</h4>

    {#if $response}
        <div>Status: {$response.status}</div>
        <div>Body: {$response.body}</div>
        <div>Size: {$response.size_bytes}</div>
    {/if}
</section>
