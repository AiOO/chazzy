# Chazzy

Multi-platform streaming chat overlay that aggregates real-time chat from Chzzk (치지직), Twitch, AfreecaTV/Soop (숲), and YouTube.

## Features

- **Multi-Platform Support**: Display chat from 4 streaming platforms simultaneously
- **Real-Time Updates**: Low-latency chat with WebSocket/SSE and smart batching
- **Paid Chat Highlighting**: Special display for donations (Chzzk Cheese, YouTube Super Chat, Twitch Bits)
- **Platform Badges**: Shows subscription tiers, moderator status, and achievements
- **Real-Time Viewer Count**: Live viewer count updates for all platforms
- **Responsive Design**: Optimized for OBS Browser Source and mobile viewing
- **Auto-Reconnect**: Handles connection drops with exponential backoff

## Supported Platforms

| Platform | Protocol | Features |
|----------|----------|----------|
| **Chzzk** (치지직) | JSON over WebSocket | Cheese donations, subscription badges, emoji parsing |
| **Twitch** | IRC over WebSocket | Bits, global/broadcaster badges, emote positioning |
| **AfreecaTV/Soop** (숲) | Binary WebSocket | Stickers, fan club badges, manager status |
| **YouTube** | InnerTube API (SSE) | Super Chat/Stickers, membership badges, real-time viewer count |

## Quick Start

### Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page.

### Using the Overlay

Access the chat overlay via: `http://localhost:3000/{channelId}`

**URL Format**: `/{chzzkId}-{twitchId}-{afreecatvId}-{youtubeVideoId}`

Examples:
```
# Single platform
http://localhost:3000/chzzkChannelId---
http://localhost:3000/-twitchUsername--
http://localhost:3000/--afreecatvId-
http://localhost:3000/---youtubeVideoId

# Multiple platforms
http://localhost:3000/chzzkId-twitchName--
http://localhost:3000/chzzkId--afreecatvId-
http://localhost:3000/---youtubeVideoId
http://localhost:3000/chzzkId-twitchName-afreecatvId-youtubeVideoId
```

**Note**: YouTube requires a **video ID** (from the live stream URL), not a channel ID.

### Environment Variables

For Twitch integration, create `.env.local`:

```env
NEXT_PUBLIC_TWITCH_CLIENT_ID=your_client_id
NEXT_PUBLIC_TWITCH_ACCESS_TOKEN=your_access_token
```

## OBS Setup

1. Add **Browser Source** in OBS
2. Set URL to: `https://your-deployment-url.com/{channelId}`
3. Recommended dimensions: 1920x1080
4. Enable "Shutdown source when not visible" for better performance
5. Check "Refresh browser when scene becomes active"

## Project Structure

```
app/
├── [channelId]/          # Dynamic overlay route
│   ├── Chazzy.tsx        # Main component
│   ├── ChatRow.tsx       # Regular chat display
│   └── CheeseChatRow.tsx # Paid chat display
├── chat/                 # Unified chat abstraction
│   ├── types.ts          # Common Chat interface
│   └── useMergedList.ts  # Multi-platform chat merger
├── chzzk/                # Chzzk platform integration
├── twitch/               # Twitch platform integration
├── afreecatv/            # AfreecaTV/Soop integration
└── youtube/              # YouTube platform integration
```

## Development

### Build Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint
```

### Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: React 18 with Hooks
- **Language**: TypeScript 5
- **Styling**: CSS with CSS Variables
- **Real-Time**: WebSocket connections per platform
- **UI**: @floating-ui/react for menu positioning
- **Monitoring**: Sentry error tracking

## Architecture

### Message Processing Pipeline

```
Platform WebSocket → Parser → Unified Chat Type
    ↓
Pending List (useRef) → Smart Batching (useMergedList)
    ↓
React State → Memoized Components → UI
```

### Smart Batching

The `useMergedList` hook optimizes performance:
- **Fast messages**: Exponential batching (2→4→8→16 per cycle)
- **Slow messages**: Release all pending messages at once (>1s gap)
- **Sorting**: Maintains chronological order across platforms
- **Capping**: Max 1000 regular chats, 10 paid chats

### Performance Optimizations

- Component memoization with `React.memo()`
- Web Worker for WebSocket ping timers
- Document hidden detection (pauses when tab inactive)
- Ref-based pending lists (avoids re-renders during accumulation)
- `reactStrictMode: false` to prevent double WebSocket connections

## Platform Details

### Chzzk (치지직)
- WebSocket: `wss://kr-ss1.chat.naver.com/chat`
- Requires access token from Chzzk API
- Cheese tiers: 0 (gray), 1 (purple), 2 (green), 3 (gold), 4 (red)
- Live status polling every 30 seconds

### Twitch
- WebSocket: `wss://irc-ws.chat.twitch.tv`
- IRC protocol with tags parsing
- Badge fetching from Twitch API
- Requires Client ID and Access Token

### AfreecaTV/Soop
- Custom binary protocol with `%SF` start and `%EC` end delimiters
- Bitwise flag parsing for message properties
- Station metadata polling every 30 seconds
- SVG badge icons in `public/afreecatv/`

### YouTube
- Client-side InnerTube API connection via `youtubei.js` library
- No API key required (bypasses official YouTube Data API quota)
- Custom proxy at `innertube.proxy.aioo.ooo` to bypass CORS
- Event-driven architecture with `chat-update` and `metadata-update` listeners
- Real-time viewer count via `metadata-update` events
- Video metadata polling every 30 seconds

## API Proxying

Uses `aioo.ooo` proxy to bypass CORS:
- Chzzk: `https://api.chzzk.naver.com.proxy.aioo.ooo`
- AfreecaTV: `https://live.sooplive.co.kr.proxy.aioo.ooo`
- YouTube InnerTube: `https://innertube.proxy.aioo.ooo`

## Contributing

See [CLAUDE.md](./CLAUDE.md) for detailed architecture documentation and development patterns.

## Deployment

Remember to set environment variables for Twitch integration in your deployment settings:
- `NEXT_PUBLIC_TWITCH_CLIENT_ID`
- `NEXT_PUBLIC_TWITCH_ACCESS_TOKEN`
