<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import KeyValueEditor from "$lib/ui/KeyValueEditor.svelte";
    import type { BodyType, RequestBody } from "$lib/types/http";

    const body = $derived(apiStore.api?.request.body);

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
        padding: 0 5px;
        display: flex;
        flex-direction: column;
        height: 100%;
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
        padding: 8px 12px;
        font-size: 14px;
        transition: all 0.15s ease;
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
        padding-top: 10px;
        text-align: center;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .empty-state p {
        margin: 0;
    }
</style>
