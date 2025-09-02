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
        <RequestEditor />

        <!--
        <form class="row" onsubmit={greet}>
            <input
                id="greet-input"
                placeholder="Enter a name..."
                bind:value={name}
            />
            <button type="submit">Greet</button>
        </form>
        <p>{greetMsg}</p>
        -->
    </div>
</main>

<style>
    main {
        display: grid;
        grid-template-columns: 300px minmax(0, 1fr);
        column-gap: 20px;
        min-height: 100dvh;
        padding: 20px 20px;
    }

    .container {
        width: 100%;
        padding: 20px 20px;
    }

    #greet-input {
        margin-right: 5px;
    }
</style>
