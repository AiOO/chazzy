import { useEffect, useState } from 'react';
import { VideoInfo } from './types';
import useInnertube from './useInnertube';

export default function useVideoInfo(videoId: string | undefined) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);

  const { innertube } = useInnertube();

  useEffect(() => {
    if (videoId == null || innertube == null) {
      return;
    }

    const fn = async () => {
      await innertube.getInfo(videoId).then((info) =>
        setVideoInfo({
          videoId: info.basic_info.id,
          title: info.basic_info.title,
          channelName: info.basic_info.author,
          channelId: info.basic_info.channel_id,
          isLive: info.basic_info.is_live || false,
          viewerCount: undefined,
          thumbnailUrl: info.basic_info.thumbnail?.[0]?.url,
        }),
      );
    };
    void fn();
    const interval = setInterval(() => void fn(), 30000);
    return () => clearInterval(interval);
  }, [innertube, videoId]);

  return { videoInfo };
}
