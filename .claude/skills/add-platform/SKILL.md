---
name: add-platform
description: Add support for a new chat platform to Chazzy (new app/{platform}/ module, hooks, and unified Chat type conversion). Use when asked to integrate a new streaming platform's chat.
---

1. Create platform directory: `app/{platform}/`
2. Define types in `types.ts` (native message format + metadata)
3. Implement `useChatList.ts` hook with WebSocket connection
4. Create parser in `parser/` if protocol is complex (binary/IRC)
5. Convert native messages to unified `Chat` type in `app/chat/types.ts`
6. Add platform-specific hooks for metadata (useChannel, useLiveStatus, etc.)
7. Update `Chazzy.tsx` to initialize new platform hooks
8. Add color constants and badge rendering logic
