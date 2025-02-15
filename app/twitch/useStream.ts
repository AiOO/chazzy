import { useEffect, useState } from 'react';
import { Stream } from './types';

export default function useStream(userId: string | undefined) {
  const [stream, setStream] = useState<Stream>(undefined);

  const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const twitchAccessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN;

  useEffect(() => {
    if (userId == null) {
      return;
    }
    const fn = async () => {
      await fetch(`https://api.twitch.tv/helix/streams?user_id=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${twitchAccessToken}`,
          'Client-Id': twitchClientId,
        },
      })
        .then((response) => response.json() as Promise<{ data: Stream[] }>)
        .then((data) => {
          setStream(data['data']?.[0]);
        });
    };
    void fn();
    const interval = setInterval(() => void fn(), 30000);
    return () => clearInterval(interval);
  }, [userId]);

  return { stream };
}
