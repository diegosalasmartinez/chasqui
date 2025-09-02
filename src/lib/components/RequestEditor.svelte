<script lang="ts">
    //import { request, response, setHeader } from "../stores/request";
    //import { sendRequest } from "../services/tauriBridge";
    //import KeyValueEditor from "./KeyValueEditor.svelte";
    //import type { RequestInput } from "../types/http";

    //let req: RequestInput;
    //$: request.subscribe((v) => (req = v));
    //
    //async function onSend() {
    //    response.set(null);
    //    const res = await sendRequest(req);
    //    response.set(res);
    //}
</script>

<div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
    <select>
        {#each ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as m}
            <option value={m}>{m}</option>
        {/each}
    </select>
    <input style="flex:1" placeholder="https://api.example.com/endpoint" />
    <button>Send (Ctrl/Cmd+Enter)</button>
</div>

<div style="margin-bottom:8px;">
    <label><input type="checkbox" /> Insecure TLS (dev)</label>
</div>
