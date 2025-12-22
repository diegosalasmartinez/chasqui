<script lang="ts">
    import { onDestroy } from "svelte";
    import { apiStore } from "$lib/stores/api.svelte";

    import loader from "@monaco-editor/loader";
    import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api";

    /**
     * Monaco runtime references.
     * Monaco is initialized lazily (client-side only).
     */
    let monaco: typeof Monaco | null = null;

    /**
     * Svelte "derived" reference to the current request body in the store.
     * This value changes when:
     * - the selected request changes
     * - the body type changes
     * - the body content changes
     */
    const body = $derived(apiStore.api?.request.body);

    /**
     * Current editor + model instances.
     * We keep them in variables so we can:
     * - update editor content when the store changes (store -> editor)
     * - dispose them when switching requests or unmounting (cleanup)
     */
    let editor: Monaco.editor.IStandaloneCodeEditor | null = null;
    let model: Monaco.editor.ITextModel | null = null;

    /**
     * Prevents infinite update loops between editor and store.
     * Example loop without this:
     * - store sets model.setValue()
     * - Monaco triggers onDidChangeModelContent
     * - we update store again
     * - store changes again, etc.
     */
    let settingFromStore = false;

    /**
     * We keep a single initialization promise so Monaco is only loaded once.
     * Multiple mounts will await the same promise rather than reloading Monaco.
     */
    let monacoInitPromise: Promise<typeof Monaco> | null = null;

    /**
     * Dispose editor + model instances to prevent memory leaks.
     * Monaco editors/models must be disposed manually.
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
     * Loads Monaco on demand in the browser.
     * This avoids SSR problems and keeps the initial bundle smaller.
     */
    async function ensureMonaco() {
        if (monaco) return monaco;

        if (!monacoInitPromise) {
            monacoInitPromise = (async () => {
                // Load the local 'monaco-editor' package (no CDN).
                const monacoEditor = await import("monaco-editor");

                // Tell the loader to use the locally imported Monaco instance.
                loader.config({ monaco: monacoEditor.default });

                // Initialize Monaco (returns the Monaco API object).
                return await loader.init();
            })();
        }

        monaco = await monacoInitPromise;
        return monaco;
    }

    /**
     * Svelte Action: mounts Monaco into a DOM element.
     *
     * This is better than relying on onMount + bind:this because the action
     * is called exactly when the DOM node exists, and it can also cleanup
     * automatically when the node is removed.
     */
    function monacoJson(node: HTMLElement) {
        let destroyed = false;

        (async () => {
            const m = await ensureMonaco();
            if (destroyed) return;

            // If there is an existing editor (from a previous request), dispose it.
            disposeEditor();

            // Create the editor attached to this DOM node.
            editor = m.editor.create(node, {
                language: "json",
                theme: "vs-dark",
                automaticLayout: true, // Auto-resize when container size changes
                minimap: { enabled: false },
                formatOnPaste: true,
                formatOnType: true,
            });

            // Create a model for the editor content (Monaco stores content in models).
            model = m.editor.createModel(
                body?.type === "json" ? body.content : "{\n  \n}",
                "json",
            );

            editor.setModel(model);

            /**
             * Editor -> Store sync:
             * When the user types in Monaco, update the store so the content persists.
             */
            editor.onDidChangeModelContent(() => {
                if (!model) return;
                if (settingFromStore) return; // Avoid loops when store updates the editor.

                updateContent(model.getValue());
            });
        })();

        /**
         * Called automatically by Svelte when this DOM node is removed.
         * Example: switching requests with {#key ...} will remove the old node,
         * triggering this destroy() method.
         */
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

    /**
     * Store -> Editor sync:
     * If body.content changes externally (e.g. selecting another request),
     * we push that new value into Monaco.
     */
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

    /**
     * Extra safety cleanup if the whole component unmounts.
     * Not strictly required if the action cleanup always runs, but good practice.
     */
    onDestroy(() => {
        disposeEditor();
        monaco?.editor.getModels().forEach((m) => m.dispose());
    });
</script>

<div class="container" style="height: 100%; width: 100%;" use:monacoJson></div>
