<script lang="ts">
    import { authStore } from '$lib/firebase/auth.svelte';
	import type { Message } from '$lib/model/Message.js';
	import { getMessageIcon } from '$lib/model/Message.js';

	interface Props {
		message: Message;
		isMarker?: boolean;
		selfColor?: string;
		onSelfColor?: string;
		onRemoveRequest?: (message: Message) => void;
	}

	let { 
		message, 
		isMarker = false, 
		selfColor = 'var(--primary)', 
		onSelfColor = 'var(--onPrimary)',
		onRemoveRequest 
	}: Props = $props();

	const isOwnMessage = $derived(authStore.user?.uid === message.senderId);
	const timestamp = $derived(new Date(message.timestamp));
	const messageIcon = $derived(getMessageIcon(message));
	
	// Format timestamp
	const timeString = $derived(
		timestamp.toLocaleTimeString('hu-HU', {
			hour: '2-digit',
			minute: '2-digit'
		})
	);
	
	// Get message color based on the color field
	const messageColor = $derived(() => {
		if (message.color && message.color !== 0x00000000) {
			// Convert from ARGB to RGB hex
			const rgb = message.color & 0xFFFFFF;
			return `#${rgb.toString(16).padStart(6, '0')}`;
		}
		return null;
	});
	
	const backgroundColor = $derived(isOwnMessage ? selfColor : messageColor() || 'var(--surfaceContainer)');

	function handleRemove() {
		if (onRemoveRequest && isOwnMessage) {
			onRemoveRequest(message);
		}
	}
</script>

<div 
	class="message-container"
	class:own-message={isOwnMessage}
	class:is-marker={isMarker}
>
	<div class="message-bubble" style:background-color={backgroundColor}>
		<div class="message-header">
			<span class="sender-name" style:color={isOwnMessage ? onSelfColor : 'var(--onSurface)'}>
				{message.senderName}
			</span>
			<span class="timestamp" style:color={isOwnMessage ? onSelfColor : 'var(--onSurfaceVariant)'}>
				{timeString}
			</span>
		</div>
		
		<div class="message-content">
			{#if message.messageType === 'report' || message.messageType === 'location_ping'}
				<div class="message-with-icon">
					<span class="material-symbols-outlined icon">
						{messageIcon}
					</span>
					<span class="content" style:color={isOwnMessage ? onSelfColor : 'var(--onSurface)'}>
						{message.content}
					</span>
				</div>
			{:else}
				<span class="content" style:color={isOwnMessage ? onSelfColor : 'var(--onSurface)'}>
					{message.content}
				</span>
			{/if}
		</div>
		
		{#if message.location && message.location.trim() !== ''}
			<div class="location-indicator">
				<span class="material-symbols-outlined location-icon">
					location_on
				</span>
				<span class="location-text" style:color={isOwnMessage ? onSelfColor : 'var(--onSurfaceVariant)'}>
					Helyzetből küldve
				</span>
			</div>
		{/if}
		
		{#if isOwnMessage && onRemoveRequest && !isMarker}
			<button class="remove-button" onclick={handleRemove} style:color={onSelfColor}>
				<span class="material-symbols-outlined">
					delete
				</span>
			</button>
		{/if}
	</div>
</div>

<style>
	.message-container {
		display: flex;
		width: 100%;
		margin-bottom: var(--spacing);
	}
	
	.message-container.own-message {
		justify-content: flex-end;
	}
	
	.message-container.is-marker {
		max-width: 200px;
	}
	
	.message-bubble {
		max-width: 80%;
		min-width: 120px;
		padding: var(--spacing-double);
		border-radius: var(--radius);
		position: relative;
		word-wrap: break-word;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	.own-message .message-bubble {
		border-bottom-right-radius: calc(var(--radius) * 0.3);
	}
	
	.message-container:not(.own-message) .message-bubble {
		border-bottom-left-radius: calc(var(--radius) * 0.3);
	}
	
	.is-marker .message-bubble {
		border-radius: calc(var(--radius) * 0.7);
		max-width: none;
		min-width: auto;
		padding: var(--spacing);
		font-size: 0.9em;
	}
	
	.message-header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		margin-bottom: calc(var(--spacing) * 0.5);
		gap: var(--spacing);
	}
	
	.sender-name {
		font-weight: 600;
		font-size: 0.9em;
		flex-shrink: 0;
	}
	
	.timestamp {
		font-size: 0.8em;
		opacity: 0.8;
		white-space: nowrap;
	}
	
	.message-content {
		line-height: 1.4;
	}
	
	.message-with-icon {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 0.5);
	}
	
	.icon {
		font-size: 1.2em;
		flex-shrink: 0;
	}
	
	.content {
		flex: 1;
	}
	
	.location-indicator {
		display: flex;
		align-items: center;
		gap: calc(var(--spacing) * 0.3);
		margin-top: calc(var(--spacing) * 0.5);
		opacity: 0.8;
	}
	
	.location-icon {
		font-size: 1em;
	}
	
	.location-text {
		font-size: 0.8em;
	}
	
	.remove-button {
		position: absolute;
		top: calc(var(--spacing) * 0.5);
		right: calc(var(--spacing) * 0.5);
		background: none;
		border: none;
		padding: 2px;
		cursor: pointer;
		opacity: 0.6;
		border-radius: 50%;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.remove-button:hover {
		opacity: 1;
		background-color: rgba(255, 255, 255, 0.1);
	}
	
	.remove-button .material-symbols-outlined {
		font-size: 16px;
	}
	
	/* Hide remove button on markers and non-own messages */
	.is-marker .remove-button,
	.message-container:not(.own-message) .remove-button {
		display: none;
	}
</style>
