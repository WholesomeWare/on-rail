import { getDatabase, ref, get, set, remove, onChildAdded, onChildRemoved, serverTimestamp, type DataSnapshot, type Unsubscribe } from 'firebase/database';
import { browser } from '$app/environment';
import { app } from '../firebase.js';
import type { EmmaVehiclePosition } from '../model/EMMATypes.js';
import type { Message } from '../model/Message.js';

export enum ChatRoomType {
	TERRITORY = 'territory',
	TRAIN = 'train'
}

export interface ChatRelevances {
	[ChatRoomType.TRAIN]?: Record<string, number>;
	[ChatRoomType.TERRITORY]?: Record<string, number>;
}

export class RTDB {
	// Constants
	static readonly CONFIG_KEY_ACTIVE_FILTER_DURATION_MILLIS = 'ACTIVE_FILTER_DURATION_MILLIS';
	static readonly CONFIG_KEY_EMMA_API_CALL_COOLDOWN = 'EMMA_API_CALL_COOLDOWN';
	static readonly CONFIG_KEY_MOTD = 'MOTD';
	static readonly OLD_MESSAGE_CUTOFF = 1000 * 60 * 60 * 24 * 7; // 7 days
	static readonly MESSAGE_CONTENT_LENGTH_LIMIT = 500;
	static readonly MESSAGE_SENDING_COOLDOWN = 1000 * 5; // 5 seconds

	private static database = browser ? getDatabase(app) : null;
	private static messageUnsubscribes: Unsubscribe[] = [];
	private static lastMessageSentTimestamp = 0;

	private static ensureBrowser(): void {
		if (!browser) {
			throw new Error('RTDB operations can only be performed in the browser');
		}
		if (!this.database) {
			this.database = getDatabase(app);
		}
	}

