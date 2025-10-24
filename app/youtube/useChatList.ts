import { useCallback, useRef, useState } from 'react';
import { Chat, CheeseChat } from '../chat/types';
import { LiveChatTextMessage } from './types';
import { nicknameColors } from './constants';
import { YT, YTNodes } from 'youtubei.js';
import useLiveChat from './useLiveChat';

const INTERNAL_MAX_LENGTH = 10000;

export default function useChatList(videoId: string | undefined) {
  const pendingChatListRef = useRef<Chat[]>([]);
  const pendingCheeseChatListRef = useRef<CheeseChat[]>([]);
  const [viewerCount, setViewerCount] = useState<number | undefined>(undefined);

  const handleMetadataUpdate = useCallback((metadata: InstanceType<typeof YT.LiveChat>['metadata']) => {
    setViewerCount(metadata.views?.original_view_count);
  }, []);

  const convertChat = useCallback((message: LiveChatTextMessage): { chat: Chat; payAmount: number | undefined } => {
    const userId = message.author.id;

    const colorIndex =
      userId
        .split('')
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0) % nicknameColors.length;
    const color = nicknameColors[colorIndex];

    return {
      chat: {
        uid: `${userId}-${message.timestamp}`,
        time: message.timestamp,
        userId,
        nickname: message.author.name,
        badges: message.author.badges.map((badge) => badge.custom_thumbnail[0].url),
        color,
        emojis: Object.fromEntries(
          message.message?.runs
            .map((run): [string, string][] => {
              if (run.emoji != null) {
                return [[run.emoji.emoji_id, run.emoji.image[0].url]];
              } else {
                return [];
              }
            })
            .flat(),
        ),
        message: message.message?.runs.map((run) => {
          if (run.emoji) {
            return { type: 'emoji', emojiKey: run.emoji.emoji_id };
          } else {
            return { type: 'text', text: run.text };
          }
        }),
      },
      payAmount: undefined,
    };
  }, []);

  const handleChatUpdate = useCallback(
    (action: YTNodes.AddChatItemAction) => {
      if (!(action instanceof YTNodes.AddChatItemAction) || action.item.type !== 'LiveChatTextMessage') {
        return;
      }
      const item = action.item;
      if (item.type !== 'LiveChatTextMessage') {
        return;
      }
      const { chat, payAmount } = convertChat(item as unknown as LiveChatTextMessage);
      if (payAmount != null) {
        const cheeseChat: CheeseChat = { ...chat, payAmount };
        pendingCheeseChatListRef.current = [...pendingCheeseChatListRef.current, cheeseChat].slice(
          -1 * INTERNAL_MAX_LENGTH,
        );
      } else {
        pendingChatListRef.current = [...pendingChatListRef.current, chat].slice(-1 * INTERNAL_MAX_LENGTH);
      }
    },
    [convertChat],
  );

  useLiveChat(videoId, handleChatUpdate, handleMetadataUpdate);

  return { pendingChatListRef, pendingCheeseChatListRef, viewerCount };
}
