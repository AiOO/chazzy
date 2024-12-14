import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Chat, MessagePart, TextMessagePart } from '../chat/types';
import { emojis as defaultEmojis, nicknameColors } from './constants';
import parseMessage from './parser/parseMessage';
import { Channel } from './types';
import useEmoticons from './useEmoticons';

const INTERNAL_MAX_LENGTH = 10000;

const emojiRegex = /\/([^/]+)\//;

function splitWithSpace(message: string): TextMessagePart[] {
  return message
    .split(/([^ ]+)/)
    .filter((part) => part !== '')
    .map((part) => ({ type: 'text', text: part }));
}

function parseFlag(flag: string) {
  const [flag1, flag2] = flag.split('|');
  const flag1Number = Number(flag1);
  const flag2Number = Number(flag2);
  return {
    isAdmin: (flag1Number & 1) === 1,
    isBj: (flag1Number & (1 << 2)) === 1 << 2,
    isFan: (flag1Number & (1 << 5)) === 1 << 5,
    isManager: (flag1Number & (1 << 8)) === 1 << 8,
    isTopFan: (flag1Number & (1 << 15)) === 1 << 15,
    isQuickView: (flag1Number & (1 << 19)) === 1 << 19,
    isSupporter: (flag1Number & (1 << 20)) === 1 << 20,
    isFollower: (flag1Number & (1 << 28)) === 1 << 28,
    isEmployee: (flag2Number & (1 << 10)) === 1 << 10,
    isCleanAti: (flag2Number & (1 << 11)) === 1 << 11,
  };
}

