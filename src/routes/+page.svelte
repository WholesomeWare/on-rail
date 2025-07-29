<script lang="ts">
    import MainMap from "$lib/components/MainMap.svelte";

    const TAB_MAP = "map";
    const TAB_MAVINFORM = "mavinform";

    let selectedTab: "map" | "mavinform" = $state(TAB_MAP);
    let selectedFilter: "trainsAll" | "trainsSaved" | "trainsActive" | "territoriesAll" = $state("trainsAll");
</script>

<div id="main-map">
    <MainMap filter={selectedFilter} />
</div>
<main class="col-s-12 col-m-6 col-l-4" style="z-index: 2;">
    <div class="top">
        <header>
            <div class="surface-container card padding" style="flex: 1;">
                <h3>Sínen Vagyunk</h3>
                <p>Adatok nem elérhetők</p>
            </div>
            <button class="fab elevation-0"> Profil </button>
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
