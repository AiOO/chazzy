// YouTube Live Chat Types

export interface VideoInfo {
  videoId: string;
  title: string;
  channelName: string;
  channelId: string;
  isLive: boolean;
  viewerCount?: number;
  thumbnailUrl?: string;
}

export interface Image {
  url: string;
}

export interface Badge {
  custom_thumbnail: Image[];
}

export interface LiveChatTextMessageAuthor {
  id: string;
  name: string;
  badges: Badge[];
}

export interface Emoji {
  emoji_id: string;
  image: Image[];
}

export interface MessageRun {
  emoji?: Emoji;
  text?: string;
}

export interface Message {
  runs: MessageRun[];
}

export interface LiveChatTextMessage {
  timestamp: number;
  author: LiveChatTextMessageAuthor;
  message: Message;
}
