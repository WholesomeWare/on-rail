<script lang="ts">
    import { page } from "$app/state";
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
            vehiclePosition = trainsData.trains.find(vp => vp.trip.gtfsId === gtfsId) || null;
        });
    }
</script>