<script lang="ts">
    import { request, response, setHeader } from "$lib/stores/request";
    import { sendRequest } from "$lib/services/tauriBridge";
    import type { Request } from "$lib/types/http";

    let req: Request;
    $: request.subscribe((v) => (req = v));

    async function onSend() {
        try {
            response.set(null);
            const res = await sendRequest(req);
            response.set(res);
        } catch (err) {
            console.error(err);
        }
    }

    // Ctrl/Cmd + Enter
    function onKeyDown(e: KeyboardEvent) {
        const isEnter = e.key === "Enter";
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;
        if (isEnter && isCmdOrCtrl) {
            e.preventDefault();
            onSend();
        }
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<form on:submit|preventDefault={onSend} on:keydown={onKeyDown}>
    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <select
            bind:value={req.method}
            on:change={() => request.set({ ...req })}
        >
            {#each ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as m}
                <option value={m}>{m}</option>
            {/each}
        </select>

        <input
            style="flex:1"
            placeholder="https://api.example.com/endpoint"
            bind:value={req.url}
            on:input={() => request.set({ ...req })}
        />

        <button type="submit">Send</button>
    </div>

    <div style="margin-bottom:8px;">
        <label>
            <input
                type="checkbox"
                bind:checked={req.insecure}
                on:change={() => request.set({ ...req })}
            />
            Insecure TLS (dev)
        </label>
    </div>

    <!--
    <h3>Headers</h3>
    <KeyValueEditor items={req.headers} onChange={setHeader} />

    <h3>Body</h3>
    <textarea
        style="width:100%;height:200px;"
        bind:value={req.body}
        on:input={() => request.set({ ...req })}
    ></textarea>
    -->
</form>
