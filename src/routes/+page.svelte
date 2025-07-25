<script>
    import MainMap from "$lib/components/MainMap.svelte";
</script>

<MainMap
    style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: -1;"
/>
<main class="col-s-12 col-m-6 col-l-4">
    <div class="top">
        <header>
            <div class="surface-container card" style="flex: 1;">
                <h3>Sínen Vagyunk</h3>
                <p>Adatok nem elérhetők</p>
            </div>
            <button> Profil </button>
        </header>
    </div>
    <div class="bottom">
        <div class="surface-container card">
            <div class="row">
                <input type="text" class="col-s-12 col-m-6" placeholder="Keresés járatszám vagy végállomás alapján" />
                <select class="col-s-12 col-m-6">
                    <option value="trainsAll">Összes vonat</option>
                    <option value="trainsSaved">Mentett vonatok</option>
                    <option value="trainsActive">Aktív vonatok</option>
                    <option value="territoryAll">Területek</option>
                </select>
            </div>
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        justify-content: space-between;
    }

    main > :is(.top, .bottom) {
        display: flex;
        flex-direction: column;
        gap: var(--spacing);
        padding: var(--spacing);
    }

    header {
        display: flex;
        flex-direction: row;
        gap: var(--spacing);
    }
</style>
