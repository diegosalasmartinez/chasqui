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

    function getEditorTheme(): string {
        return document.documentElement.dataset.theme === "light"
            ? "chasqui-light"
            : "vs-dark";
    }

    /**
     * Svelte Action: mounts Monaco into a DOM element.
     */
    function monacoJson(node: HTMLElement) {
        let destroyed = false;
        let observer: MutationObserver | null = null;

        (async () => {
            const m = await getMonaco();
            monaco = m;
            if (destroyed) return;

            disposeEditor();

            // Define custom light theme once
            m.editor.defineTheme("chasqui-light", {
                base: "vs",
                inherit: false,
                rules: [
                    { token: "", foreground: "1c1917" },
                    {
                        token: "string.key.json",
                        foreground: "0451a5",
                    },
                    { token: "string.value.json", foreground: "a31515" },
                    { token: "string", foreground: "a31515" },
                    { token: "number", foreground: "098658" },
                    { token: "number.json", foreground: "098658" },
                    { token: "keyword", foreground: "0000ff" },
                    { token: "keyword.json", foreground: "0000ff" },
                    { token: "delimiter", foreground: "1c1917" },
                    { token: "delimiter.bracket.json", foreground: "1c1917" },
                ],
                colors: {
                    "editor.background": "#ffffff",
                    "editor.foreground": "#1c1917",
                    "editorLineNumber.foreground": "#57534e",
                    "editorCursor.foreground": "#1c1917",
                },
            });

            editor = m.editor.create(node, {
                language: "json",
                theme: getEditorTheme(),
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

            // Watch for theme changes
            observer = new MutationObserver(() => {
                m.editor.setTheme(getEditorTheme());
            });
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ["data-theme"],
            });
        })();

        return {
            destroy() {
                destroyed = true;
                observer?.disconnect();
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
        monaco?.editor
            .getModels()
            .forEach((m: MonacoEditor.editor.ITextModel) => m.dispose());
    });
</script>

<div class="container" use:monacoJson></div>

<style>
    .container {
        height: 100%;
        width: 100%;
        background: var(--editor-bg);
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
        background: var(--editor-bg) !important;
    }
</style>
