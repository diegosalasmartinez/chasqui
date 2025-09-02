<script lang="ts">
    import { invoke } from "@tauri-apps/api/core";
    import Sidebar from "$lib/layouts/Sidebar.svelte";
    import RequestEditor from "$lib/components/RequestEditor.svelte";

    let name = $state("");
    let greetMsg = $state("");

    async function greet(event: Event) {
        event.preventDefault();
        // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
        greetMsg = await invoke("greet", { name });
    }
</script>

<main>
    <Sidebar />

    <div class="container">
        <h1>Welcome to Tauri + Svelte</h1>

        <div class="row">
            <a href="https://vite.dev" target="_blank">
                <img src="/vite.svg" class="logo vite" alt="Vite Logo" />
            </a>
            <a href="https://tauri.app" target="_blank">
                <img src="/tauri.svg" class="logo tauri" alt="Tauri Logo" />
            </a>
            <a href="https://svelte.dev" target="_blank">
                <img
                    src="/svelte.svg"
                    class="logo svelte-kit"
                    alt="SvelteKit Logo"
                />
            </a>
        </div>
        <p>Click on the Tauri, Vite, and SvelteKit logos to learn more.</p>

        <form class="row" onsubmit={greet}>
            <input
                id="greet-input"
                placeholder="Enter a name..."
                bind:value={name}
            />
            <button type="submit">Greet</button>
        </form>
        <p>{greetMsg}</p>

        <RequestEditor />
    </div>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        min-height: 100dvh;
    }

    .logo.vite:hover {
        filter: drop-shadow(0 0 2em #747bff);
    }

    .logo.svelte-kit:hover {
        filter: drop-shadow(0 0 2em #ff3e00);
    }

    .logo {
        height: 6em;
        padding: 1.5em;
        will-change: filter;
        transition: 0.75s;
    }

    .logo.tauri:hover {
        filter: drop-shadow(0 0 2em #24c8db);
    }

    .container {
        max-width: 80%;
        margin: 0 auto;
        padding-top: 10vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        text-align: center;
    }

    .row {
        display: flex;
        justify-content: center;
    }

    #greet-input {
        margin-right: 5px;
    }
</style>
