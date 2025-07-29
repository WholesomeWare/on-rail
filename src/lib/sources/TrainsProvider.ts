import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";

export interface TrainsData {
    trains: EmmaVehiclePosition[];
    /**
     * The last time the trains data was updated, in milliseconds since the epoch.
     */
    lastUpdated: number;
}

export default class TrainsProvider {

    private static updateLocalCache(trains: EmmaVehiclePosition[]): void {
        const json = JSON.stringify(trains);
        localStorage.setItem('trains', json);
        // Update the last updated time to the current time in milliseconds
        localStorage.setItem('trainsLastUpdated', new Date().getTime().toString());
    }

    private static getTrainsFromLocalCache(): TrainsData {
        const json = localStorage.getItem('trains');
        const lastUpdated = localStorage.getItem('trainsLastUpdated');
        if (!json || !lastUpdated) {
            return { trains: [], lastUpdated: 0 };
        }
        const trains = JSON.parse(json) as EmmaVehiclePosition[];
        return { trains, lastUpdated: parseInt(lastUpdated) };
    }

    static async getTrains(): Promise<TrainsData> {
        //TODO: Implement
        return this.getTrainsFromLocalCache();
    }

}