<script lang="ts">
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import { onMount } from "svelte";

    const { vehiclePosition, ...rest } = $props();

    let sveaflet: any = $state(null);
    let isLoaded = $state(false);

    onMount(async () => {
        sveaflet = await import("sveaflet");
        isLoaded = true;
    });

    function getTrainDelayMarkerClass(train: EmmaVehiclePosition): string {
        const delay = train.trip.arrivalStoptime?.arrivalDelay || 0;
        if (delay > 3600) return "delay-drastic";
        if (delay > 900) return "delay-major";
        if (delay > 300) return "delay-minor";
        return "delay-none";
    }

    function getTrainIcon(train: EmmaVehiclePosition): string {
        // You can customize this based on train properties
        if (train.trip.tripShortName?.toLowerCase().includes("ic")) {
            return "🚄"; // High-speed train for InterCity
        } else if (train.trip.tripShortName?.toLowerCase().includes("ec")) {
            return "🚅"; // High-speed train for EuroCity
        } else if (train.label?.toLowerCase().includes("bus")) {
            return "🚌"; // Bus for replacement services
        }
        return "🚆"; // Regular train
    }
</script>

<div class="map-container" {...rest}>
    {#if !isLoaded}
        <p>Térkép betöltése...</p>
    {:else if !vehiclePosition}
        <p>Vonat keresése...</p>
    {:else}
        <sveaflet.Map
            options={{
                center: [vehiclePosition.lat, vehiclePosition.lon],
                zoom: 7,
                zoomControl: false,
            }}
        >
            <sveaflet.TileLayer
                url={"https://tile.openstreetmap.org/{z}/{x}/{y}.png"}
            />

            {#if vehiclePosition}
                <sveaflet.Marker
                    latLng={[vehiclePosition.lat, vehiclePosition.lon]}
                    options={{
                        title: `${vehiclePosition.trip.tripShortName} - ${vehiclePosition.trip.headsign}`,
                    }}
                    onclick={() => {
                        console.log("Train clicked:", vehiclePosition);
                        // You can add train detail popup here
                    }}
                >
                    <sveaflet.DivIcon
                        options={{
                            className: `custom-train-marker ${getTrainDelayMarkerClass(vehiclePosition)}`,
                        }}
                    >
                        <p>{getTrainIcon(vehiclePosition)}</p>
                    </sveaflet.DivIcon>
                </sveaflet.Marker>
            {/if}
        </sveaflet.Map>
    {/if}
</div>

<style>
    .map-container {
        width: 100%;
        height: 100%;
        position: relative;
    }

    /* Train marker styles */
    :global(.custom-train-marker) {
        width: 32px !important;
        height: 32px !important;
        border-radius: 50%;
        display: flex !important;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
    }

    :global(.custom-train-marker.delay-none) {
        background-color: #00aa00;
        z-index: 1 !important;
    }

    :global(.custom-train-marker.delay-minor) {
        background-color: #ffaa00;
        z-index: 2 !important;
    }

    :global(.custom-train-marker.delay-major) {
        background-color: #ff8800;
        z-index: 3 !important;
    }

    :global(.custom-train-marker.delay-drastic) {
        background-color: #ff4444;
        z-index: 4 !important;
    }
</style>
