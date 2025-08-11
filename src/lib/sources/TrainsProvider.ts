import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";
import { browser } from '$app/environment';
import { EMMA } from "./EMMA.js";
import { RTDB } from "./RTDB.js";

export interface TrainsData {
    trains: EmmaVehiclePosition[];
    /**
     * The last time the trains data was updated, in milliseconds since the epoch.
     */
    lastUpdated: number;
}

export default class TrainsProvider {
    static readonly SERVER_UPDATE_INTERVAL = 1000 * 60; // 60 seconds

    private static updateLocalCache(trains: EmmaVehiclePosition[], lastUpdatedTimestamp: number): void {
        if (!browser) return;
        
        try {
            const json = JSON.stringify(trains);
            localStorage.setItem('trains', json);
            localStorage.setItem('trainsLastUpdated', lastUpdatedTimestamp.toString());
        } catch (error) {
            console.error('Error updating local cache:', error);
        }
    }

    private static getTrainsFromLocalCache(): TrainsData {
        if (!browser) {
            return { trains: [], lastUpdated: 0 };
        }
        
        try {
            const json = localStorage.getItem('trains');
            const lastUpdated = localStorage.getItem('trainsLastUpdated');
            
            if (!json || !lastUpdated) {
                return { trains: [], lastUpdated: 0 };
            }
            
            const trains = JSON.parse(json) as EmmaVehiclePosition[];
            // Sort by train number for consistency
            const sortedTrains = trains.sort((a, b) => {
                const nameA = a.trip.tripShortName ?? '';
                const nameB = b.trip.tripShortName ?? '';
                return nameA.localeCompare(nameB, undefined, { numeric: true });
            });
            
            return { trains: sortedTrains, lastUpdated: parseInt(lastUpdated) };
        } catch (error) {
            console.error('Error getting trains from local cache:', error);
            return { trains: [], lastUpdated: 0 };
        }
    }

    private static getLocalCacheLastUpdated(): number {
        if (!browser) return 0;
        
        try {
            const lastUpdated = localStorage.getItem('trainsLastUpdated');
            return lastUpdated ? parseInt(lastUpdated) : 0;
        } catch (error) {
            console.error('Error getting local cache timestamp:', error);
            return 0;
        }
    }

    private static async getTrainsFromInternet(): Promise<{ trains: EmmaVehiclePosition[], lastUpdated: number }> {
        if (!browser) {
            return { trains: [], lastUpdated: 0 };
        }
        
        try {
            // Get the relevance (last update time) from RTDB
            const lastUpdated = await RTDB.getVehiclePositionsRelevance();

            const currentTime = Date.now();
            const isMyDataOutdated = lastUpdated < currentTime - this.SERVER_UPDATE_INTERVAL;

            // Check if we have internet connection (basic check)
            const hasInternet = navigator.onLine;

            if (hasInternet && isMyDataOutdated) {
                // Data is outdated, fetch from EMMA API
                console.log('Data is outdated, fetching from EMMA API...');
                const trains = await EMMA.fetchTrains();
                
                if (trains.length > 0) {
                    // Update RTDB with fresh data
                    await RTDB.updateVehicleData(trains);
                    return { trains, lastUpdated: currentTime };
                }
            }

            // Use RTDB data if available
            console.log('Using RTDB data...');
            const trains = await RTDB.getVehiclePositions();
            
            if (trains.length > 0) {
                const rtdbRelevance = await RTDB.getVehiclePositionsRelevance();
                return { trains, lastUpdated: rtdbRelevance };
            }

            // No data available
            console.warn('No trains found in RTDB or EMMA API');
            return { trains: [], lastUpdated };
        } catch (error) {
            console.error('Error getting trains from internet:', error);
            return { trains: [], lastUpdated: 0 };
        }
    }

    static async getTrains(): Promise<TrainsData> {
        if (!browser) {
            // On server-side, return empty data
            return { trains: [], lastUpdated: 0 };
        }
        
        const cachedData = this.getTrainsFromLocalCache();
        const cachedTrains = cachedData.trains;
        const lastUpdatedTimestamp = cachedData.lastUpdated;

        // If there is no internet connection, use local cache
        if (!navigator.onLine) {
            console.log('No internet connection, using local cache');
            return { trains: cachedTrains, lastUpdated: lastUpdatedTimestamp };
        }

        try {
            // Get trains from internet if available
            // 1. Check if RTDB is outdated
            // 2. If outdated, fetch from EMMA
            // 3. If not outdated, use RTDB data
            const internetResult = await this.getTrainsFromInternet();
            
            if (internetResult.trains.length > 0) {
                // Update local cache with fresh data
                this.updateLocalCache(internetResult.trains, internetResult.lastUpdated);
                return internetResult;
            } else {
                // If no trains found from internet, return cached data
                console.log('No trains found from internet, using cached data');
                return { trains: cachedTrains, lastUpdated: lastUpdatedTimestamp };
            }
        } catch (error) {
            console.error('Error in getTrains:', error);
            // On error, fall back to cached data
            return { trains: cachedTrains, lastUpdated: lastUpdatedTimestamp };
        }
    }

    /**
     * Clears the local cache
     */
    static clearCache(): void {
        if (!browser) return;
        
        try {
            localStorage.removeItem('trains');
            localStorage.removeItem('trainsLastUpdated');
            console.log('Local train cache cleared');
        } catch (error) {
            console.error('Error clearing cache:', error);
        }
    }

    /**
     * Gets the age of the cached data in milliseconds
     */
    static getCacheAge(): number {
        if (!browser) return 0;
        
        const lastUpdated = this.getLocalCacheLastUpdated();
        return lastUpdated > 0 ? Date.now() - lastUpdated : 0;
    }

    /**
     * Checks if the cached data is considered stale
     */
    static isCacheStale(): boolean {
        if (!browser) return true;
        
        return this.getCacheAge() > this.SERVER_UPDATE_INTERVAL;
    }
}