<script lang="ts">
	import { MessageFactory, MessageType, reportOptions, type Message } from '$lib/model/Message.js';
	import { auth } from '$lib/stores/auth.js';

	interface Props {
		enabled?: boolean;
		onSend?: (message: Omit<Message, 'key' | 'timestamp'>) => void;
		allowTrainReports?: boolean;
	}

	let { enabled = true, onSend, allowTrainReports = false }: Props = $props();

	const user = $derived($auth);
	
	let textInput = $state('');
	let showReportOptions = $state(false);
	let isComposing = $state(false);

	function handleSendText() {
		if (!textInput.trim() || !user || !onSend) return;
		
		const message: Omit<Message, 'key' | 'timestamp'> = {
			...MessageFactory.createTextMessage(textInput.trim()),
			senderId: user.uid,
			senderName: user.displayName,
			location: ''
		};
		
		onSend(message);
		textInput = '';
	}

	function handleSendReport(reportTemplate: Omit<Message, 'key' | 'timestamp' | 'senderId' | 'senderName' | 'location'>) {
		if (!user || !onSend) return;
		
		const message: Omit<Message, 'key' | 'timestamp'> = {
			...reportTemplate,
			senderId: user.uid,
			senderName: user.displayName,
			location: ''
		};
		
		onSend(message);
		showReportOptions = false;
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey && !isComposing) {
			event.preventDefault();
			handleSendText();
		}
	}

	// Filter report options based on allowTrainReports
	const availableReports = $derived(() => {
		if (allowTrainReports) {
			return reportOptions;
		}
		// For non-train chats, exclude train-specific reports
		return reportOptions.filter(report => 
			!['Kis késés (5-15 perc)', 'Közepes késés (15-60 perc)', 'Nagy késés (1 óra+)', 'Vonat megállt'].includes(report.content)
		);
	});
	
	const reportsToShow = $derived(availableReports());
</script>

<div class="chat-field">
	<div class="input-area">
		<div class="text-input-container">
			<input
				type="text"
				bind:value={textInput}
				onkeypress={handleKeyPress}
				oncompositionstart={() => isComposing = true}
				oncompositionend={() => isComposing = false}
				placeholder="Írj üzenetet..."
				disabled={!enabled}
				class="text-input"
			/>
			<button
				onclick={handleSendText}
				disabled={!enabled || !textInput.trim()}
				class="send-button"
				title="Üzenet küldése"
			>
				<span class="material-symbols-outlined">send</span>
			</button>
		</div>
		
		<div class="action-buttons">
			<button
				onclick={() => showReportOptions = !showReportOptions}
				disabled={!enabled}
				class="report-button"
				class:active={showReportOptions}
				title="Gyors jelentések"
			>
				<span class="material-symbols-outlined">report</span>
			</button>
		</div>
	</div>
	
	{#if showReportOptions}
		<div class="report-options">
			<div class="report-grid">
				{#each reportsToShow as report}
					<button
						onclick={() => handleSendReport(report)}
						disabled={!enabled}
						class="report-option"
						class:warning={report.color === 0xFFFFA500}
						class:error={report.color === 0xFFFF0000}
						class:blue={report.color === 0xFF0000FF}
					>
						<span class="material-symbols-outlined">
							{#if report.messageType === MessageType.LOCATION_PING}
								gps_fixed
							{:else}
								report
							{/if}
						</span>
						<span class="report-text">{report.content}</span>
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.chat-field {
		background-color: var(--surfaceContainer);
		border-radius: var(--radius);
		padding: var(--spacing);
		margin: var(--spacing);
	}
	
	.input-area {
		display: flex;
		gap: var(--spacing);
		align-items: flex-end;
	}
	
	.text-input-container {
		flex: 1;
		display: flex;
		gap: calc(var(--spacing) * 0.5);
		align-items: center;
	}
	
	.text-input {
		flex: 1;
		min-height: 48px;
		resize: none;
		border: 1px solid var(--outline);
		background-color: var(--surface);
		color: var(--onSurface);
		padding: var(--spacing-double);
		border-radius: calc(var(--radius) * 0.7);
		font-size: 1em;
		font-family: inherit;
	}
	
	.text-input:focus {
		outline: 2px solid var(--primary);
		border-color: var(--primary);
	}
	
	.text-input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.send-button, .report-button {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
	}
	
	.send-button {
		background-color: var(--primary);
		color: var(--onPrimary);
	}
	
	.send-button:disabled {
		background-color: var(--surfaceVariant);
		color: var(--onSurfaceVariant);
		cursor: not-allowed;
	}
	
	.report-button {
		background-color: var(--secondaryContainer);
		color: var(--onSecondaryContainer);
	}
	
	.report-button.active {
		background-color: var(--secondary);
		color: var(--onSecondary);
	}
	
	.report-button:disabled {
		background-color: var(--surfaceVariant);
		color: var(--onSurfaceVariant);
		cursor: not-allowed;
	}
	
	.report-options {
		margin-top: var(--spacing-double);
		padding-top: var(--spacing-double);
		border-top: 1px solid var(--outlineVariant);
	}
	
	.report-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing);
	}
	
	.report-option {
		display: flex;
		align-items: center;
		gap: var(--spacing);
		padding: var(--spacing-double);
		border: 1px solid var(--outlineVariant);
		border-radius: calc(var(--radius) * 0.7);
		background-color: var(--surface);
		color: var(--onSurface);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
		min-height: 56px;
	}
	
	.report-option:hover {
		background-color: var(--surfaceContainerHigh);
		border-color: var(--outline);
	}
	
	.report-option:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.report-option.warning {
		border-color: var(--colorDelayMinor);
		background-color: color-mix(in srgb, var(--colorDelayMinor) 10%, var(--surface));
	}
	
	.report-option.error {
		border-color: var(--error);
		background-color: color-mix(in srgb, var(--error) 10%, var(--surface));
	}
	
	.report-option.blue {
		border-color: var(--secondary);
		background-color: color-mix(in srgb, var(--secondary) 10%, var(--surface));
	}
	
	.report-option .material-symbols-outlined {
		font-size: 1.2em;
		flex-shrink: 0;
	}
	
	.report-text {
		flex: 1;
		font-size: 0.9em;
		line-height: 1.3;
	}
	
	.action-buttons {
		display: flex;
		gap: calc(var(--spacing) * 0.5);
	}
</style>
