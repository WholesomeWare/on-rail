<script lang="ts">
    import { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import { onMount } from "svelte";

    const { vehiclePosition, ...rest } = $props();

    let sveaflet: any = $state(null);
    let isLoaded = $state(false);

    onMount(async () => {
        sveaflet = await import("sveaflet");
        isLoaded = true;
    });

    function getTrainColor(train: EmmaVehiclePosition): string {
        // Color based on delay or other properties
        if (train.trip.arrivalStoptime?.arrivalDelay) {
            const delay = train.trip.arrivalStoptime.arrivalDelay;
            if (delay > 3600) return "#ff4444";
            if (delay > 900) return "#ff8800";
            if (delay > 300) return "#ffaa00";
        }
        return "#00aa00"; // Green for on time
    }
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

            {#if vehiclePosition}
                <sveaflet.Marker
                    latLng={[vehiclePosition.lat, vehiclePosition.lon]}
                    options={{
                        title: `${vehiclePosition.trip.tripShortName} - ${vehiclePosition.trip.headsign}`,
                        icon: sveaflet.divIcon({
                            className: "custom-train-marker",
                            html: `<div class="train-marker" style="background-color: ${getTrainColor(vehiclePosition)};">
                                        🚆
                                   </div>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                        }),
                    }}
                    onclick={() => {
                        console.log("Train clicked:", vehiclePosition);
                        // You can add train detail popup here
                    }}
                />
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
        background: transparent !important;
        border: none !important;
    }

    :global(.train-marker) {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        transition: transform 0.2s;
    }

    :global(.train-marker:hover) {
        transform: scale(1.1);
    }

    /* Responsive design */
    @media (max-width: 768px) {
        :global(.train-marker) {
            width: 24px;
            height: 24px;
            font-size: 14px;
        }
    }
</style>
