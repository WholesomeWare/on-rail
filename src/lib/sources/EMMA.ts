import { dev } from '$app/environment';
import type { EmmaVehiclePosition } from "$lib/model/EMMATypes";

interface GraphQLResponse {
	data: {
		vehiclePositions: EmmaVehiclePosition[];
	};
}

// --- Static API Class ---

/**
 * A static class to namespace methods for interacting with the MÁV EMMA API.
 * It cannot be instantiated.
 */
export class EMMA {
	// Use development proxy in dev mode, CORS proxy in production
	private static readonly BASE_URL = dev 
		? '/api/emma'  // Development proxy
		: 'https://corsproxy.io/?https://emma.mav.hu/otp2-backend/otp/routers/default/index/graphql';  // Production CORS proxy

	/**
	 * Private constructor to prevent instantiation of this static class.
	 */
	private constructor() {}

	/**
	 * Fetches real-time vehicle positions from the MÁV EMMA API.
	 * @returns A promise that resolves to an array of vehicle positions, sorted by train number.
	 */
	public static async fetchTrains(): Promise<EmmaVehiclePosition[]> {
		const query = `
        {
            vehiclePositions(
                swLat: 45.5, swLon: 16.1, neLat: 48.7, neLon: 22.8,
                modes: [RAIL, RAIL_REPLACEMENT_BUS]
            ) {
                trip {
                    gtfsId tripShortName tripHeadsign
                    stoptimes {
                        stop { name lat lon }
                        arrivalDelay
                    }
                    arrivalStoptime {
                        stop { name lat lon }
                        arrivalDelay
                    }
                }
                vehicleId lat lon label speed heading
                stopRelationship { status }
                prevOrCurrentStop { stop { name lat lon } }
                nextStop { stop { name lat lon } }
            }
        }`;

		console.log(`Fetching trains from: ${this.BASE_URL}`);
		console.log(`Environment: ${dev ? 'development' : 'production'}`);

		try {
			const response = await fetch(this.BASE_URL, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'User-Agent': 'OnRail/1.0'
				},
				body: JSON.stringify({ query })
			});

			if (!response.ok) {
				console.error(`EMMA API request failed: ${response.status} ${response.statusText}`);
				
				// Try to get more details about the error
				const errorText = await response.text();
				console.error('Error response body:', errorText);
				
				return [];
			}

			const jsonResponse = (await response.json()) as GraphQLResponse;
			
			if (!jsonResponse.data || !jsonResponse.data.vehiclePositions) {
				console.error('Invalid response structure:', jsonResponse);
				return [];
			}
			
			const vehicles = jsonResponse.data.vehiclePositions;
			console.log(`Successfully fetched ${vehicles.length} vehicles`);

			// Sort by train number using a robust numeric sort
			return vehicles.sort((a, b) => {
				const nameA = a.trip.tripShortName ?? '';
				const nameB = b.trip.tripShortName ?? '';
				return nameA.localeCompare(nameB, undefined, { numeric: true });
			});
		} catch (error) {
			console.error('Error fetching train data from EMMA:', error);
			
			// If we're in production and the CORS proxy fails, we could try alternative proxies
			if (!dev && error instanceof TypeError && error.message.includes('Failed to fetch')) {
				console.log('CORS proxy may be down, you might need to try a different proxy service');
			}
			
			return [];
		}
	}
}