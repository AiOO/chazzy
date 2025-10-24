import { useEffect, useState } from 'react';
import useInnertube from './useInnertube';
import { YT, YTNodes } from 'youtubei.js';

export default function useLiveChat(
  videoId: string | undefined,
  handleChatUpdate: (action: YTNodes.AddChatItemAction) => void,
  handleMetadataUpdate: (metadata: InstanceType<typeof YT.LiveChat>['metadata']) => void,
) {
  const [liveChat, setLiveChat] = useState<YT.LiveChat>();

  const { innertube } = useInnertube();

  useEffect(() => {
    if (videoId == null || innertube == null) {
      return;
    }

    void (async () => {
      const info = await innertube.getInfo(videoId);
      if (!info.basic_info.is_live) {
        return;
      }
      const liveChat = info.getLiveChat();
      liveChat.start();
      setLiveChat(liveChat);
    })();
  }, [innertube, videoId]);

  useEffect(() => {
    if (liveChat == null) {
      return;
    }

    liveChat.on('metadata-update', handleMetadataUpdate);
    liveChat.on('chat-update', handleChatUpdate);

    return () => {
      liveChat.stop();
      liveChat.off('chat-update', handleChatUpdate);
      liveChat.off('metadata-update', handleMetadataUpdate);
    };
  }, [handleChatUpdate, handleMetadataUpdate, liveChat]);

  return { liveChat };
}
