<!-- Demo page to test chat functionality without needing actual train data -->
<script lang="ts">
    import ChatView from "$lib/components/ChatView.svelte";
    import { ChatRoomType } from "$lib/sources/RTDB";
</script>

<svelte:head>
    <title>Chat Demo - Sínen Vagyunk</title>
</svelte:head>

<main>
    <div class="demo-header">
        <h1>Chat Functionality Demo</h1>
        <p>This page demonstrates the chat system with a demo train "IC 123"</p>
    </div>

    <div class="chat-container surface-container card">
        <ChatView
            chatRoomType={ChatRoomType.TRAIN}
            chatRoomId="IC 123"
            showReportsOnly={false}
            allowTrainReports={true}
            selfColor="var(--colorDelayMinor)"
            onSelfColor="var(--onColorDelayMinor)"
        />
    </div>
</main>

<style>
    main {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--spacing-double);
        height: 100vh;
        display: flex;
        flex-direction: column;
        gap: var(--spacing-double);
    }

    .demo-header {
        text-align: center;
        padding: var(--spacing-double);
        background-color: var(--surfaceContainer);
        border-radius: var(--radius);
    }

    .demo-header h1 {
        margin: 0 0 var(--spacing) 0;
        color: var(--onSurface);
    }

    .demo-header p {
        margin: 0;
        color: var(--onSurfaceVariant);
    }

    .chat-container {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
    }
</style>
