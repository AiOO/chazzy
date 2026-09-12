# AfreecaTV / Soop (숲)

- **Protocol**: Custom binary WebSocket with delimiters
- **Parser**: `app/afreecatv/parser/parseMessage.ts` handles binary parsing
- **Message Format**: Uses `%SF` (start), `%1%` (delimiter), `%EC` (end)
- **Flags**: Bitwise flag parsing for message properties (manager, fanclub, etc.)
- **Stickers**: Platform-specific emoji system via `useEmoticons.ts`
- **Badges**: SVG icons in `public/afreecatv/` (manager, hot, fanclub, gudok tiers)
- **Polling**: Station metadata updates every 30 seconds
