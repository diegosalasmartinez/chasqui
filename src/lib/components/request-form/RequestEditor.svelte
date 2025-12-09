<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import HttpMethodSelector from "$lib/components/request-form/HttpMethodSelector.svelte";
    //import InsecureToggle from "$lib/components/request-form/InsecureToggle.svelte";
    import SaveButton from "$lib/components/request-form/SaveButton.svelte";
    import NameField from "$lib/components/request-form/NameField.svelte";
    import UrlInput from "$lib/components/request-form/UrlInput.svelte";
    import TabButton from "$lib/ui/TabButton.svelte";
    import SendButton from "./SendButton.svelte";
    import ParamsTab from "./tabs/ParamsTab.svelte";
    import AuthTab from "./tabs/AuthTab.svelte";
    import HeadersTab from "./tabs/HeadersTab.svelte";
    import BodyTab from "./tabs/BodyTab.svelte";

    type Tabs = "params" | "auth" | "headers" | "body";
    let activeTab = $state<Tabs>("params");

    const tabs: { key: Tabs; title: string }[] = [
        {
            key: "params",
            title: "Params",
        },
        {
            key: "auth",
            title: "Authorization",
        },
        {
            key: "headers",
            title: "Headers",
        },
        {
            key: "body",
            title: "Body",
        },
    ];

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
    </div>

    <div class="request-bar">
        <HttpMethodSelector />
        <UrlInput />
        <SendButton />
    </div>

    <!--
    <InsecureToggle />
    -->

    <div class="tabs-container">
        <div class="tabs" role="tablist" aria-label="Response content">
            {#each tabs as tab}
                <TabButton
                    text={tab.title}
                    isActive={activeTab === tab.key}
                    onClick={() => (activeTab = tab.key)}
                />
            {/each}
        </div>
    </div>

    <div class="tab-content">
        {#if activeTab === "params"}
            <ParamsTab />
        {:else if activeTab === "auth"}
            <AuthTab />
        {:else if activeTab === "headers"}
            <HeadersTab />
        {:else if activeTab === "body"}
            <BodyTab />
        {/if}
    </div>
</form>

<style>
    form {
        border-top: 0.5px solid var(--border);
        border-right: 0.5px solid var(--border);
        border-bottom: 0.5px solid var(--border);
        background: var(--bg-darker);
        display: flex;
        flex-direction: column;
        padding: 0;
    }

    .header-bar {
        margin: 5px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        /*margin-bottom: 10px;*/
        gap: 5px;
        height: 40px;
    }

    .request-bar {
        margin: 0 10px;
        display: flex;
        align-items: center;
    }

    .tabs-container {
        border-bottom: 0.5px solid var(--border);
    }

    .tabs {
        margin: 5px 10px 0px 10px;
    }

    .tab-content {
        background: var(--bg);
        flex: 1;
        padding: 15px;
    }
</style>
