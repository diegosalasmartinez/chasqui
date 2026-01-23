<script lang="ts">
    import { onDestroy } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";
    import { getMonaco, type Monaco } from "$lib/utils/monaco";
    import type * as MonacoEditor from "monaco-editor";

    /**
     * Monaco runtime reference.
     */
    let monaco: Monaco | null = null;

    /**
     * Svelte "derived" reference to the current request body in the store.
     */
    const body = $derived(apiStore.api?.request.body);

    /**
     * Current editor + model instances.
     */
    let editor: MonacoEditor.editor.IStandaloneCodeEditor | null = null;
    let model: MonacoEditor.editor.ITextModel | null = null;

    /**
     * Prevents infinite update loops between editor and store.
     */
    let settingFromStore = false;

    /**
     * Dispose editor + model instances to prevent memory leaks.
     */
    function disposeEditor() {
        if (model) {
            model.dispose();
            model = null;
        }
        if (editor) {
            editor.dispose();
            editor = null;
        }
    }

    /**
     * Svelte Action: mounts Monaco into a DOM element.
     */
    function monacoJson(node: HTMLElement) {
        let destroyed = false;

        (async () => {
            const m = await getMonaco();
            monaco = m;
            if (destroyed) return;

            disposeEditor();

            editor = m.editor.create(node, {
                language: "json",
                theme: "vs-dark",
                automaticLayout: true,
                minimap: { enabled: false },
                formatOnPaste: true,
                formatOnType: true,
                scrollBeyondLastLine: false,
                scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                    alwaysConsumeMouseWheel: false,
                },
                lineNumbersMinChars: 4,
                glyphMargin: false,
                folding: false,
                contextmenu: false,
            });

            model = m.editor.createModel(
                body?.type === "json" ? body.content : "{\n  \n}",
                "json",
            );

            editor.setModel(model);

            editor.onDidChangeModelContent(() => {
                if (!model || settingFromStore) return;
                updateContent(model.getValue());
            });
        })();

        return {
            destroy() {
                destroyed = true;
                disposeEditor();
            },
        };
    }

    function updateContent(content: string) {
        if (!body) return;
        if (body.type === "json" || body.type === "text") {
            apiStore.updateApi((a) => ({
                ...a,
                request: { ...a.request, body: { ...body, content } },
            }));
        }
    }

    // Store -> Editor sync
    $effect(() => {
        const content = body?.type === "json" ? body.content : null;
        if (!model || content == null) return;

        const current = model.getValue();
        if (current !== content) {
            settingFromStore = true;
            model.setValue(content);
            settingFromStore = false;
        }
    });

    onDestroy(() => {
        disposeEditor();
        monaco?.editor.getModels().forEach((m: MonacoEditor.editor.ITextModel) => m.dispose());
    });
</script>

<div class="container" use:monacoJson></div>

<style>
    .container {
        height: 100%;
        width: 100%;
        background: var(--bg-darker);
        border: 1px solid var(--border);
        border-radius: 8px;
        overflow: hidden;
    }

    .container :global(.monaco-editor) {
        padding: 15px 0px;
    }

    .container :global(.monaco-editor),
    .container :global(.monaco-editor-background),
    .container :global(.margin) {
        background: var(--bg-darker) !important;
    }
</style>
