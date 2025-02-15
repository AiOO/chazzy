import { useEffect, useState } from 'react';
import { User } from './types';

export default function useUser(channelId: string | undefined) {
  const [user, setUser] = useState<User>(undefined);

  const twitchClientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
  const twitchAccessToken = process.env.NEXT_PUBLIC_TWITCH_ACCESS_TOKEN;

  useEffect(() => {
    if (channelId == null) {
      return;
    }
    void (async () => {
      await fetch(`https://api.twitch.tv/helix/users?login=${channelId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${twitchAccessToken}`,
          'Client-Id': twitchClientId,
        },
      })
        .then((response) => response.json() as Promise<{ data: User[] }>)
        .then((data) => {
          setUser(data['data']?.[0]);
        });
    })();
  }, [channelId]);

  return { user };
}
