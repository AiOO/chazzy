import { useEffect, useState } from 'react';
import Innertube from 'youtubei.js';

function useInnertube() {
  const [innertube, setInnertube] = useState<Innertube | undefined>();

  useEffect(() => {
    void (async () => {
      setInnertube(await Innertube.create({ fetch: fetchFn }));
    })();
  }, []);

  return { innertube };
}

async function fetchFn(input: string | Request | RequestInfo | URL, init?: RequestInit) {
  const url = typeof input === 'string' ? new URL(input) : input instanceof URL ? input : new URL(input.url);
  url.host = 'innertube.proxy.aioo.ooo';
  return await fetch(new Request(url, input instanceof Request ? input : undefined), init);
}

export default useInnertube;
