import { Fragment, memo } from 'react';
import urlRegexSafe from 'url-regex-safe';
import { Chat } from '../chat/types';

function ChatRow(props: Chat) {
  // console.log(props); //! 디버깅용

  const { platform, time, nickname, badges, color, emojis, message, isItalic, deletionReason } = props;
  const timestamp = (() => {
    const date = new Date(time);
    return `[${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}]`;
  })();

  let img: string = "";
  switch (platform) {
    case "chzzk":
      img = "/Chzzk.svg";
      break;
    case "twitch":
      img = "/twitch.svg";
      break;

    default:
      break;
  }

  return (
    <div className="chat-row">
      <span className="timestamp">{timestamp}</span>

      <div style={{ display: "inline" }}>
        <img src={img} style={{ height: "20px", margin: "0px 5px 0px 0px" }} />

        {badges.length > 0 && badges.map((src, i) => <img key={i} className="badge" alt="" src={src} style={{ height: "20px", padding: "0px 5px 0px 0px" }} />)}
      </div>

      <span className="nickname" style={{ color: color }}>
        {nickname}:
      </span>
      <span className={`message${isItalic === true ? ' italic' : ''}${deletionReason != null ? ' deleted' : ''}`}>
        {deletionReason != null
          ? deletionReason
          : message.map((part, i) => (
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
              ) : (
                <img className="sticker" alt="sticker" src={part.url} />
              )}
            </Fragment>
          ))}
      </span>
    </div>
  );
}

export default memo(ChatRow);
