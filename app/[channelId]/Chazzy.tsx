'use client';

import { CSSProperties, ReactElement, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useAfreecatvStation from '../afreecatv/useStation';
import useAfreecatvChatList from '../afreecatv/useChatList';
import useAfreecatvChannel from '../afreecatv/useChannel';
import { Chat, ClearMessage } from '../chat/types';
import useMergedList from '../chat/useMergedList';
import useChzzkChatList from '../chzzk/useChatList';
import useChzzkChannel from '../chzzk/useChannel';
import useLiveStatus from '../chzzk/useLiveStatus';
import useTwitchChatList from '../twitch/useChatList';
import useTwitchUser from '../twitch/useUser';
import useStream from '../twitch/useStream';
import ChatRow from './ChatRow';
import ChazzyMenu from './ChazzyMenu';
import CheeseChatRow from './CheeseChatRow';
import EmptyCheeseChatRow from './EmptyCheeseChatRow';
import Status from './Status';
import './styles.css';

export interface ChazzyProps {
  afreecatvChannelId: string | undefined;
  chzzkChannelId: string | undefined;
  twitchChannelId: string | undefined;
}

export default function Chazzy(props: ChazzyProps): ReactElement {
  const { afreecatvChannelId, chzzkChannelId, twitchChannelId } = props;

  const isChatAutoScrollEnabledRef = useRef<boolean>(true);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const endOfChatScrollRef = useRef<HTMLDivElement>(null);
  const cheeseChatScrollRef = useRef<HTMLDivElement>(null);
  const [cheeseChatStyle, setCheeseChatStyle] = useState<CSSProperties>(undefined);

  const { channel: chzzkChannel } = useChzzkChannel(chzzkChannelId);
  const { liveStatus: chzzkLiveStatus } = useLiveStatus(chzzkChannelId);

  const { user: twitchUser } = useTwitchUser(twitchChannelId);
  const { stream: twitchStream } = useStream(twitchUser?.id);

  const { station: afreecatvStation } = useAfreecatvStation(afreecatvChannelId);
  const { channel: afreecatvChannel } = useAfreecatvChannel(
    afreecatvChannelId,
    afreecatvStation?.broad != null ? `${afreecatvStation?.broad.broad_no}` : undefined,
  );

  const handleClearChzzkMessage = useCallback((clearMessage: ClearMessage) => {
    setChatList((prevChatList) => {
      const findFn = ({ userId }: Chat) =>
        clearMessage.type === 'message'
          ? clearMessage.method.type === 'chzzk' && clearMessage.method.userId === userId
          : false;
      const lastIndexOnPendingChatList = pendingChzzkChatListRef.current.findLastIndex(findFn);
      const lastChatOnPendingChatList = pendingChzzkChatListRef.current[lastIndexOnPendingChatList];
      const lastIndexOnChatList = prevChatList.findLastIndex(findFn);
      const lastChatOnChatList = prevChatList[lastIndexOnChatList];
      const newChatList = [...prevChatList];
      if (lastChatOnPendingChatList == null && lastChatOnChatList != null) {
        newChatList.splice(lastIndexOnChatList, 1, {
          ...lastChatOnChatList,
          deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
        });
        return newChatList;
      } else if (lastChatOnPendingChatList != null && lastChatOnChatList == null) {
        pendingChzzkChatListRef.current.splice(lastIndexOnPendingChatList, 1, {
          ...lastChatOnPendingChatList,
          deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
        });
        return prevChatList;
      } else if (lastChatOnPendingChatList != null && lastChatOnChatList != null) {
        if (lastChatOnChatList.time > lastChatOnPendingChatList.time) {
          newChatList.splice(lastIndexOnChatList, 1, {
            ...lastChatOnChatList,
            deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
          });
          return newChatList;
        } else {
          pendingChzzkChatListRef.current.splice(lastIndexOnPendingChatList, 1, {
            ...lastChatOnPendingChatList,
            deletionReason: '클린봇이 부적절한 표현을 감지했습니다.',
          });
          return prevChatList;
        }
      }
      return prevChatList;
    });
  }, []);

  const handleClearTwitchMessage = useCallback((clearMessage: ClearMessage) => {
    const findFn = ({ uid, userId }: Chat) =>
      clearMessage.type === 'message'
        ? clearMessage.method.type === 'twitch' && clearMessage.method.uid === uid
        : clearMessage.userId === userId;
    setChatList((prevChatList) => {
      let isChanged = false;
      const newChatList = prevChatList.map((chat): Chat => {
        if (findFn(chat)) {
          isChanged = true;
          return {
            ...chat,
            isItalic: true,
            deletionReason: '매니저에 의해 메시지가 삭제됨',
          };
        }
        return chat;
      });
      return isChanged ? newChatList : prevChatList;
    });
    pendingTwitchChatListRef.current = pendingTwitchChatListRef.current.map((chat) =>
      findFn(chat)
        ? {
            ...chat,
            isItalic: true,
            deletionReason: '매니저에 의해 메시지가 삭제됨',
          }
        : chat,
    );
  }, []);

  const { pendingChatListRef: pendingAfreecatvChatListRef } = useAfreecatvChatList(afreecatvChannel);
  const { pendingChatListRef: pendingChzzkChatListRef, pendingCheeseChatListRef } = useChzzkChatList(
    chzzkLiveStatus?.chatChannelId,
    handleClearChzzkMessage,
  );
  const { pendingChatListRef: pendingTwitchChatListRef } = useTwitchChatList(
    twitchChannelId,
    twitchUser?.id,
    handleClearTwitchMessage,
  );

  const pendingChatListRefs = useMemo(
    () => [pendingAfreecatvChatListRef, pendingChzzkChatListRef, pendingTwitchChatListRef],
    [pendingAfreecatvChatListRef, pendingChzzkChatListRef, pendingTwitchChatListRef],
  );

  const pendingCheeseChatListRefs = useMemo(() => [pendingCheeseChatListRef], [pendingCheeseChatListRef]);

  const { list: chatList, setList: setChatList } = useMergedList({
    pendingListRefs: pendingChatListRefs,
    maxLength: 1000,
  });

  const { list: cheeseChatList } = useMergedList({
    pendingListRefs: pendingCheeseChatListRefs,
    maxLength: 10,
  });

  useEffect(() => {
    if (isChatAutoScrollEnabledRef.current && endOfChatScrollRef.current != null) {
      endOfChatScrollRef.current.scrollIntoView();
    }
  }, [chatList, cheeseChatList]);

  const handleChatScroll = useCallback(() => {
    if (chatScrollRef.current == null) return;
    isChatAutoScrollEnabledRef.current =
      chatScrollRef.current.scrollHeight <= chatScrollRef.current.scrollTop + chatScrollRef.current.clientHeight + 120;
  }, []);

  const handleCheeseChatScroll = useCallback(() => {
    if (cheeseChatScrollRef.current == null) return;
    const isTop = cheeseChatScrollRef.current.scrollTop <= 0;
    const isBottom =
      cheeseChatScrollRef.current.scrollTop >=
      cheeseChatScrollRef.current.scrollHeight - cheeseChatScrollRef.current.clientHeight;
    setCheeseChatStyle({
      maskImage: `linear-gradient(to bottom, ${isTop ? 'red' : 'transparent'} 0, red 1em calc(100% - 1em), ${isBottom ? 'red' : 'transparent'} 100%)`,
    });
  }, []);

  useLayoutEffect(() => {
    handleCheeseChatScroll();
  }, [cheeseChatList]);

  const arrangedCheeseChatList = useMemo(() => {
    const copied = cheeseChatList.filter((cheeseChat) => new Date().getTime() - cheeseChat.time < 60 * 5 * 1000);
    copied.reverse();
    return copied;
  }, [cheeseChatList]);

  return (
    <div id="chazzy-container">
      <div id="chat-container">
        <div
          id="chat-list-container"
          ref={(ref) => {
            if (ref == null) return;
            if (chatScrollRef.current != null) {
              chatScrollRef.current.removeEventListener('wheel', handleChatScroll);
              chatScrollRef.current.removeEventListener('touchmove', handleChatScroll);
            }
            ref.addEventListener('wheel', handleChatScroll);
            ref.addEventListener('touchmove', handleChatScroll);
            chatScrollRef.current = ref;
          }}
          style={{ flex: 2, height: '100%', overflowY: 'scroll' }}
        >
          {chatList.map((chat) => chat && <ChatRow key={chat.uid} {...chat} />)}
          <div ref={endOfChatScrollRef} />
        </div>
        {chzzkChannelId != null && (
          <div
            id="cheese-chat-list-container"
            ref={(ref) => {
              if (ref == null) return;
              if (cheeseChatScrollRef.current != null) {
                cheeseChatScrollRef.current.removeEventListener('scroll', handleCheeseChatScroll);
              }
              ref.addEventListener('scroll', handleCheeseChatScroll);
              cheeseChatScrollRef.current = ref;
            }}
            style={cheeseChatStyle}
          >
            {arrangedCheeseChatList.length === 0 ? (
              <EmptyCheeseChatRow />
            ) : (
              arrangedCheeseChatList.map((cheeseChat) => <CheeseChatRow key={cheeseChat.uid} {...cheeseChat} />)
            )}
          </div>
        )}
      </div>
      <div id="status-container">
        {chzzkChannelId != null && chzzkChannel != null && (
          <>
            <Status
              provider="chzzk"
              channelName={chzzkChannel.channelName}
              channelImageUrl={
                chzzkChannel.channelImageUrl ??
                'https://ssl.pstatic.net/cmstatic/nng/img/img_anonymous_square_gray_opacity2x.png?type=f120_120_na'
              }
              concurrentUserCount={chzzkLiveStatus?.concurrentUserCount}
              liveCategoryValue={chzzkLiveStatus?.liveCategoryValue}
              isLive={chzzkLiveStatus?.status === 'OPEN'}
            />
            <div className="divider" />
          </>
        )}
        {twitchChannelId != null && twitchUser != null && (
          <>
            <Status
              provider="twitch"
              channelName={twitchUser.display_name}
              channelImageUrl={twitchUser.profile_image_url}
              concurrentUserCount={twitchStream?.viewer_count}
              liveCategoryValue={twitchStream?.game_name}
              isLive={twitchStream != null}
            />
            <div className="divider" />
          </>
        )}
        {afreecatvChannelId != null && afreecatvStation != null && (
          <>
            <Status
              provider="afreecatv"
              channelName={afreecatvStation.station.user_nick}
              channelImageUrl={afreecatvStation.profile_image}
              concurrentUserCount={afreecatvStation.broad?.current_sum_viewer}
              liveCategoryValue={afreecatvStation.broad?.broad_title}
              isLive={afreecatvStation.broad != null}
            />
            <div className="divider" />
          </>
        )}
        <ChazzyMenu />
      </div>
    </div>
  );
}
