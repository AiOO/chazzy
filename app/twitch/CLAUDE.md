# Twitch

- **Protocol**: IRC over WebSocket (`wss://irc-ws.chat.twitch.tv`)
- **Parser**: `app/twitch/parser/parseMessage.mjs` (ES6 module for IRC tags)
- **Badges**: Fetches global + broadcaster-specific badges from Twitch API
- **Emotes**: Complex position tracking for inline emote rendering
- **Auth**: Requires `NEXT_PUBLIC_TWITCH_CLIENT_ID` and `NEXT_PUBLIC_TWITCH_ACCESS_TOKEN`
