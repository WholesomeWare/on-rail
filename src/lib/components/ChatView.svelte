<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { RTDB, ChatRoomType } from '$lib/sources/RTDB.js';
	import { MessageType, type Message } from '$lib/model/Message.js';
	import { auth } from '$lib/stores/auth.js';
	import MessageDisplay from './MessageDisplay.svelte';
	import ChatField from './ChatField.svelte';

	interface Props {
		chatRoomType: ChatRoomType;
		chatRoomId: string;
		showReportsOnly?: boolean;
		allowTrainReports?: boolean;
		selfColor?: string;
		onSelfColor?: string;
	}

	let {
		chatRoomType,
		chatRoomId,
		showReportsOnly = false,
		allowTrainReports = false,
		selfColor = 'var(--primary)',
		onSelfColor = 'var(--onPrimary)'
	}: Props = $props();

	const user = $derived($auth);
	let messages = $state<Message[]>([]);
	let isLoading = $state(true);
	let isSending = $state(false);
	let messagesContainer: HTMLElement;

	// Filter messages based on showReportsOnly
	const visibleMessages = $derived(() => {
		if (showReportsOnly) {
			return messages.filter(msg => msg.messageType === MessageType.REPORT);
		}
		return messages.filter(msg => 
			[MessageType.TEXT, MessageType.REPORT, MessageType.LOCATION_PING].includes(msg.messageType as any)
		);
	});
	
	const messagesToShow = $derived(visibleMessages());

	// Auto-scroll to bottom when new messages arrive
	$effect(() => {
		if (messagesContainer && messagesToShow.length > 0) {
			setTimeout(() => {
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			}, 100);
		}
	});

	async function sendMessage(messageData: Omit<Message, 'key' | 'timestamp'>) {
		if (!user || isSending) return;

		isSending = true;
		try {
			// Add timestamp and key before sending (key will be the timestamp)
			const timestamp = Date.now();
			const messageWithTimestamp: Message = {
				...messageData,
				timestamp: timestamp,
				key: timestamp.toString() // Use timestamp as key to match Android implementation
			};
			const success = await RTDB.sendMessage(chatRoomType, chatRoomId, messageWithTimestamp);
			if (!success) {
				console.error('Failed to send message');
				// Could show user feedback here
			}
		} catch (error) {
			console.error('Error sending message:', error);
		} finally {
			isSending = false;
		}
	}

	async function removeMessage(message: Message) {
		if (!message.key || !user || message.senderId !== user.uid) return;

		try {
			await RTDB.removeMessage(chatRoomType, chatRoomId, message);
		} catch (error) {
			console.error('Error removing message:', error);
		}
	}

	onMount(() => {
		// Start listening for messages
		RTDB.listenForMessages(
			chatRoomType,
			chatRoomId,
			(message: Message) => {
				isLoading = false;
				// Add message if it doesn't already exist
				if (!messages.find(m => m.key === message.key)) {
					messages = [...messages, message].sort((a, b) => a.timestamp - b.timestamp);
				}
			},
			(message: Message) => {
				// Remove message
				messages = messages.filter(m => m.key !== message.key);
			}
		);

		// Load chat relevances
		RTDB.getChatRelevances().then(() => {
			isLoading = false;
		}).catch(() => {
			isLoading = false;
		});
	});

	onDestroy(() => {
		RTDB.stopListeningForMessages();
	});
</script>

<div class="chat-view">
	<div class="messages-container" bind:this={messagesContainer}>
		{#if isLoading}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<p>Üzenetek betöltése...</p>
			</div>
		{:else if messagesToShow.length === 0}
			<div class="empty-state">
				<span class="material-symbols-outlined empty-icon">chat_bubble_outline</span>
				<p>
					{#if showReportsOnly}
						Még nincsenek jelentések.
					{:else}
						Még nincsenek üzenetek.
					{/if}
				</p>
				<small>Legyél te az első, aki üzenetet küld!</small>
			</div>
		{:else}
			<div class="messages-list">
				<div class="disclaimer">
					<p>A régi üzenetek automatikusan törlődnek.</p>
				</div>
				
				{#each messagesToShow as message (message.key || `${message.senderId}-${message.timestamp}`)}
					<MessageDisplay
						{message}
						{selfColor}
						{onSelfColor}
						onRemoveRequest={removeMessage}
					/>
				{/each}
			</div>
		{/if}
	</div>

	<ChatField
		enabled={!isSending && !!user}
		onSend={sendMessage}
		{allowTrainReports}
	/>
</div>

<style>
	.chat-view {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--surface);
	}

	.messages-container {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		scroll-behavior: smooth;
	}

	.loading-state, .empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		padding: var(--spacing-double);
		text-align: center;
		color: var(--onSurfaceVariant);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--outlineVariant);
		border-top: 3px solid var(--primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: var(--spacing-double);
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.empty-icon {
		font-size: 3em;
		opacity: 0.5;
		margin-bottom: var(--spacing-double);
	}

	.empty-state p {
		margin: 0 0 var(--spacing) 0;
		font-size: 1.1em;
	}

	.empty-state small {
		opacity: 0.7;
	}

	.messages-list {
		padding: var(--spacing-double);
		min-height: 100%;
		display: flex;
		flex-direction: column;
	}

	.disclaimer {
		text-align: center;
		margin-bottom: var(--spacing-double);
		padding: var(--spacing);
		background-color: var(--surfaceVariant);
		border-radius: calc(var(--radius) * 0.7);
		color: var(--onSurfaceVariant);
	}

	.disclaimer p {
		margin: 0;
		font-size: 0.9em;
		opacity: 0.8;
	}

	/* Custom scrollbar */
	.messages-container::-webkit-scrollbar {
		width: 6px;
	}

	.messages-container::-webkit-scrollbar-track {
		background: transparent;
	}

	.messages-container::-webkit-scrollbar-thumb {
		background: var(--outlineVariant);
		border-radius: 3px;
	}

	.messages-container::-webkit-scrollbar-thumb:hover {
		background: var(--outline);
	}
</style>
