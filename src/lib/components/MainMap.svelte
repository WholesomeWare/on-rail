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
        if (train.trip.tripShortName?.toLowerCase().includes('ic')) {
            return '🚄'; // High-speed train for InterCity
        } else if (train.trip.tripShortName?.toLowerCase().includes('ec')) {
            return '🚅'; // High-speed train for EuroCity
        } else if (train.label?.toLowerCase().includes('bus')) {
            return '🚌'; // Bus for replacement services
        }
        return '🚆'; // Regular train
    }

    function getTrainColor(train: EmmaVehiclePosition): string {
        // Color based on delay or other properties
        if (train.trip.arrivalStoptime?.arrivalDelay) {
            const delay = train.trip.arrivalStoptime.arrivalDelay;
            if (delay > 900) return '#ff4444'; // Red for >15min delay
            if (delay > 300) return '#ff8800'; // Orange for >5min delay
            if (delay > 0) return '#ffaa00';   // Yellow for any delay
        }
        return '#00aa00'; // Green for on time
    }

    function formatTrainInfo(train: EmmaVehiclePosition): string {
        const shortName = train.trip.tripShortName || 'Unknown';
        const headsign = train.trip.tripHeadsign || '';
        const delay = train.trip.arrivalStoptime?.arrivalDelay || 0;
        const delayText = delay > 0 ? ` (+${Math.round(delay / 60)}min)` : '';
        
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

            {#if filter.startsWith('trains') && vehicles.length > 0}
                {#each vehicles as train (train.trip.gtfsId)}
                    <sveaflet.Marker
                        latLng={[train.lat, train.lon]}
                        options={{
                            title: formatTrainInfo(train),
                        }}
                        onclick={() => {
                            console.log('Train clicked:', train);
                            // You can add train detail popup here
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
