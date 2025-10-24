# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Chazzy is a real-time chat aggregation overlay for multi-platform streamers. It displays unified chat from four Korean and Western streaming platforms simultaneously: Chzzk (Naver), Twitch, AfreecaTV/Soop, and YouTube.

## Development Commands

```bash
# Development server (http://localhost:3000)
pnpm run dev

# Production build
pnpm run build

# Run production server
pnpm start

# Lint codebase
pnpm run lint
```

### Testing the Overlay

Access the overlay via dynamic route: `http://localhost:3000/{channelId}`

**URL Pattern**: `/{chzzkId}-{twitchId}-{afreecatvId}-{youtubeVideoId}`

Examples:
- Single platform: `chzzkChannelId---` or `-twitchUsername--` or `--afreecatvId-` or `---youtubeVideoId`
- Multi-platform: `chzzkId-twitchName-afreecatvId-youtubeVideoId`
- Any combination works (IDs are flexible, use `-` to omit platforms)

## Architecture Overview

### Platform Abstraction Layer

Each platform module (`app/chzzk/`, `app/twitch/`, `app/afreecatv/`, `app/youtube/`) is self-contained with:
- **types.ts**: Platform-specific message/user types
- **constants.ts**: Nickname colors, badge definitions, Super Chat/Cheese tier colors
- **useChatList.ts**: Real-time connection (WebSocket or SSE) + message parsing
- **useChannel.ts / useUser.ts / useStation.ts / useVideoInfo.ts**: Metadata fetching
- **parser/** (if needed): Protocol parsing logic (Twitch IRC, AfreecaTV binary)

All platforms convert their native message types to the unified `Chat` interface defined in `app/chat/types.ts`.

### Real-Time Message Processing Pipeline

```
Platform WebSocket → Protocol Parser → Chat Type Converter
    ↓
Pending List (useRef) → useMergedList Hook (batching + sorting)
    ↓
React State → Memoized Components → UI Rendering
```

**Key File**: `app/chat/useMergedList.ts`
- Merges multiple platform chat streams
- Smart batching: exponential backoff when messages are fast (2→4→8→16 per cycle)
- Releases all pending messages at once when slow (>1s gap)
- Maintains chronological order by timestamp across platforms
- Caps at 1000 regular chats, 10 paid chats

### Main Component Orchestration

**`app/[channelId]/Chazzy.tsx`** is the central orchestrator:
1. Parses channel IDs from URL parameter
2. Initializes all platform hooks (useChatList, useChannel, useLiveStatus, etc.)
3. Passes pending lists to `useMergedList` for aggregation
4. Renders ChatRow components with unified Chat data
5. Handles settings menu state and user preferences

### Component Structure

**Rendering Components** (all memoized for performance):
- `ChatRow.tsx`: Regular chat messages with badges, nicknames, message content
- `CheeseChatRow.tsx`: Paid chat messages (Chzzk "Cheese") with tier-based styling
- `Status.tsx`: Channel info bar showing live status, viewer counts
- `ChazzyMenu.tsx`: Settings dropdown using @floating-ui/react

**Layout** (responsive flex):
- Chat area (flex: 2) + Cheese/donation area (flex: 1) side-by-side
- On mobile (<800px): Cheese moves below chat area

## Platform-Specific Details

### Chzzk (치지직 - Naver)
- **Protocol**: JSON over WebSocket (`wss://kr-ss1.chat.naver.com/chat`)
- **Auth**: Requires access token from `/app/chzzk/useAccessToken.ts`
- **Paid Chat**: "Cheese" (치즈) system with 5 tiers (tier0-4) based on KRW amount
- **Emoji Parsing**: Regex-based extraction of `:emojiname:` syntax
- **Badges**: Subscription tiers, streaming time, achievement badges
- **Live Status**: Polls every 30 seconds via `useLiveStatus.ts`

### Twitch
- **Protocol**: IRC over WebSocket (`wss://irc-ws.chat.twitch.tv`)
- **Parser**: `app/twitch/parser/parseMessage.mjs` (ES6 module for IRC tags)
- **Badges**: Fetches global + broadcaster-specific badges from Twitch API
- **Emotes**: Complex position tracking for inline emote rendering
- **Auth**: Requires `NEXT_PUBLIC_TWITCH_CLIENT_ID` and `NEXT_PUBLIC_TWITCH_ACCESS_TOKEN`

### AfreecaTV / Soop (숲)
- **Protocol**: Custom binary WebSocket with delimiters
- **Parser**: `app/afreecatv/parser/parseMessage.ts` handles binary parsing
- **Message Format**: Uses `%SF` (start), `%1%` (delimiter), `%EC` (end)
- **Flags**: Bitwise flag parsing for message properties (manager, fanclub, etc.)
- **Stickers**: Platform-specific emoji system via `useEmoticons.ts`
- **Badges**: SVG icons in `public/afreecatv/` (manager, hot, fanclub, gudok tiers)
- **Polling**: Station metadata updates every 30 seconds

### YouTube
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

## Key Technical Patterns

### WebSocket Ping Management
Each platform uses Web Workers to handle ping timers (prevents main thread blocking):
- Chzzk: 20-second ping interval
- Twitch: 20-second ping interval
- AfreecaTV: 60-second ping interval

Auto-reconnection logic with exponential backoff on disconnect.

### API Proxying
Custom proxy endpoints at `aioo.ooo` to bypass CORS restrictions:
- Chzzk API: `https://api.chzzk.naver.com.proxy.aioo.ooo`
- AfreecaTV API: `https://live.sooplive.co.kr.proxy.aioo.ooo`
- YouTube InnerTube API: `https://innertube.proxy.aioo.ooo`

### Performance Optimizations
1. **Component Memoization**: All rendering components use `React.memo()`
2. **Message Capping**: Max 1000 messages in memory (oldest discarded)
3. **Document Hidden Detection**: Pauses updates when tab is hidden
4. **Exponential Batching**: Adapts to message rate dynamically
5. **Ref-Based Pending Lists**: Avoids re-renders during accumulation phase

### Paid Chat System
Chzzk "Cheese" donations have tier-based styling:
- **tier0**: Gray (0 KRW)
- **tier1**: Purple (1,000+ KRW)
- **tier2**: Green (10,000+ KRW)
- **tier3**: Gold (100,000+ KRW)
- **tier4**: Red (1,000,000+ KRW)

Paid chats display in separate right sidebar with 5-minute expiry animation.

## Configuration Files

### next.config.cjs
- `reactStrictMode: false` for performance (disabled to prevent double WebSocket connections)
- Sentry integration for error tracking with source map uploads
- Monitoring dashboard at `/monitoring` route

### tsconfig.json
- Loose type checking (`strict: false`) for rapid development flexibility
- Path alias: `@/*` maps to `./*` (root-relative imports)
- Target: ES5 for broad browser compatibility

### Environment Variables
Required for Twitch integration:
```
NEXT_PUBLIC_TWITCH_CLIENT_ID
NEXT_PUBLIC_TWITCH_ACCESS_TOKEN
```

## Styling Approach

- **CSS**: Global styles in `app/globals.css`, component styles in `app/[channelId]/styles.css`
- **Font**: Pretendard (Korean + Latin web font)
- **Theme**: Dark theme with glass-morphism effects (rgba overlays)
- **Responsive**: Flex-based layout with mobile breakpoint at 799px
- **CSS Variables**: `--font-size` for responsive text scaling
- **Nickname Colors**: Deterministic hash-based coloring with `accessible-colors` for contrast

## Common Development Patterns

### Adding Support for a New Platform

1. Create platform directory: `app/{platform}/`
2. Define types in `types.ts` (native message format + metadata)
3. Implement `useChatList.ts` hook with WebSocket connection
4. Create parser in `parser/` if protocol is complex (binary/IRC)
5. Convert native messages to unified `Chat` type in `app/chat/types.ts`
6. Add platform-specific hooks for metadata (useChannel, useLiveStatus, etc.)
7. Update `Chazzy.tsx` to initialize new platform hooks
8. Add color constants and badge rendering logic

### Modifying Message Rendering

- Regular chat: Edit `app/[channelId]/ChatRow.tsx`
- Paid chat: Edit `app/[channelId]/CheeseChatRow.tsx`
- Both components are memoized with `React.memo()` - update dependency arrays carefully

### Debugging WebSocket Connections

Check browser DevTools → Network → WS tab for WebSocket frames. Each platform has different message formats:
- Chzzk: JSON with `cmd` field (e.g., `"CHAT"`, `"PING"`, `"CONNECTED"`)
- Twitch: IRC text format (e.g., `PRIVMSG #channel :message`)
- AfreecaTV: Binary with `%SF` prefix visible in hex view

## Important Notes

- **TypeScript**: Uses loose type checking - expect some `any` types
- **Strict Mode**: Disabled intentionally to prevent double WebSocket connections
- **Message Deletion**: Supported via `svcid` (Chzzk) and `target-msg-id` (Twitch) tracking
- **Emoji/Sticker Rendering**: Platform-specific - Chzzk uses regex, Twitch uses position arrays, AfreecaTV uses emoticon API
- **Badge Priority**: Rendered in order of importance (moderator > subscriber > achievements)