export default function useChatList(channel: Channel | undefined) {
  const { CHDOMAIN, CHATNO, FTK, BJID, CHPT, BNO, PCON_OBJECT } = channel ?? {};

  const isRefreshingRef = useRef<boolean>(false);
  const isUnloadingRef = useRef<boolean>(false);
  const pendingChatListRef = useRef<Chat[]>([]);
  const [webSocketBuster, setWebSocketBuster] = useState<number>(0);

  const webSocketUrl = useMemo(() => {
    if (channel == null || CHDOMAIN == null || BJID == null) {
      return undefined;
    }
    return `wss://${CHDOMAIN}:${CHPT}/Websocket/${BJID}`;
  }, [CHDOMAIN, CHPT, BNO]);
  const handshake = useMemo(() => {
    if (channel == null) {
      return undefined;
    }
    const payload = `\f${CHATNO}\f${FTK}\f0\f\flog\u0011\u0006&\u0006set_bps\u0006=\u00068000\u0006&\u0006view_bps\u0006=\u00061000\u0006&\u0006quality\u0006=\u0006normal\u0006&\u0006uuid\u0006=\u00061e43cf6d37913c36b35d580e0b5656ec\u0006&\u0006geo_cc\u0006=\u0006KR\u0006&\u0006geo_rc\u0006=\u000611\u0006&\u0006acpt_lang\u0006=\u0006ko_KR\u0006&\u0006svc_lang\u0006=\u0006ko_KR\u0012pwd\u0011\u0012auth_info\u0011NULL\u0012pver\u00111\u0012access_system\u0011html5\u0012\f`;
    const key = payload.length.toString().padStart(6, '0');
    return `\u001b\t0002${key}00${payload}`;
  }, [BJID, CHATNO, FTK]);

  const { emoticons } = useEmoticons(BJID);
  const emojis = useMemo(
    () => ({
      ...defaultEmojis,
      ...Object.fromEntries(
        emoticons.map(({ title, pc_img }) => [
          title,
          `https://static.file.sooplive.co.kr/signature_emoticon/${BJID}/${pc_img}`,
        ]),
      ),
    }),
    [emoticons],
  );

  const convertChat = useCallback(
    (afreecatvMessage: string[]): Chat => {
      const { isFan, isManager, isTopFan, isQuickView, isSupporter } = parseFlag(afreecatvMessage[7]);
      const message = afreecatvMessage[1];
      const match = message.match(emojiRegex);
      const subscriptionMonths = parseInt(afreecatvMessage[8]);
      const personalSubscriptionBadge = PCON_OBJECT.findLast(({ MONTH }) => subscriptionMonths > MONTH)?.FILENAME;
      const userId = afreecatvMessage[2];
      const color =
        nicknameColors[
          userId
            .split('')
            .map((c) => c.charCodeAt(0))
            .reduce((a, b) => a + b, 0) % nicknameColors.length
        ];
      return {
        uid: `${userId}-${new Date().getTime()}`,
        time: new Date().getTime(),
        userId,
        nickname: afreecatvMessage[6],
        badges: [
          subscriptionMonths !== -1 ? personalSubscriptionBadge : null,
          isManager ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_manager.gif' : null,
          !isManager && isTopFan ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_hot.gif' : null,
          !isManager && subscriptionMonths !== -1 && personalSubscriptionBadge == null
            ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_gudok.gif'
            : null,
          !isManager && !isTopFan && isFan ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_fanclub.gif' : null,
          !isManager && isSupporter ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_support.gif' : null,
          !isManager && isQuickView ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_quick.gif' : null,
        ].filter((badge) => badge != null),
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
        isItalic: false,
      };
    },
    [PCON_OBJECT, emojis, parseFlag],
  );

  const convertStickerChat = useCallback(
    (afreecatvMessage: string[]): Chat => {
      const { isFan, isManager, isTopFan, isQuickView, isSupporter } = parseFlag(afreecatvMessage[8]);
      const stickerId = afreecatvMessage[3];
      const stickerSubId = afreecatvMessage[4];
      const stickerVersion = afreecatvMessage[5];
      const stickerExtension = afreecatvMessage[12];
      const subscriptionMonths = parseInt(afreecatvMessage[13]);
      const personalSubscriptionBadge = PCON_OBJECT.findLast(({ MONTH }) => subscriptionMonths > MONTH)?.FILENAME;
      const userId = afreecatvMessage[6];
      const color =
        nicknameColors[
          userId
            .split('')
            .map((c) => c.charCodeAt(0))
            .reduce((a, b) => a + b, 0) % nicknameColors.length
        ];
      return {
        uid: `${userId}-${new Date().getTime()}`,
        time: new Date().getTime(),
        userId,
        nickname: afreecatvMessage[7],
        badges: [
          subscriptionMonths !== -1 ? personalSubscriptionBadge : null,
          isManager ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_manager.gif' : null,
          !isManager && isTopFan ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_hot.gif' : null,
          !isManager && subscriptionMonths !== -1 && personalSubscriptionBadge == null
            ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_gudok.gif'
            : null,
          !isManager && !isTopFan && isFan ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_fanclub.gif' : null,
          !isManager && isSupporter ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_support.gif' : null,
          !isManager && isQuickView ? 'https://res.sooplive.co.kr/images/new_app/chat/ic_quick.gif' : null,
        ].filter((badge) => badge != null),
        color,
        emojis,
        message: [
          {
            type: 'sticker',
            url: `https://ogq-sticker-global-cdn-z01.sooplive.co.kr/sticker/${stickerId}/${stickerSubId}_40.${stickerExtension}?ver=${stickerVersion}`,
          },
        ],
        isItalic: false,
      };
    },
    [emojis, parseFlag],
  );

  const connectAfreecatv = useCallback(() => {
    if (channel == null || webSocketUrl == null) {
      return () => {};
    }

    const ws = new WebSocket(webSocketUrl, ['chat']);
    ws.binaryType = 'arraybuffer';

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
                    timeout = setTimeout(reservePing, 60000)
                  }, 60000)
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
        ws.send('\u001b\t000000000100\f');
      }
    };

    ws.onopen = () => {
      ws.send(new TextEncoder().encode('\u001b\t000100000600\f\f\f16\f'));
      setTimeout(() => ws.send(handshake), 100);
      isRefreshingRef.current = false;
    };

    ws.onclose = () => {
      if (!isUnloadingRef.current && !isRefreshingRef.current) {
        setTimeout(() => setWebSocketBuster(new Date().getTime()), 1000);
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      const data = event.data as ArrayBuffer;

      const parsedMessage = parseMessage(data);
      if (parsedMessage[0].startsWith('0005')) {
        pendingChatListRef.current = [...pendingChatListRef.current, convertChat(parsedMessage)].slice(
          -1 * INTERNAL_MAX_LENGTH,
        );
      } else if (parsedMessage[0].startsWith('0109')) {
        pendingChatListRef.current = [...pendingChatListRef.current, convertStickerChat(parsedMessage)].slice(
          -1 * INTERNAL_MAX_LENGTH,
        );
      }
    };

    worker.postMessage('startPingTimer');

    return () => {
      worker.postMessage('stop');
      worker.terminate();
      ws.close();
    };
  }, [webSocketUrl, handshake, convertChat, convertStickerChat]);

  useEffect(() => {
    isRefreshingRef.current = true;
    return connectAfreecatv();
  }, [connectAfreecatv, webSocketBuster]);

  useEffect(() => {
    return () => {
      isUnloadingRef.current = true;
    };
  }, []);

  return { pendingChatListRef };
}
