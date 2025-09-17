<script lang="ts">
    import MainMap from "$lib/components/MainMap.svelte";
    import TrainsProvider, {
        type TrainsData,
    } from "$lib/sources/TrainsProvider";
    import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    import { signInWithGoogle } from "$lib/firebase/auth.svelte";

    const TAB_MAP = "map";
    const TAB_MAVINFORM = "mavinform";

    let selectedTab: "map" | "mavinform" = $state(TAB_MAP);
    let selectedFilter:
        | "trainsAll"
        | "trainsSaved"
        | "trainsActive"
        | "territoriesAll" = $state("trainsAll");

    // Train data state
    let trainsData: TrainsData = $state({ trains: [], lastUpdated: 0 });
    let isLoadingTrains: boolean = $state(false);
    let error: string | null = $state(null);

    // Filtered vehicles based on current filter
    let filteredVehicles: EmmaVehiclePosition[] = $derived.by(() => {
        if (!selectedFilter.startsWith("trains")) return [];

        switch (selectedFilter) {
            case "trainsAll":
                return trainsData.trains;
            case "trainsSaved":
                // TODO: Implement saved trains filtering
                return trainsData.trains.filter(
                    (train) =>
                        train.trip.tripShortName
                            ?.toLowerCase()
                            .includes("ic") ||
                        train.trip.tripShortName?.toLowerCase().includes("ec"),
                );
            case "trainsActive":
                // TODO: Implement active trains filtering (maybe based on recent updates or movement)
                return trainsData.trains.filter((train) => train.speed > 0);
            default:
                return trainsData.trains;
        }
    });

    async function loadTrains() {
        if (!browser) return;

        isLoadingTrains = true;
        error = null;

        try {
            const data = await TrainsProvider.getTrains();
            trainsData = data;
            console.log(
                `Loaded ${data.trains.length} trains, last updated: ${new Date(data.lastUpdated).toLocaleString()}`,
            );
        } catch (err) {
            console.error("Error loading trains:", err);
            error = "Failed to load train data";
            trainsData = { trains: [], lastUpdated: 0 };
        } finally {
            isLoadingTrains = false;
        }
    }

    function getStatusText(): string {
        if (isLoadingTrains) return "Adatok betöltése...";
        if (error) return `Hiba: ${error}`;
        if (!selectedFilter.startsWith("trains"))
            return "Területek megtekintése";

        const count = filteredVehicles.length;
        const lastUpdated = trainsData.lastUpdated;

        if (count === 0) return "Nincs elérhető vonat";

        const updateText =
            lastUpdated > 0
                ? ` • Frissítve: ${new Date(lastUpdated).toLocaleTimeString()}`
                : "";

        return `${count} vonat${updateText}`;
    }

    onMount(() => {
        // Load trains on mount if needed
        if (selectedFilter.startsWith("trains")) {
            loadTrains();
        }
    });

    // Reactive: reload trains when filter changes
    $effect(() => {
        if (browser && selectedFilter.startsWith("trains")) {
            loadTrains();
        }
    });
</script>

<div id="main-map">
    <MainMap filter={selectedFilter} vehicles={filteredVehicles} />
</div>
<main class="col-s-12 col-m-6 col-l-4" style="z-index: 2;">
    <div class="top">
        <header>
            <div class="surface-container card padding row" style="flex: 1;">
                <div style="flex: 1;">
                    <h3>Sínen Vagyunk</h3>
                    <p>{getStatusText()}</p>
                </div>
                {#if selectedFilter.startsWith("trains") && !isLoadingTrains && !error}
                    <button
                        class="refresh-btn"
                        onclick={loadTrains}
                        disabled={isLoadingTrains}
                        title="Adatok frissítése"
                    >
                        {isLoadingTrains ? "🔄" : "↻"}
                    </button>
                {/if}
            </div>
            <button class="fab elevation-0" onclick={() => signInWithGoogle()}>
                Profil
            </button>
        </header>
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
                class:toggle-off={selectedTab !== TAB_MAVINFORM}
                onclick={() => (selectedTab = TAB_MAVINFORM)}
            >
                MÁVINFORM
            </button>
        </div>
    </div>
    {#if selectedTab === TAB_MAVINFORM}
        <div class="surface-container card" style="flex: 1;">
            <iframe
                src="https://www.mavcsoport.hu/mavinform?field_modalitas_value%5B%5D=vasut"
                style="width: 100%; height: 100%;"
                frameborder="0"
            ></iframe>
        </div>
    {/if}
    <div class="bottom">
        <div class="surface-container card padding">
            <div class="row">
                <input
                    type="text"
                    class="col-s-12 col-m-6"
                    placeholder="Keresés járatszám vagy végállomás alapján"
                />
                <select class="col-s-12 col-m-6" bind:value={selectedFilter}>
                    <option value="trainsAll">Összes vonat</option>
                    <option value="trainsSaved">Mentett vonatok</option>
                    <option value="trainsActive">Aktív vonatok</option>
                    <option value="territoriesAll">Területek</option>
                </select>
            </div>
        </div>
    </div>
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

    main > :is(.top, .bottom) {
        display: flex;
        flex-direction: column;
        gap: var(--spacing);
    }

    header {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: var(--spacing);
    }
</style>
