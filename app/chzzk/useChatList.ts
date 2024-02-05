import { useCallback, useEffect, useRef, useState } from 'react';
import { captureException, setContext } from '@sentry/nextjs';
import { Chat, CheeseChat, ClearMessage, MessagePart, TextMessagePart } from '../chat/types';
import { nicknameColors } from './constants';
import { Chat as ChzzkChat, ChatCmd, Extras, Message, MessageTypeCode, Profile } from './types';
import useAccessToken from '@/app/chzzk/useAccessToken';

const INTERNAL_MAX_LENGTH = 10000;

const emojiRegex = /{:([a-zA-Z0-9_]+):}/;

function splitWithSpace(message: string): TextMessagePart[] {
  return message
    .split(/([^ ]+)/)
    .filter((part) => part !== '')
    .map((part) => ({ type: 'text', text: part }));
}

export default function useChatList(
  chatChannelId: string | undefined,
  onClearMessage?: (clearMessage: ClearMessage) => void,
) {
  const isUnloadingRef = useRef<boolean>(false);
  const isRefreshingRef = useRef<boolean>(false);
  const pendingChatListRef = useRef<Chat[]>([]);
  const pendingCheeseChatListRef = useRef<CheeseChat[]>([]);
  const [webSocketBuster, setWebSocketBuster] = useState<number>(0);

  const { accessToken: accessToken } = useAccessToken(chatChannelId);

  const convertChat = useCallback((chzzkChat: ChzzkChat): { chat: Chat; payAmount: number | undefined } => {
    const profile = JSON.parse(chzzkChat.profile) as Profile;
    const extras = JSON.parse(chzzkChat.extras) as Extras;
    const nickname = profile.nickname;
    const badge = profile.badge?.imageUrl;
    const donationBadge = profile.streamingProperty?.realTimeDonationRanking?.badge.imageUrl;
    const badges = [badge, donationBadge]
      .concat(profile.activityBadges?.filter((badge) => badge.activated)?.map((badge) => badge.imageUrl) ?? [])
      .filter((badge) => badge != null);
    const color =
      profile.title?.color ??
      nicknameColors[
      `${profile.userIdHash}${chzzkChat.cid}`
        .split('')
        .map((c) => c.charCodeAt(0))
        .reduce((a, b) => a + b, 0) % nicknameColors.length
      ];
    const emojis = typeof extras.emojis !== 'string' ? extras.emojis : {};
    const message = chzzkChat.msg || '';
    const match = message.match(emojiRegex);

    return {
      chat: {
        platform: "chzzk",
        uid: Math.random().toString(36).substring(2, 12),
        time: chzzkChat.msgTime,
        userId: profile.userIdHash,
        nickname,
        badges,
        color,
        emojis,
        message: match
          ? message
            .split(emojiRegex)
            .map((part, i): MessagePart[] =>
              i % 2 == 0 ? splitWithSpace(part) : [{ type: 'emoji', emojiKey: part }],
            )
            .flat()
          : splitWithSpace(message),
      },
      payAmount: extras.payAmount,
    };
  }, []);

  const connectChzzk = useCallback(() => {
    if (chatChannelId == null || accessToken == null) {
      return () => { };
    }

    const ws = new WebSocket('wss://kr-ss1.chat.naver.com/chat');

    const worker = new Worker(
      URL.createObjectURL(
        new Blob(
          [
            `
            let timeout = null

            onmessage = (e) => {
              if (e.data === "startPingTimer") {
                if (timeout != null) {
                  clearTimeout(timeout)
                }
                timeout = setTimeout(function reservePing() {
                  postMessage("ping")
                  timeout = setTimeout(reservePing, 20000)
                }, 20000)
              }
              if (e.data === "stop") {
                if (timeout != null) {
                  clearTimeout(timeout)
                }
              }
            }
            `,
          ],
          { type: 'application/javascript' },
        ),
      ),
    );

    worker.onmessage = (e) => {
      if (e.data === 'ping') {
        ws.send(
          JSON.stringify({
            ver: '2',
            cmd: ChatCmd.PING,
          }),
        );
      }
    };

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          bdy: {
            accTkn: accessToken,
            auth: 'READ',
            devType: 2001,
            uid: null,
          },
          cmd: ChatCmd.CONNECT,
          tid: 1,
          cid: chatChannelId,
          svcid: 'game',
          ver: '2',
        }),
      );
      isRefreshingRef.current = false;
    };

    ws.onclose = () => {
      if (!isUnloadingRef.current && !isRefreshingRef.current) {
        setTimeout(() => setWebSocketBuster(new Date().getTime()), 1000);
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      const json = JSON.parse(event.data as string) as Message;

      switch (json.cmd) {
        case ChatCmd.PING:
          ws.send(JSON.stringify({ ver: '2', cmd: ChatCmd.PONG }));
          break;
        case ChatCmd.CHAT:
        case ChatCmd.CHEESE_CHAT:
          worker.postMessage('startPingTimer');
          {
            const chats: {
              chat: Chat;
              payAmount: number | undefined;
            }[] = json['bdy']
              .filter((chat) => {
                if (chat.msgStatusType === 'HIDDEN') {
                  return false;
                }
                if (chat.msgTypeCode !== MessageTypeCode.CHAT && chat.msgTypeCode !== MessageTypeCode.CHEESE_CHAT) {
                  return false;
                }
                return true;
              })
              .map((chzzkChat) => {
                let chat: {
                  chat: Chat;
                  payAmount: number | undefined;
                } | null = null;
                try {
                  chat = convertChat(chzzkChat);
                } catch (e: unknown) {
                  setContext('WebSocket Message', json);
                  captureException(e);
                }
                return chat;
              })
              .filter((chat) => chat != null);

            const chatList = chats.filter(({ payAmount }) => payAmount == null).map(({ chat }) => chat);

            pendingChatListRef.current = [...pendingChatListRef.current, ...chatList].slice(-1 * INTERNAL_MAX_LENGTH);

            const cheeseChatList: CheeseChat[] = chats
              .filter(({ payAmount }) => payAmount != null)
              .map(({ chat, payAmount }) => ({
                ...chat,
                payAmount,
              }));

            pendingCheeseChatListRef.current = [...pendingCheeseChatListRef.current, ...cheeseChatList].slice(
              -1 * INTERNAL_MAX_LENGTH,
            );
          }
          break;
        case ChatCmd.BLIND:
          worker.postMessage('startPingTimer');
          setTimeout(
            () =>
              onClearMessage?.({
                type: 'message',
                method: {
                  type: 'chzzk',
                  userId: json['bdy'].userId,
                },
              }),
            300,
          );
          break;
        default:
          break;
      }
    };

    worker.postMessage('startPingTimer');

    return () => {
      worker.postMessage('stop');
      worker.terminate();
      ws.close();
    };
  }, [accessToken, chatChannelId, convertChat]);

  useEffect(() => {
    isRefreshingRef.current = true;
    return connectChzzk();
  }, [connectChzzk, webSocketBuster]);

  useEffect(() => {
    return () => {
      isUnloadingRef.current = true;
    };
  }, []);

  return { pendingChatListRef, pendingCheeseChatListRef };
}
