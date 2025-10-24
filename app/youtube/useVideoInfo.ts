import { useEffect, useRef, useState } from 'react';
import { VideoInfo } from './types';
import useInnertube from './useInnertube';

export default function useVideoInfo(videoId: string | undefined) {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const thumbnailUrlRef = useRef<string | null>(null);

  const { innertube } = useInnertube();

  useEffect(() => {
    if (videoId == null || innertube == null) {
      return;
    }

    const fn = async () => {
      const info = await innertube.getInfo(videoId);
      const channelId = info.basic_info.channel_id;
      if (thumbnailUrlRef.current == null) {
        const channel = await innertube.getChannel(channelId);
        thumbnailUrlRef.current = channel.metadata.thumbnail[0].url;
      }
      setVideoInfo({
        videoId: info.basic_info.id,
        title: info.basic_info.title,
        channelName: info.basic_info.author,
        channelId,
        isLive: info.basic_info.is_live || false,
        viewerCount: undefined,
        thumbnailUrl: thumbnailUrlRef.current,
      });
    };
    void fn();
    const interval = setInterval(() => void fn(), 30000);
    return () => clearInterval(interval);
  }, [innertube, videoId]);

  useEffect(() => {
    if (videoId != null) {
      thumbnailUrlRef.current = null;
    }
  }, [videoId]);

  return { videoInfo };
}
