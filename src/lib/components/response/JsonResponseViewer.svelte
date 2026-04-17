<script lang="ts">
    import { onDestroy } from "svelte";
    import { getMonaco, type Monaco } from "$lib/utils/monaco";
    import type * as MonacoEditor from "monaco-editor";

    interface Props {
        value: unknown;
    }

    let { value }: Props = $props();

    let monaco: Monaco | null = null;
    let editor: MonacoEditor.editor.IStandaloneCodeEditor | null = null;
    let model: MonacoEditor.editor.ITextModel | null = null;

    function tryFormatJson(v: unknown): string {
        if (v !== null && typeof v === "object") {
            return JSON.stringify(v, null, 2);
        }
        if (typeof v === "string") {
            const trimmed = v.trim();
            if (!trimmed) return "";
            try {
                return JSON.stringify(JSON.parse(trimmed), null, 2);
            } catch {
                return v;
            }
        }
        return String(v ?? "");
    }

    function getEditorTheme(): string {
        return document.documentElement.dataset.theme === "light"
            ? "chasqui-light"
            : "vs-dark";
    }

    function disposeEditor() {
        model?.dispose();
        model = null;
        editor?.dispose();
        editor = null;
    }

    function monacoViewer(node: HTMLElement) {
        let destroyed = false;
        let observer: MutationObserver | null = null;

        (async () => {
            const m = await getMonaco();
            monaco = m;
            if (destroyed) return;

            disposeEditor();

            m.editor.defineTheme("chasqui-light", {
                base: "vs",
                inherit: false,
                rules: [
                    { token: "", foreground: "1c1917" },
                    { token: "string.key.json", foreground: "0451a5" },
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
                readOnly: true,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                folding: true,
                foldingHighlight: false,
                showFoldingControls: "always",
                scrollbar: {
                    vertical: "auto",
                    horizontal: "auto",
                    alwaysConsumeMouseWheel: false,
                },
                lineNumbersMinChars: 4,
                glyphMargin: false,
                contextmenu: false,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: "none",
                cursorStyle: "line",
                find: {
                    addExtraSpaceOnTop: false,
                },
            });

            model = m.editor.createModel(tryFormatJson(value), "json");
            editor.setModel(model);

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

    // Sync value changes into the editor
    $effect(() => {
        const formatted = tryFormatJson(value);
        if (!model) return;
        if (model.getValue() !== formatted) {
            model.setValue(formatted);
        }
    });

    onDestroy(() => {
        disposeEditor();
    });
</script>

<div class="container" use:monacoViewer></div>

<style>
    .container {
        height: 100%;
        width: 100%;
        background: var(--editor-bg);
        border: 0.5px solid var(--border);
        border-radius: 10px;
        overflow: hidden;
    }

    .container :global(.monaco-editor),
    .container :global(.monaco-editor-background),
    .container :global(.margin) {
        background: var(--editor-bg) !important;
    }
</style>
