import { useEffect, useState } from 'react';
import { Channel } from './types';

export default function useChannel(channelId: string | undefined, broadNo: string | undefined) {
  const [channel, setChannel] = useState<Channel>(undefined);

  useEffect(() => {
    if (channelId == null || broadNo == null) {
      return;
    }
    void (async () => {
      await fetch(
        // Use proxy API backend
        `https://live.sooplive.co.kr.proxy.aioo.ooo/afreeca/player_live_api.php?bjid=${channelId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          },
          body: new URLSearchParams({
            bid: channelId,
            bno: broadNo,
            type: 'live',
            confirm_adult: 'false',
            player_type: 'html5',
            mode: 'landing',
            from_api: '0',
            pwd: '',
            stream_type: 'common',
            quality: 'HD',
          }),
        },
      )
        .then((response) => response.json() as Promise<{ CHANNEL: Channel }>)
        .then((data) => {
          setChannel({
            ...data.CHANNEL,
            CHPT: `${parseInt(data.CHANNEL.CHPT) + 1}`,
          });
        });
    })();
  }, [channelId, broadNo]);

  return { channel };
}
