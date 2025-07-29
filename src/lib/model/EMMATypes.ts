interface Stop {
	name: string;
	lat: number;
	lon: number;
}

interface StopTime {
	stop: Stop;
	arrivalDelay: number | null;
}

interface StopRelationship {
	status: string;
}

interface Trip {
	gtfsId: string;
	tripShortName: string;
	tripHeadsign: string;
	stoptimes: StopTime[];
	arrivalStoptime: StopTime;
}

export interface EmmaVehiclePosition {
	trip: Trip;
	vehicleId: string;
	lat: number;
	lon: number;
	label: string;
	speed: number;
	heading: number;
	stopRelationship: StopRelationship | null;
	prevOrCurrentStop: { stop: Stop } | null;
	nextStop: { stop: Stop } | null;
}