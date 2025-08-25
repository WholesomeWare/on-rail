<script lang="ts">
    import { page } from "$app/state";
    import TrainMap from "$lib/components/TrainMap.svelte";
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import TrainsProvider from "$lib/sources/TrainsProvider";
    import { onMount } from "svelte";

    let gtfsId = $state("");
    let vehiclePosition: EmmaVehiclePosition | null = $state(null);

    onMount(() => {
        gtfsId = page.url.searchParams.get("gtfsId") || "";

        updateVehiclePosition();
    });

    function updateVehiclePosition() {
        TrainsProvider.getTrains().then((trainsData) => {
            vehiclePosition =
                trainsData.trains.find((vp) => vp.trip.gtfsId === gtfsId) ||
                null;
        });
    }
</script>

<div id="main-map">
    <TrainMap {vehiclePosition} />
</div>
<main>
    
</main>

<style>
    #main-map {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 1;
    }

    main {
        position: relative;
        display: flex;
        flex-direction: column;
        height: 100dvh;
        justify-content: space-between;
        padding: var(--spacing);
        gap: var(--spacing);
        pointer-events: none;
        z-index: 2;
    }
</style>
