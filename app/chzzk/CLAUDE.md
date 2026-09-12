# Chzzk (치지직 - Naver)

- **Protocol**: JSON over WebSocket (`wss://kr-ss1.chat.naver.com/chat`)
- **Auth**: Requires access token from `/app/chzzk/useAccessToken.ts`
- **Paid Chat**: "Cheese" (치즈) system with 5 tiers (tier0-4) based on KRW amount
- **Emoji Parsing**: Regex-based extraction of `:emojiname:` syntax
- **Badges**: Subscription tiers, streaming time, achievement badges
- **Live Status**: Polls every 30 seconds via `useLiveStatus.ts`
