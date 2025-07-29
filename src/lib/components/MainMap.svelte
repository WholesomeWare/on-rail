<script lang="ts">
    import Mavinform from "$lib/sources/Mavinform";
    import { onMount } from "svelte";

    const {
        filter,
        ...rest
    }: {
        filter: "trainsAll" | "trainsSaved" | "trainsActive" | "territoriesAll";
        [key: string]: any;
    } = $props();

    let sveaflet: any = $state(null);
    let isLoaded: boolean = $state(false);

    onMount(async () => {
        sveaflet = await import("sveaflet");
        isLoaded = true;
    });
</script>

<div class="map-container" {...rest}>
    {#if !isLoaded}
        <p>Loading map...</p>
    {:else}
        <sveaflet.Map
            options={{
                center: [47.1625, 19.5033],
                zoom: 7,
                zoomControl: false,
            }}
        >
            <sveaflet.TileLayer
                url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />
            {#if filter === "territoriesAll"}
                {#each Mavinform.Territory.values as territory}
                    <sveaflet.Marker
                        latLng={[territory.latLng.lat, territory.latLng.lng]}
                        options={{
                            title: territory.displayName,
                        }}
                        onclick={() => {
                            window.open(territory.getUrl(), "_blank");
                        }}
                    />
                {/each}
            {/if}
        </sveaflet.Map>
    {/if}
</div>

<style>
    .map-container {
        width: 100%;
        height: 100%;
    }
</style>
