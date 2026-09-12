# YouTube

- **Protocol**: InnerTube API (unofficial) via direct client-side connection
- **Library**: `youtubei.js` (v10.0.0+) - JavaScript client for YouTube's private InnerTube API
- **API Proxy**: Custom proxy at `innertube.proxy.aioo.ooo` to bypass CORS restrictions
- **Authentication**: No API key required (uses unofficial InnerTube API)
- **Message Types**: Regular chat, Super Chat, Super Sticker, membership events (currently only text messages implemented)
- **Badges**: Custom thumbnails from author badges via InnerTube API
- **Live Status**: Video info fetched every 30 seconds via `useVideoInfo.ts`
- **Streaming**: Real-time event-driven connection with automatic reconnection
- **Viewer Count**: Real-time viewer count via `metadata-update` event from LiveChat
  - Accessed through `livechat.on('metadata-update', (metadata) => metadata.views.original_view_count)`
  - Updates reflected in Status component in real-time

**Architecture**:
- **useInnertube.ts**: Initializes Innertube client with custom fetch proxy
- **useLiveChat.ts**: Manages LiveChat connection lifecycle and event listeners
- **useChatList.ts**: Converts YouTube chat format to unified Chat type
- **useVideoInfo.ts**: Polls video metadata every 30 seconds

**Important Notes**:
- YouTube integration uses **unofficial InnerTube API** which may break without notice
- No quota limitations compared to official YouTube Data API v3
- Client-side implementation with proxy bypass (no Next.js API routes needed)
- Requires video ID (not channel ID) since chat is per-livestream
- Must call `livechat.start()` before events are emitted
- `metadata-update` events provide real-time viewer count (not cumulative view count)

**Critical Implementation Details**:
- LiveChat instance created via `innertube.getInfo(videoId).getLiveChat()`
- Event-driven architecture: `chat-update` and `metadata-update` events
- Emoji rendering via `emoji_id` and image URLs from message runs
- Color assignment based on author ID hash (deterministic coloring)
- Cleanup on unmount: `liveChat.stop()` and event listener removal
- Only `LiveChatTextMessage` type is currently processed
