<script lang="ts">
    import { page } from "$app/state";
    import { goto } from "$app/navigation";
    import TrainMap from "$lib/components/TrainMap.svelte";
    import ChatView from "$lib/components/ChatView.svelte";
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import { ChatRoomType } from "$lib/sources/RTDB";
    import TrainsProvider from "$lib/sources/TrainsProvider";
    import { onMount } from "svelte";

    let gtfsId = $state("");
    let vehiclePosition: EmmaVehiclePosition | null = $state(null);

    const TAB_MAP = 0;
    const TAB_CHAT = 1;
    const TAB_REPORTS_ONLY = 2;
    let selectedTab = $state(0);

    // Derived values for chat
    const trainShortName = $derived(() => {
        return vehiclePosition?.trip?.tripShortName || gtfsId;
    });
    
    // Calculate delay in minutes from the arrival stoptime
    const delayMinutes = $derived(() => {
        if (!vehiclePosition?.trip?.arrivalStoptime?.arrivalDelay) return 0;
        return Math.round(vehiclePosition.trip.arrivalStoptime.arrivalDelay / 60);
    });
    
    const trainDelayColor = $derived(() => {
        if (!vehiclePosition) return 'var(--primary)';
        
        const delay = delayMinutes();
        if (delay <= 2) return 'var(--colorDelayNone)';
        if (delay <= 15) return 'var(--colorDelayMinor)';
        if (delay <= 60) return 'var(--colorDelayMajor)';
        return 'var(--colorDelayDrastic)';
    });
    
    const trainOnDelayColor = $derived(() => {
        if (!vehiclePosition) return 'var(--onPrimary)';
        
        const delay = delayMinutes();
        if (delay <= 2) return 'var(--onColorDelayNone)';
        if (delay <= 15) return 'var(--onColorDelayMinor)';
        if (delay <= 60) return 'var(--onColorDelayMajor)';
        return 'var(--onColorDelayDrastic)';
    });

    onMount(() => {
        gtfsId = page.url.searchParams.get("gtfsId") || "";

        updateVehiclePosition();
        
        // Update train position every 30 seconds
        const interval = setInterval(updateVehiclePosition, 30000);
        
        return () => clearInterval(interval);
    });

    function updateVehiclePosition() {
        TrainsProvider.getTrains().then((trainsData) => {
            vehiclePosition =
                trainsData.trains.find((vp) => vp.trip.gtfsId === gtfsId) ||
                null;
        });
    }

    // Add body class for map overlay effect
    $effect(() => {
        if (typeof document !== 'undefined') {
            if (selectedTab !== TAB_MAP) {
                document.body.classList.add('map-overlay');
            } else {
                document.body.classList.remove('map-overlay');
            }
        }
    });

    function goBack() {
        goto('/');
    }
</script>

<div id="main-map">
    <TrainMap {vehiclePosition} />
</div>
<main>
    <!-- Header with train info -->
    <div class="header-container surface-container card">
        <div class="header-content">
            <button class="back-button" onclick={goBack} title="Vissza a főoldalra">
                <span class="material-symbols-outlined">arrow_back</span>
            </button>
            <div class="train-info">
                <h1>{trainShortName()}</h1>
                {#if vehiclePosition}
                    <p class="destination">→ {vehiclePosition.trip.tripHeadsign}</p>
                    <p class="delay-info" style:color={trainDelayColor()}>
                        {#if delayMinutes() > 0}
                            {delayMinutes()} perc késés
                        {:else if delayMinutes() < 0}
                            {Math.abs(delayMinutes())} perc korábban
                        {:else}
                            Időben
                        {/if}
                    </p>
                {/if}
            </div>
        </div>
    </div>

    <!-- Tab navigation -->
    <div class="tab-container">
        <button
            class="leading"
            class:toggle-off={selectedTab !== TAB_MAP}
            onclick={() => (selectedTab = TAB_MAP)}
        >
            <span class="material-symbols-outlined">map</span>
            Térkép
        </button>
        <button
            class="middle"
            class:toggle-off={selectedTab !== TAB_CHAT}
            onclick={() => (selectedTab = TAB_CHAT)}
        >
            <span class="material-symbols-outlined">chat_bubble</span>
            Chat
        </button>
        <button
            class="trailing"
            class:toggle-off={selectedTab !== TAB_REPORTS_ONLY}
            onclick={() => (selectedTab = TAB_REPORTS_ONLY)}
        >
            <span class="material-symbols-outlined">report</span>
            Jelentések
        </button>
    </div>

    <!-- Chat content -->
    {#if selectedTab !== TAB_MAP && trainShortName()}
        <div class="chat-container surface-container card">
            <ChatView
                chatRoomType={ChatRoomType.TRAIN}
                chatRoomId={trainShortName()}
                showReportsOnly={selectedTab === TAB_REPORTS_ONLY}
                allowTrainReports={true}
                selfColor={trainDelayColor()}
                onSelfColor={trainOnDelayColor()}
            />
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
        padding: var(--spacing);
        gap: var(--spacing);
        pointer-events: none;
        z-index: 2;
    }

    main > * {
        pointer-events: all;
    }

    .header-container {
        padding: var(--spacing-double);
    }

    .header-content {
        display: flex;
        align-items: flex-start;
        gap: var(--spacing-double);
    }

    .back-button {
        background: none;
        border: none;
        padding: calc(var(--spacing) * 0.5);
        cursor: pointer;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--onSurface);
        transition: background-color 0.2s ease;
        flex-shrink: 0;
        margin-top: 2px; /* Slight adjustment to align with text */
    }

    .back-button:hover {
        background-color: var(--surfaceVariant);
    }

    .back-button .material-symbols-outlined {
        font-size: 1.5em;
    }

    .train-info {
        flex: 1;
    }

    .train-info h1 {
        margin: 0 0 calc(var(--spacing) * 0.5) 0;
        font-size: 1.5em;
        color: var(--onSurface);
    }

    .train-info .destination {
        margin: 0 0 calc(var(--spacing) * 0.5) 0;
        color: var(--onSurfaceVariant);
        font-size: 0.9em;
    }

    .train-info .delay-info {
        margin: 0;
        font-weight: 600;
        font-size: 0.9em;
    }

    .tab-container {
        display: flex;
        gap: 0;
    }

    .tab-container button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: calc(var(--spacing) * 0.5);
        padding: var(--spacing-double);
        font-size: 0.9em;
        font-weight: 500;
        min-height: 48px;
    }

    .tab-container .material-symbols-outlined {
        font-size: 1.2em;
    }

    .chat-container {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }

    /* Show map overlay when not on map tab */
    #main-map::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--surface);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        z-index: 1;
    }

    :global(.map-overlay) #main-map::after {
        opacity: 0.9;
    }
</style>
