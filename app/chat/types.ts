export interface TextMessagePart {
  type: 'text';
  text: string;
}

export interface EmojiMessagePart {
  type: 'emoji';
  emojiKey: string;
}

export interface StickerMessagePart {
  type: 'sticker';
  url: string;
}

export type MessagePart = TextMessagePart | EmojiMessagePart | StickerMessagePart;

export interface Chat {
  platform: string;
  uid: string;
  time: number;
  userId: string;
  nickname: string;
  badges: string[];
  color: string;
  emojis: Record<string, string>;
  message: MessagePart[];
  isItalic?: boolean;
  deletionReason?: string;
}

export interface CheeseChat extends Chat {
  payAmount: number;
}

interface ClearByChzzkMessageMethod {
  type: 'chzzk';
  userId: string;
}

interface ClearTwitchMessageMethod {
  type: 'twitch';
  uid: string;
}

interface ClearSpecificMessage {
  type: 'message';
  method: ClearByChzzkMessageMethod | ClearTwitchMessageMethod;
}

interface ClearUserMessages {
  type: 'user';
  userId: string;
}

export type ClearMessage = ClearSpecificMessage | ClearUserMessages;
