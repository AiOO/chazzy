import { memo, ReactElement, useMemo } from 'react';

type Provider = 'chzzk' | 'twitch' | 'afreecatv' | 'youtube';

interface Props {
  provider: Provider;
  channelName: string;
  channelImageUrl: string;
  liveCategoryValue?: string;
  concurrentUserCount?: number;
  isLive?: boolean;
}

function Status(props: Props): ReactElement {
  const { provider, channelName, channelImageUrl, liveCategoryValue, concurrentUserCount, isLive } = props;

  const ringColor = useMemo(() => {
    switch (provider) {
      case 'chzzk':
        return '#00ffa3,#027f80';
      case 'twitch':
        return '#bf94ff,#772ce8';
      case 'afreecatv':
        return '#6694ff,#2266ff';
      case 'youtube':
        return '#ff0000,#cc0000';
    }
  }, [provider]);

  return (
    <div className="status">
      <div
        className="profile-image"
        style={{
          ...(isLive
            ? {
                backgroundImage: `linear-gradient(#141517,#141517),linear-gradient(180deg,${ringColor})`,
              }
            : {
                filter: 'grayscale(100%) contrast(85%)',
                opacity: 0.8,
              }),
        }}
      >
        <img alt={channelName} src={channelImageUrl} width="26" height="26" />
      </div>
      <div className="profile-status">
        <div className="nickname">{channelName}</div>
        {isLive && liveCategoryValue != null && <div className="live-category">{liveCategoryValue}</div>}
      </div>
      {isLive && concurrentUserCount != null && (
        <div className="user-count">
          <div />
          {concurrentUserCount.toLocaleString('ko-KR')}
        </div>
      )}
    </div>
  );
}

export default memo(Status);
