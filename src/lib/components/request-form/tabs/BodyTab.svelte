<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import KeyValueEditor from "$lib/ui/KeyValueEditor.svelte";
    import type { BodyType, RequestBody } from "$lib/types/http";

    const body = $derived(apiStore.api?.request.body);
    const method = $derived(apiStore.api?.request.method);
    const canHaveBody = $derived(method !== "GET" && method !== "DELETE");

    function setBodyType(type: BodyType) {
        let newBody: RequestBody;

        switch (type) {
            case "none":
                newBody = { type: "none" };
                break;
            case "json":
                newBody = { type: "json", content: "{\n  \n}" };
                break;
            case "text":
                newBody = { type: "text", content: "" };
                break;
            case "form-data":
                newBody = { type: "form-data", data: [] };
                break;
            case "x-www-form-urlencoded":
                newBody = { type: "x-www-form-urlencoded", data: [] };
                break;
        }

        apiStore.updateApi((a) => ({
            ...a,
            request: { ...a.request, body: newBody },
        }));
    }

    function updateContent(content: string) {
        if (!body) return;

        if (body.type === "json" || body.type === "text") {
            apiStore.updateApi((a) => ({
                ...a,
                request: {
                    ...a.request,
                    body: { ...body, content },
                },
            }));
        }
    }

    function updateFormData(data: any[]) {
        if (!body) return;

        if (
            body.type === "form-data" ||
            body.type === "x-www-form-urlencoded"
        ) {
            apiStore.updateApi((a) => ({
                ...a,
                request: {
                    ...a.request,
                    body: { ...body, data },
                },
            }));
        }
    }
</script>

{#if body}
    <div class="tab-content">
        {#if !canHaveBody}
            <div class="info-banner">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                >
                    <path
                        fill-rule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                        clip-rule="evenodd"
                    />
                </svg>
                <span
                    >{method} requests typically do not have a request body</span
                >
            </div>
        {/if}

        <div class="body-type-selector">
            <label>
                <span class="label-text">Body Type</span>
                <select
                    class="body-select"
                    value={body.type}
                    onchange={(e) =>
                        setBodyType(
                            (e.target as HTMLSelectElement).value as BodyType,
                        )}
                    disabled={!canHaveBody}
                >
                    <option value="none">None</option>
                    <option value="json">JSON</option>
                    <option value="text">Text</option>
                    <option value="form-data">Form Data</option>
                    <option value="x-www-form-urlencoded"
                        >x-www-form-urlencoded</option
                    >
                </select>
            </label>
        </div>

        <div class="body-content">
            {#if body.type === "json"}
                <div class="editor-wrapper">
                    <textarea
                        class="code-editor"
                        placeholder={JSON.stringify({ key: "value" })}
                        value={body.content}
                        oninput={(e) =>
                            updateContent(
                                (e.target as HTMLTextAreaElement).value,
                            )}
                        spellcheck="false"
                    ></textarea>
                </div>
            {:else if body.type === "text"}
                <div class="editor-wrapper">
                    <textarea
                        class="code-editor"
                        placeholder="Enter text content..."
                        value={body.content}
                        oninput={(e) =>
                            updateContent(
                                (e.target as HTMLTextAreaElement).value,
                            )}
                    ></textarea>
                </div>
            {:else if body.type === "form-data" || body.type === "x-www-form-urlencoded"}
                <KeyValueEditor
                    items={body.data}
                    onUpdate={updateFormData}
                    placeholder={{ key: "key", value: "value" }}
                />
            {:else}
                <div class="empty-state">
                    <p>This request does not have a body.</p>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .tab-content {
        padding: 16px;
        display: flex;
        flex-direction: column;
        height: 100%;
    }

    .info-banner {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 12px 16px;
        margin-bottom: 16px;
        background: rgba(59, 130, 246, 0.1);
        border: 1px solid rgba(59, 130, 246, 0.3);
        border-radius: 8px;
        color: #3b82f6;
        font-size: 13px;
    }

    .info-banner svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
    }

    .body-type-selector {
        margin-bottom: 16px;
    }

    .label-text {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .body-select {
        width: 100%;
        max-width: 300px;
        padding: 8px 12px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 6px;
        color: var(--text-primary);
        font-size: 14px;
        transition: all 0.15s ease;
    }

    .body-select:focus {
        outline: none;
        border-color: var(--accent);
        background: var(--background);
    }

    .body-select:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .body-content {
        flex: 1;
        min-height: 0;
    }

    .editor-wrapper {
        height: 100%;
        min-height: 300px;
    }

    .code-editor {
        width: 100%;
        height: 100%;
        min-height: 300px;
        padding: 16px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 8px;
        color: var(--text-primary);
        font-size: 14px;
        font-family: "SF Mono", "Monaco", "Consolas", monospace;
        line-height: 1.6;
        resize: vertical;
        transition: all 0.15s ease;
    }

    .code-editor:focus {
        outline: none;
        border-color: var(--accent);
        background: var(--background);
    }

    .code-editor::placeholder {
        color: var(--text-tertiary);
    }

    .empty-state {
        padding: 48px 32px;
        text-align: center;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .empty-state p {
        margin: 0;
    }
</style>
