<script lang="ts">
    import SunIcon from "$lib/ui/icons/SunIcon.svelte";
    import MoonIcon from "$lib/ui/icons/MoonIcon.svelte";

    $: current = document.documentElement.dataset.theme || "dark";
    $: isDark = current === "dark";

    const setTheme = (theme: "dark" | "light") => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);

        current = theme;
    };
</script>

<button class="ghost" onclick={() => setTheme(isDark ? "light" : "dark")}>
    {#if isDark}
        <SunIcon />
    {:else}
        <MoonIcon />
    {/if}
</button>
