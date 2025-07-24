<script lang="ts">
    import { onMount } from "svelte";

    const {
        ...rest
    }: {
        [key: string]: any;
    } = $props();

    let sveaflet: any = $state(null);
    let isLoaded: boolean = $state(false);

    onMount(async () => {
        sveaflet = await import("sveaflet");
        isLoaded = true;
    });
</script>

<div {...rest}>
    {#if !isLoaded}
        <p>Loading map...</p>
    {:else}
        <sveaflet.Map
            options={{
                center: [47.1625, 19.5033],
                zoom: 7,
            }}
        >
            <sveaflet.TileLayer
                url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />
            <sveaflet.Marker latLng={[51.505, -0.09]} />
        </sveaflet.Map>
    {/if}
</div>
