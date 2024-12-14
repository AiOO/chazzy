import { useEffect, useState } from 'react';
import { Emoticon } from './types';

export default function useEmoticons(channelId: string | undefined) {
  const [emoticons, setEmoticons] = useState<Emoticon[]>([]);

  useEffect(() => {
    if (channelId == null) {
      return;
    }
    void (async () => {
      await fetch(
        `https://live.sooplive.co.kr/api/signature_emoticon_api.php?szCallBack=hello&work=list&szBjId=${channelId}&_=${new Date().getTime()}`,
      )
        .then((response) => response.text())
        .then((data) => {
          const jsonData = JSON.parse(data.slice(6, data.length - 2)) as { result: number; data: Emoticon[] };
          if (jsonData.result === 1) {
            setEmoticons(jsonData.data);
          }
        });
    })();
  }, [channelId]);

  return { emoticons };
}
