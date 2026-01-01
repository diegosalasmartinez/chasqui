<script lang="ts">
    interface Props {
        size?: number;
        direction?: "up" | "down" | "left" | "right";
    }

    let { size = 20, direction = "down" }: Props = $props();

    const rotation = $derived(
        direction === "up" ? 180 :
        direction === "left" ? 90 :
        direction === "right" ? -90 : 0
    );
</script>

<svg
    width={size}
    height={size}
    viewBox="0 0 20 20"
    style:transform="rotate({rotation}deg)"
    style:transition="transform 0.2s ease"
>
    <path
        d="M5.5 7.5l4.5 4.5 4.5-4.5"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
    />
</svg>
