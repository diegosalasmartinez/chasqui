<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import HttpMethodSelector from "$lib/components/request-form/HttpMethodSelector.svelte";
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

    function tabHasContent(key: Tabs): boolean {
        const request = apiStore.api?.request;
        if (!request) return false;

        switch (key) {
            case "params":
                return request.params.some((p) => p.key || p.value);
            case "auth":
                return request.auth.type !== "none";
            case "headers":
                return request.headers.some((h) => h.key || h.value);
            case "body":
                if (request.body.type === "none") return false;
                if (
                    request.body.type === "json" ||
                    request.body.type === "text"
                ) {
                    return !!request.body.content;
                }
                if (
                    request.body.type === "form-data" ||
                    request.body.type === "x-www-form-urlencoded"
                ) {
                    return request.body.data.some((d) => d.key || d.value);
                }
                return false;
            default:
                return false;
        }
    }

    async function onSend() {
        await apiStore.sendRequest();
    }
</script>

<!-- Cmd+Enter is handled globally in $lib/infra/shortcuts -->
<form
    onsubmit={(e) => {
        e.preventDefault();
        onSend();
    }}
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

    <div class="tabs-container">
        <div class="tabs" role="tablist" aria-label="Response content">
            {#each tabs as tab}
                <TabButton
                    text={tab.title}
                    isActive={activeTab === tab.key}
                    onClick={() => (activeTab = tab.key)}
                    hasContent={tabHasContent(tab.key)}
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
        border-right: 0.5px solid var(--border);
        background: var(--bg-darker);
        display: flex;
        flex-direction: column;
        padding: 0;
        height: 100%;
        min-height: 0;
        overflow: hidden;
    }

    .header-bar {
        margin: 5px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
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
        background: var(--bg-darker);
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        min-height: 0;
    }
</style>
