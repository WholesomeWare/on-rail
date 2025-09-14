<script lang="ts">
    import { page } from "$app/state";
    import TrainMap from "$lib/components/TrainMap.svelte";
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import TrainsProvider from "$lib/sources/TrainsProvider";
    import { onMount } from "svelte";

    let gtfsId = $state("");
    let vehiclePosition: EmmaVehiclePosition | null = $state(null);

    const TAB_MAP = 0;
    const TAB_CHAT = 1;
    let selectedTab = $state(0);

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
    <div>
        <button
            class="leading"
            class:toggle-off={selectedTab !== TAB_MAP}
            onclick={() => (selectedTab = TAB_MAP)}
        >
            Térkép
        </button>
        <button
            class="trailing"
            class:toggle-off={selectedTab !== TAB_CHAT}
            onclick={() => (selectedTab = TAB_CHAT)}
        >
            Chat
        </button>
    </div>
    {#if selectedTab === TAB_CHAT}
        <div class="surface-container card" style="flex: 1;">
            <!-- TODO: Chat here -->
        </div>
    {/if}
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

    main > * {
        pointer-events: all;
    }
</style>