	// Config methods
	static async getConfigString(key: string, defaultValue: string = ''): Promise<string> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, `config/${key}`));
			if (!snapshot.exists()) {
				return defaultValue;
			}
			return snapshot.val() || defaultValue;
		} catch (error) {
			console.error(`Error getting config string ${key}:`, error);
			return defaultValue;
		}
	}

	static async getConfigNumber(key: string, defaultValue: number = 0): Promise<number> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, `config/${key}`));
			if (!snapshot.exists()) {
				return defaultValue;
			}
			return snapshot.val() || defaultValue;
		} catch (error) {
			console.error(`Error getting config number ${key}:`, error);
			return defaultValue;
		}
	}

	static async getWisecracks(): Promise<string[]> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, 'config/WISECRACKS'));
			if (!snapshot.exists()) {
				return [];
			}
			const wisecracks: string[] = [];
			snapshot.forEach((child) => {
				const value = child.val();
				if (typeof value === 'string') {
					wisecracks.push(value);
				}
			});
			return wisecracks.sort();
		} catch (error) {
			console.error('Error getting wisecracks:', error);
			return [];
		}
	}

	// Chat relevance methods
	static async getChatRelevances(): Promise<ChatRelevances> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, 'stats/relevance'));
			if (!snapshot.exists()) {
				return {};
			}

			const relevanceMap: ChatRelevances = {};
			
			if (snapshot.hasChild(ChatRoomType.TRAIN)) {
				const trainData: Record<string, number> = {};
				snapshot.child(ChatRoomType.TRAIN).forEach((child) => {
					const key = child.key || '(empty)';
					const value = child.val() || 0;
					trainData[key] = value;
				});
				relevanceMap[ChatRoomType.TRAIN] = trainData;
			}

			if (snapshot.hasChild(ChatRoomType.TERRITORY)) {
				const territoryData: Record<string, number> = {};
				snapshot.child(ChatRoomType.TERRITORY).forEach((child) => {
					const key = child.key || '(empty)';
					const value = child.val() || 0;
					territoryData[key] = value;
				});
				relevanceMap[ChatRoomType.TERRITORY] = territoryData;
			}

			return relevanceMap;
		} catch (error) {
			console.error('Error getting chat relevances:', error);
			return {};
		}
	}

	// Vehicle position methods
	static async updateVehicleData(vehicleData: EmmaVehiclePosition[]): Promise<void> {
		this.ensureBrowser();
		if (vehicleData.length === 0) {
			console.warn('updateVehicleData called with empty vehicleData array');
			return;
		}

		try {
			// Convert array to object with tripShortName as key
			const vehicleMap = vehicleData.reduce((acc, vehicle) => {
				const key = vehicle.trip.tripShortName || '(empty)';
				acc[key] = vehicle;
				return acc;
			}, {} as Record<string, EmmaVehiclePosition>);

			// Update vehicle positions
			await set(ref(this.database!, 'vehiclePositions'), vehicleMap);
			
			// Update relevance timestamp
			await set(ref(this.database!, 'stats/relevance/vehiclePositions'), serverTimestamp());
		} catch (error) {
			console.error('Error updating vehicle data:', error);
		}
	}

	static async getVehiclePositions(): Promise<EmmaVehiclePosition[]> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, 'vehiclePositions'));
			if (!snapshot.exists()) {
				return [];
			}

			const vehiclePositions: EmmaVehiclePosition[] = [];
			snapshot.forEach((child) => {
				const vehicle = child.val() as EmmaVehiclePosition;
				if (vehicle) {
					vehiclePositions.push(vehicle);
				}
			});

			return vehiclePositions;
		} catch (error) {
			console.error('Error getting vehicle positions:', error);
			return [];
		}
	}

	static async getVehiclePositionsRelevance(): Promise<number> {
		this.ensureBrowser();
		try {
			const snapshot = await get(ref(this.database!, 'stats/relevance/vehiclePositions'));
			if (!snapshot.exists()) {
				return 0;
			}
			return snapshot.val() || 0;
		} catch (error) {
			console.error('Error getting vehicle positions relevance:', error);
			return 0;
		}
	}

	// Message methods
	static async sendMessage(
		chatRoomType: ChatRoomType,
		chatRoomId: string,
		message: Message
	): Promise<boolean> {
		this.ensureBrowser();
		const currentTime = Date.now();
		if (currentTime - this.lastMessageSentTimestamp < this.MESSAGE_SENDING_COOLDOWN) {
			return false;
		}
		this.lastMessageSentTimestamp = currentTime;

		try {
			// Use timestamp as the message key (matching Android implementation)
			const messageTimestamp = message.timestamp || currentTime;
			const messagePath = `chats/${chatRoomType}/${chatRoomId}/${messageTimestamp}`;
			const relevancePath = `stats/relevance/${chatRoomType}/${chatRoomId}`;

			// Set message with timestamp as key
			await set(ref(this.database!, messagePath), message);
			
			// Update timestamp using ServerValue
			await set(ref(this.database!, `${messagePath}/timestamp`), serverTimestamp());

			// Update relevance
			await set(ref(this.database!, relevancePath), serverTimestamp());

			return true;
		} catch (error) {
			console.error('Error sending message:', error);
			return false;
		}
	}

	static async removeMessage(
		chatRoomType: ChatRoomType,
		chatRoomId: string,
		message: Message
	): Promise<boolean> {
		this.ensureBrowser();
		try {
			// Use message.key as the path (which should be the timestamp)
			const messagePath = `chats/${chatRoomType}/${chatRoomId}/${message.key}`;
			await remove(ref(this.database!, messagePath));
			return true;
		} catch (error) {
			console.error('Error removing message:', error);
			return false;
		}
	}

	static listenForMessages(
		chatRoomType: ChatRoomType,
		chatRoomId: string,
		onMessageAdded: (message: Message) => void,
		onMessageRemoved: (message: Message) => void = () => {}
	): void {
		this.ensureBrowser();
		const messagesRef = ref(this.database!, `chats/${chatRoomType}/${chatRoomId}`);

		const unsubscribeAdded = onChildAdded(messagesRef, (snapshot: DataSnapshot) => {
			const message = snapshot.val() as Message;
			if (message) {
				onMessageAdded({
					...message,
					key: snapshot.key || '' // snapshot.key will be the timestamp
				});
			}
		});

		const unsubscribeRemoved = onChildRemoved(messagesRef, (snapshot: DataSnapshot) => {
			const message = snapshot.val() as Message;
			if (message) {
				onMessageRemoved({
					...message,
					key: snapshot.key || '' // snapshot.key will be the timestamp
				});
			}
		});

		this.messageUnsubscribes.push(unsubscribeAdded, unsubscribeRemoved);
	}

	static stopListeningForMessages(): void {
		this.messageUnsubscribes.forEach(unsubscribe => unsubscribe());
		this.messageUnsubscribes = [];
	}

	/**
	 * Clears messages older than the OLD_MESSAGE_CUTOFF.
	 * This function should only be called with an unmetered network connection
	 * and should only output its results to the console.
	 */
	static async clearOldMessages(): Promise<void> {
		this.ensureBrowser();
		try {
			const chatsSnapshot = await get(ref(this.database!, 'chats'));
			if (!chatsSnapshot.exists()) {
				return;
			}

			const oldMessageCutoff = Date.now() - this.OLD_MESSAGE_CUTOFF;

			chatsSnapshot.forEach((roomTypeSnapshot) => {
				roomTypeSnapshot.forEach((roomSnapshot) => {
					roomSnapshot.forEach((messageSnapshot) => {
						const message = messageSnapshot.val() as Message;
						if (message && message.timestamp < oldMessageCutoff) {
							const messagePath = `chats/${roomTypeSnapshot.key}/${roomSnapshot.key}/${messageSnapshot.key}`;
							remove(ref(this.database!, messagePath))
								.then(() => {
									console.log(`Removed old message: ${message.content} from: ${roomTypeSnapshot.key}/${roomSnapshot.key}`);
								})
								.catch((error) => {
									console.error('Error removing old message:', error);
								});
						}
					});
				});
			});
		} catch (error) {
			console.error('Error clearing old messages:', error);
		}
	}
}