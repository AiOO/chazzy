import { Fragment, memo } from 'react';
import urlRegexSafe from 'url-regex-safe';
import { CheeseChat } from '../chat/types';
import CheeseIcon from './CheeseIcon';

function CheeseChatRow(props: CheeseChat) {
  const { time, nickname, badges, emojis, message, payAmount } = props;
  const timestamp = (() => {
    const date = new Date(time);
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  })();
  const tier = (() => {
    if (payAmount === 0) {
      return 'tier0';
    } else if (payAmount >= 1000000) {
      return 'tier4';
    } else if (payAmount >= 100000) {
      return 'tier3';
    } else if (payAmount >= 10000) {
      return 'tier2';
    } else {
      return 'tier1';
    }
  })();

  return (
    <div className={`cheese-chat-row ${tier}`}>
      <div className="content">
        <span className="timestamp">[{timestamp}]</span>
        <span className="message">
          {message.map((part, i) => (
            <Fragment key={i}>
              {part.type === 'text' ? (
                (urlRegexSafe as (options: { exact: boolean }) => RegExp)({ exact: true }).test(part.text) ? (
                  <a href={part.text.startsWith('http') ? part.text : `https://${part.text}`} target="_blank">
                    {part.text}
                  </a>
                ) : (
                  <>{part.text}</>
                )
              ) : part.type === 'emoji' ? (
                <img className="emoji" alt={part.emojiKey} src={emojis[part.emojiKey]} />
              ) : null}
            </Fragment>
          ))}
        </span>
      </div>
      <div className="footer">
        <div className="nickname">
          {badges.length > 0 && badges.map((src, i) => <img key={i} className="badge" alt="" src={src} />)}
          <span>{nickname}</span>
        </div>
        <div className="cheese">
          <CheeseIcon />
          {payAmount.toLocaleString('ko-KR')}
        </div>
      </div>
    </div>
  );
}

export default memo(CheeseChatRow);
