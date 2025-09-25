<script lang="ts">
    import {
        request,
        currentApi,
        updateRequest,
        setCurrentApiName,
    } from "$lib/stores/request";
    import SaveSvg from "$lib/assets/icons/save.svg?raw";
    import type { Request } from "$lib/types/http";
    import { saveApi, sendRequest } from "$lib/use-cases/api";

    $: id = $currentApi?.id as string | undefined;
    $: name = $currentApi?.name ?? "New request";
    $: req = $request as Request;

    async function onSave() {
        saveApi(id, name, req);
    }

    async function onSend() {
        sendRequest(req);
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

    function onMethodChange(method: Request["method"]) {
        updateRequest((r) => ({ ...r, method }));
    }

    function onUrlInput(url: string) {
        updateRequest((r) => ({ ...r, url }));
    }

    function onInsecureToggle(insecure: boolean) {
        updateRequest((r) => ({ ...r, insecure }));
    }

    function onNameInput(v: string) {
        if ($currentApi) setCurrentApiName(v);
    }
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<form on:submit|preventDefault={onSend} on:keydown={onKeyDown}>
    <span>current id: {id ?? "(unsaved)"}</span>

    <div
        style="width: 100%; display: flex; margin-bottom: 10px; font-size: 18px;"
    >
        <div style="flex: 1; width: 100%;">
            <input
                class="ghost"
                bind:value={name}
                on:input={(e) =>
                    onNameInput((e.target as HTMLInputElement).value)}
            />
        </div>

        <button class="ghost sm" on:click|preventDefault={() => onSave()}>
            {@html SaveSvg}
        </button>
    </div>

    <div style="display:flex; gap:8px; align-items:center; margin-bottom:8px;">
        <select
            bind:value={req.method}
            on:change={(e) =>
                onMethodChange(
                    (e.target as HTMLSelectElement).value as Request["method"],
                )}
        >
            {#each ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as m}
                <option value={m}>{m}</option>
            {/each}
        </select>

        <input
            style="flex:1"
            placeholder="https://api.example.com/endpoint"
            bind:value={req.url}
            on:input={(e) => onUrlInput((e.target as HTMLInputElement).value)}
        />

        <button type="submit">Send</button>
    </div>

    <div style="margin-bottom:8px;">
        <label>
            <input
                type="checkbox"
                bind:checked={req.insecure}
                on:change={(e) =>
                    onInsecureToggle((e.target as HTMLInputElement).checked)}
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
