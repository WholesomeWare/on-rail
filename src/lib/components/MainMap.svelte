<script lang="ts">
    import Mavinform from "$lib/sources/Mavinform";
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import { onMount } from "svelte";

    const {
        filter,
        vehicles = [],
        ...rest
    }: {
        filter: "trainsAll" | "trainsSaved" | "trainsActive" | "territoriesAll";
        vehicles?: EmmaVehiclePosition[];
        [key: string]: any;
    } = $props();

    let sveaflet: any = $state(null);
    let isLoaded: boolean = $state(false);

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

    function getTrainDelayMarkerClass(train: EmmaVehiclePosition): string {
        const delay = train.trip.arrivalStoptime?.arrivalDelay || 0;
        if (delay > 3600) return "delay-drastic";
        if (delay > 900) return "delay-major";
        if (delay > 300) return "delay-minor";
        return "delay-none";
    }

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

    function formatTrainInfo(train: EmmaVehiclePosition): string {
        const shortName = train.trip.tripShortName || "Unknown";
        const headsign = train.trip.tripHeadsign || "";
        const delay = train.trip.arrivalStoptime?.arrivalDelay || 0;
        const delayText = delay > 0 ? ` (+${Math.round(delay / 60)}min)` : "";

        return `${shortName} ${headsign}${delayText}`;
    }

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

            {#if filter.startsWith("trains") && vehicles.length > 0}
                {#each vehicles as train (train.trip.gtfsId)}
                    <sveaflet.Marker
                        latLng={[train.lat, train.lon]}
                        options={{
                            title: formatTrainInfo(train),
                        }}
                        onclick={() => {
                            window.location.href =
                                "/train/?gtfsId=" + train.trip.gtfsId;
                        }}
                    >
                        <sveaflet.DivIcon
                            options={{
                                className: `custom-train-marker ${getTrainDelayMarkerClass(train)}`,
                            }}
                        >
                            <p>{getTrainIcon(train)}</p>
                        </sveaflet.DivIcon>
                    </sveaflet.Marker>
                {/each}
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
