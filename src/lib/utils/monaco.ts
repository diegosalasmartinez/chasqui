import loader from "@monaco-editor/loader";
import type * as MonacoEditor from "monaco-editor";

export type Monaco = typeof MonacoEditor;

let monaco: Monaco | null = null;
let initPromise: Promise<Monaco> | null = null;

/**
 * Preload Monaco editor in the background.
 * Call this early (e.g., on app mount) to avoid delay when user opens the editor.
 */
export function preloadMonaco(): void {
    if (!initPromise) {
        initPromise = loadMonaco();
    }
}

/**
 * Get the Monaco instance, loading it if necessary.
 * Returns the same instance on subsequent calls.
 */
export async function getMonaco(): Promise<Monaco> {
    if (monaco) return monaco;

    if (!initPromise) {
        initPromise = loadMonaco();
    }

    monaco = await initPromise;
    return monaco;
}

async function loadMonaco(): Promise<Monaco> {
    const monacoEditor = await import("monaco-editor");
    loader.config({ monaco: monacoEditor.default });
    return await loader.init();
}
