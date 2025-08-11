export interface Message {
	key?: string;
	timestamp: number;
	senderId: string;
	senderName: string;
	messageType: string;
	content: string;
	location: string;
	color: number;
}

export const MessageType = {
	TEXT: 'text',
	REPORT: 'report',
	LOCATION_PING: 'location_ping'
} as const;

export type MessageTypeValue = typeof MessageType[keyof typeof MessageType];

export const MessageColor = {
	DEFAULT: 0x00000000, // Transparent
	WARNING: 0xFFFFA500, // Orange
	ERROR: 0xFFFF0000,   // Red
	BLUE: 0xFF0000FF     // Blue
} as const;

// Factory function for creating report messages
function createReport(content: string, color: number = MessageColor.ERROR): Omit<Message, 'key' | 'timestamp' | 'senderId' | 'senderName' | 'location'> {
	return {
		messageType: MessageType.REPORT,
		content,
		color
	};
}

// Predefined messages
export const PredefinedMessages = {
	LOCATION_PING: {
		messageType: MessageType.LOCATION_PING,
		content: 'Hely küldése üzenet nélkül',
		color: MessageColor.DEFAULT
	} as Omit<Message, 'key' | 'timestamp' | 'senderId' | 'senderName' | 'location'>,

	REPORT_SEAT_TICKET: createReport('Helyjeggyel utazom'),
	REPORT_REPLACEMENT_BUS: createReport('Pótlóbusz'),
	REPORT_OPTION_DELAY_MINOR: createReport('Kis késés (5-15 perc)', MessageColor.WARNING),
	REPORT_OPTION_DELAY_MODERATE: createReport('Közepes késés (15-60 perc)', MessageColor.WARNING),
	REPORT_OPTION_DELAY_MAJOR: createReport('Nagy késés (1 óra+)'),
	REPORT_TEMPERATURE_HIGH: createReport('Nincs légkondi / meleg van', MessageColor.WARNING),
	REPORT_TEMPERATURE_LOW: createReport('Nincs fűtés / hideg van', MessageColor.WARNING),
	REPORT_TRAIN_STOPPED: createReport('Vonat megállt'),
	REPORT_TRACK_BLOCKED: createReport('Pálya elzárva'),
	REPORT_TECHNICAL_ISSUE: createReport('Műszaki hiba'),
	REPORT_EMERGENCY_ACCIDENT: createReport('Vészhelyzet / baleset'),
	REPORT_CROWDING: createReport('Tömeg / zsúfoltság', MessageColor.WARNING),
	REPORT_POLICE_ACTIVITY: createReport('Rendőrségi intézkedés', MessageColor.BLUE)
};

// Array of all report options for easy iteration
export const reportOptions = [
	PredefinedMessages.LOCATION_PING,
	PredefinedMessages.REPORT_SEAT_TICKET,
	PredefinedMessages.REPORT_REPLACEMENT_BUS,
	PredefinedMessages.REPORT_OPTION_DELAY_MINOR,
	PredefinedMessages.REPORT_OPTION_DELAY_MODERATE,
	PredefinedMessages.REPORT_OPTION_DELAY_MAJOR,
	PredefinedMessages.REPORT_TEMPERATURE_HIGH,
	PredefinedMessages.REPORT_TEMPERATURE_LOW,
	PredefinedMessages.REPORT_TRAIN_STOPPED,
	PredefinedMessages.REPORT_TRACK_BLOCKED,
	PredefinedMessages.REPORT_TECHNICAL_ISSUE,
	PredefinedMessages.REPORT_EMERGENCY_ACCIDENT,
	PredefinedMessages.REPORT_CROWDING,
	PredefinedMessages.REPORT_POLICE_ACTIVITY
];

// Factory functions
export const MessageFactory = {
	report: createReport,
	
	createTextMessage: (content: string): Omit<Message, 'key' | 'timestamp' | 'senderId' | 'senderName' | 'location'> => ({
		messageType: MessageType.TEXT,
		content,
		color: MessageColor.DEFAULT
	}),

	createLocationPing: (): Omit<Message, 'key' | 'timestamp' | 'senderId' | 'senderName' | 'location'> => ({
		...PredefinedMessages.LOCATION_PING
	})
};

// Icon mapping function for UI components
export function getMessageIcon(message: Message): string {
	switch (message.messageType) {
		case MessageType.REPORT:
			switch (message.content) {
				case PredefinedMessages.REPORT_SEAT_TICKET.content:
					return 'airline-seat-recline-normal';
				case PredefinedMessages.REPORT_REPLACEMENT_BUS.content:
					return 'bus-alert';
				case PredefinedMessages.REPORT_OPTION_DELAY_MINOR.content:
				case PredefinedMessages.REPORT_OPTION_DELAY_MODERATE.content:
				case PredefinedMessages.REPORT_OPTION_DELAY_MAJOR.content:
					return 'schedule';
				case PredefinedMessages.REPORT_TRAIN_STOPPED.content:
					return 'pause';
				case PredefinedMessages.REPORT_TRACK_BLOCKED.content:
					return 'block';
				case PredefinedMessages.REPORT_TECHNICAL_ISSUE.content:
					return 'electric-bolt';
				case PredefinedMessages.REPORT_EMERGENCY_ACCIDENT.content:
					return 'emergency';
				case PredefinedMessages.REPORT_CROWDING.content:
					return 'people';
				case PredefinedMessages.REPORT_TEMPERATURE_HIGH.content:
					return 'local-fire-department';
				case PredefinedMessages.REPORT_TEMPERATURE_LOW.content:
					return 'severe-cold';
				case PredefinedMessages.REPORT_POLICE_ACTIVITY.content:
					return 'local-police';
				default:
					return 'report';
			}
		case MessageType.LOCATION_PING:
			return 'gps-fixed';
		case MessageType.TEXT:
			return 'chat-bubble';
		default:
			return 'help';
	}
}
