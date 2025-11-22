<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import HttpMethodSelector from "$lib/components/request-form/HttpMethodSelector.svelte";
    import InsecureToggle from "$lib/components/request-form/InsecureToggle.svelte";
    import SaveButton from "$lib/components/request-form/SaveButton.svelte";
    import NameField from "$lib/components/request-form/NameField.svelte";
    import UrlInput from "$lib/components/request-form/UrlInput.svelte";
    import SendButton from "./SendButton.svelte";

    async function onSend() {
        await apiStore.sendRequest();
    }

    function handleKeyDown(e: KeyboardEvent) {
        const isEnter = e.key === "Enter";
        const isCmdOrCtrl = e.metaKey || e.ctrlKey;

        if (isEnter && isCmdOrCtrl) {
            e.preventDefault();
            onSend();
        }
    }
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<form
    onsubmit={(e) => {
        e.preventDefault();
        onSend();
    }}
    onkeydown={handleKeyDown}
>
    <div class="header-bar">
        <NameField />
        <SaveButton />
        <SendButton />
    </div>

    <div class="request-bar">
        <HttpMethodSelector />
        <UrlInput />
    </div>

    <InsecureToggle />
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }

    .header-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 20px;
        height: 40px;
    }

    .request-bar {
        display: flex;
        align-items: center;
    }
</style>
