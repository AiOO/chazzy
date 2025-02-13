export interface Channel {
  channelId: string;
  channelName: string;
  channelImageUrl?: string;
  verifiedMark: boolean;
  channelType: string;
  channelDescription: string;
  followerCount: number;
  openLive: boolean;
}

export interface LiveStatus {
  liveTitle: string;
  status: string;
  concurrentUserCount: number;
  accumulateCount: number;
  paidPromotion: boolean;
  adult: boolean;
  chatChannelId: string;
  categoryType: string;
  liveCategory: string;
  liveCategoryValue: string;
  livePollingStatusJson: string;
  faultStatus: unknown;
}

export enum MessageTypeCode {
  CHAT = 1,
  CHEESE_CHAT = 10,
}

export interface Chat {
  svcid: string;
  cid: string;
  mbrCnt: number;
  uid: string;
  profile: string;
  msg: string;
  msgTypeCode: MessageTypeCode;
  msgStatusType: 'NORMAL' | 'HIDDEN';
  extras: string;
  ctime: number;
  utime: number;
  msgTid: unknown;
  msgTime: number;
}

export interface RecentChat {
  serviceId: string;
  channelId: string;
  memberCount: number;
  userId: string;
  profile: string;
  content: string;
  messageTypeCode: MessageTypeCode;
  messageStatusType: 'NORMAL' | 'HIDDEN';
  extras: string;
  createTime: number;
  updateTime: number;
  msgTid: unknown;
  messageTime: number;
}

export interface Badge {
  badgeNo?: number;
  badgeId?: string;
  imageUrl: string;
  title?: string;
  description?: string;
  activated?: boolean;
}

export interface ViewerBadge {
  type: string;
  badge: {
    badgeId?: string;
    scope: string;
    imageUrl: string;
  };
}

export interface RealTimeDonationRanking {
  badge: Badge;
}

export interface Subscription {
  accumulativeMonth: number;
  tier: number;
  badge: Badge;
}

export interface StreamingProperty {
  realTimeDonationRanking?: RealTimeDonationRanking;
  subscription?: Subscription;
  activatedAchievementBadgeIds: string[];
}

export interface Title {
  name: string;
  color: string;
}

export interface Profile {
  userIdHash: string;
  nickname: string;
  profileImageUrl: string | null;
  userRoleCode: number;
  badge: Badge | null;
  title: Title | null;
  verifiedMark: boolean;
  activityBadges: Badge[];
  streamingProperty: StreamingProperty;
  viewerBadges: ViewerBadge[];
}

export interface WeeklyRank {
  userIdHash: string;
  nickName: string;
  verfiedMark: boolean;
  donationAmount: number;
  ranking: number;
}

export interface Extras {
  chatType: string;
  emojis: Record<string, string> | string;
  osType: string;
  streamingChannelId: string;
  extraToken?: string;
  payType?: string;
  payAmount?: number;
  nickname?: string;
  donationType?: string;
  weeklyRankList?: WeeklyRank[];
  donationUserWeeklyRank?: WeeklyRank;
  registerProfile?: Profile;
}

export interface Blind {
  messageTime: number;
  blindType: string;
  blindUserId: unknown;
  serviceId: string;
  message: unknown;
  userId: string;
  channelId: string;
}

export enum ChatCmd {
  PING = 0,
  PONG = 10000,
  CONNECT = 100,
  RECENT_CHAT = 15101,
  CHAT = 93101,
  CHEESE_CHAT = 93102,
  BLIND = 94008,
}

export interface BaseMessage {
  svcId: string;
  ver: string;
  cmd: ChatCmd;
  tid: string | null;
  cid: string;
}

export interface RecentChatMessage extends BaseMessage {
  bdy: {
    messageList: RecentChat[];
    userCount: number;
    notice: Omit<RecentChat, 'memberCount' | 'messageStatusType' | 'msgTid'>;
  };
  retCode?: string;
  retMsg?: string;
  cmd: ChatCmd.RECENT_CHAT;
}

export interface ChatMessage extends BaseMessage {
  bdy: Chat[];
  cmd: ChatCmd.CHAT | ChatCmd.CHEESE_CHAT;
}

export interface BlindMessage extends BaseMessage {
  bdy: Blind;
  cmd: ChatCmd.BLIND;
}

export interface PingMessage {
  ver: string;
  cmd: ChatCmd.PING | ChatCmd.PONG;
}

export type Message = ChatMessage | RecentChatMessage | BlindMessage | PingMessage;
