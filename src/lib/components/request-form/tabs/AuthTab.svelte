<script lang="ts">
    import { apiStore } from "$lib/stores/api.svelte";
    import type { AuthType, AuthConfig } from "$lib/types/http";

    const auth = $derived(apiStore.api?.request.auth);

    function setAuthType(type: AuthType) {
        let newAuth: AuthConfig;

        switch (type) {
            case "none":
                newAuth = { type: "none" };
                break;
            case "bearer":
                newAuth = { type: "bearer", token: "" };
                break;
            case "basic":
                newAuth = { type: "basic", username: "", password: "" };
                break;
            case "api-key":
                newAuth = {
                    type: "api-key",
                    key: "",
                    value: "",
                    addTo: "header",
                };
                break;
        }

        apiStore.updateApi((a) => ({
            ...a,
            request: { ...a.request, auth: newAuth },
        }));
    }

    function updateAuth(updates: Partial<AuthConfig>) {
        apiStore.updateApi((a) => ({
            ...a,
            request: {
                ...a.request,
                auth: { ...a.request.auth, ...updates } as AuthConfig,
            },
        }));
    }
</script>

{#if auth}
    <div class="tab-content">
        <div class="auth-type-selector">
            <label>
                <span class="label-text">Authorization Type</span>
                <select
                    class="auth-select"
                    value={auth.type}
                    onchange={(e) =>
                        setAuthType(
                            (e.target as HTMLSelectElement).value as AuthType,
                        )}
                >
                    <option value="none">No Auth</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="api-key">API Key</option>
                </select>
            </label>
        </div>

        <div class="auth-form">
            {#if auth.type === "bearer"}
                <label>
                    <span class="label-text">Token</span>
                    <input
                        class="auth-input"
                        placeholder="Enter bearer token"
                        value={auth.token}
                        oninput={(e) =>
                            updateAuth({
                                token: (e.target as HTMLInputElement).value,
                            })}
                    />
                </label>
            {:else if auth.type === "basic"}
                <label>
                    <span class="label-text">Username</span>
                    <input
                        type="text"
                        class="auth-input"
                        placeholder="Enter username"
                        value={auth.username}
                        oninput={(e) =>
                            updateAuth({
                                username: (e.target as HTMLInputElement).value,
                            })}
                    />
                </label>
                <label>
                    <span class="label-text">Password</span>
                    <input
                        class="auth-input"
                        placeholder="Enter password"
                        value={auth.password}
                        oninput={(e) =>
                            updateAuth({
                                password: (e.target as HTMLInputElement).value,
                            })}
                    />
                </label>
            {:else if auth.type === "api-key"}
                <label>
                    <span class="label-text">Key</span>
                    <input
                        type="text"
                        class="auth-input"
                        placeholder="e.g. X-API-Key"
                        value={auth.key}
                        oninput={(e) =>
                            updateAuth({
                                key: (e.target as HTMLInputElement).value,
                            })}
                    />
                </label>
                <label>
                    <span class="label-text">Value</span>
                    <input
                        class="auth-input"
                        placeholder="Enter API key value"
                        value={auth.value}
                        oninput={(e) =>
                            updateAuth({
                                value: (e.target as HTMLInputElement).value,
                            })}
                    />
                </label>
                <label>
                    <span class="label-text">Add to</span>
                    <select
                        class="auth-select"
                        value={auth.addTo}
                        onchange={(e) =>
                            updateAuth({
                                addTo: (e.target as HTMLSelectElement).value as
                                    | "header"
                                    | "query",
                            })}
                    >
                        <option value="header">Header</option>
                        <option value="query">Query Params</option>
                    </select>
                </label>
            {:else}
                <div class="empty-state">
                    <p>This request does not use any authorization.</p>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .tab-content {
        padding: 0 5px;
    }

    .auth-type-selector {
        margin-bottom: 16px;
    }

    .label-text {
        display: block;
        margin-bottom: 8px;
        font-size: 13px;
        font-weight: 600;
        color: var(--text-primary);
    }

    .auth-select,
    .auth-input {
        width: 100%;
        padding: 8px 12px;
        font-size: 14px;
        transition: all 0.15s ease;
    }

    .auth-input::placeholder {
        color: var(--text-secondary);
        opacity: 0.5;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .empty-state {
        padding-top: 10px;
        text-align: center;
        color: var(--text-secondary);
        font-size: 14px;
    }

    .empty-state p {
        margin: 0;
    }
</style>
