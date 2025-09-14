import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export interface User {
	uid: string;
	displayName: string;
	isAnonymous: boolean;
}

// Simple auth store for demo purposes
// In a real app, this would integrate with Firebase Auth
function createAuthStore() {
	const { subscribe, set, update } = writable<User | null>(null);

	return {
		subscribe,
		
		// Initialize user from localStorage or create new anonymous user
		init: () => {
			if (!browser) return;
			
			const stored = localStorage.getItem('onrail-user');
			if (stored) {
				try {
					const user = JSON.parse(stored);
					set(user);
					return;
				} catch (e) {
					console.warn('Failed to parse stored user:', e);
				}
			}
			
			// Create anonymous user
			const anonymousUser: User = {
				uid: generateUserId(),
				displayName: generateDisplayName(),
				isAnonymous: true
			};
			
			localStorage.setItem('onrail-user', JSON.stringify(anonymousUser));
			set(anonymousUser);
		},
		
		// Sign out (clear user)
		signOut: () => {
			if (browser) {
				localStorage.removeItem('onrail-user');
			}
			set(null);
		},
		
		// Update display name
		updateDisplayName: (name: string) => {
			update(user => {
				if (!user) return user;
				const updatedUser = { ...user, displayName: name };
				if (browser) {
					localStorage.setItem('onrail-user', JSON.stringify(updatedUser));
				}
				return updatedUser;
			});
		}
	};
}

function generateUserId(): string {
	return 'anon_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateDisplayName(): string {
	const adjectives = [
		'Gyors', 'Pontos', 'Késő', 'Türelmes', 'Utazó', 'Városi', 
		'Vidéki', 'Reggeli', 'Esti', 'Nappali', 'Hétvégi'
	];
	
	const nouns = [
		'Utas', 'Vonat', 'Jegy', 'Állomás', 'Sínek', 'Utazó',
		'Vezető', 'Kalauz', 'Menetrend', 'Peron', 'Várakozó'
	];
	
	const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
	const noun = nouns[Math.floor(Math.random() * nouns.length)];
	const number = Math.floor(Math.random() * 999) + 1;
	
	return `${adjective}${noun}${number}`;
}

export const auth = createAuthStore();

// Auto-initialize when imported in browser
if (browser) {
	auth.init();
}
