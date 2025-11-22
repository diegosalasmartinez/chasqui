<script lang="ts">
    import SunSvg from "$lib/assets/icons/sun.svg?raw";
    import MoonSvg from "$lib/assets/icons/moon.svg?raw";

    $: current = document.documentElement.dataset.theme || "dark";
    $: isDark = current === "dark";

    const setTheme = (theme: "dark" | "light") => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);

        current = theme;
    };
</script>

<button class="ghost" onclick={() => setTheme(isDark ? "light" : "dark")}>
    {@html isDark ? SunSvg : MoonSvg}
</button>
