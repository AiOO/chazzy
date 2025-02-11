export interface Broad {
  broad_grade: number;
  broad_no: number;
  broad_title: string;
  current_sum_viewer: number;
  is_password: boolean;
  user_id: string;
}

export interface User {
  profile_image: string;
  user_id: string;
  user_nick: string;
}

export interface Vod {
  auth_no: number;
  bbs_no: number;
  display_type: number;
  indention: number;
  line: number;
  main_view_yn: number;
  name: string;
  name_font: number;
  rnum: number;
  station_no: number;
  view_type: number;
  w_auth_no: number;
}

export interface Station {
  active_no: number;
  broad_start: string;
  display: {
    main_type: string;
    profile_text: string;
    skin_no: number;
    skin_type: number;
    title_skin_image: string;
    title_text: string;
    title_type: string;
  };
  grade: number;
  groups: unknown[];
  jointime: string;
  menus: Vod[];
  sns: {
    id: number;
    user_id: string;
    type: number;
    channel_id: string;
    playlist_id: string;
    title: string;
    followers: number;
    state: number;
    expire_at: string;
    created_at: string;
    updated_at: string;
  }[];
  station_name: string;
  station_no: number;
  total_broad_time: number;
  upd: {
    asp_code: number;
    fan_cnt: number;
    station_no: number;
    today0_fav_cnt: number;
    today0_ok_cnt: number;
    today0_visit_cnt: number;
    today1_fav_cnt: number;
    today1_ok_cnt: number;
    today1_visit_cnt: number;
    total_ok_cnt: number;
    total_view_cnt: number;
    total_visit_cnt: number;
    user_id: string;
  };
  user_id: string;
  user_nick: string;
  vods: Vod[];
}

export interface StationResponse {
  broad: Broad | null;
  country: string;
  current_timestamp: string;
  is_adsence: boolean;
  is_af_supporters_bj: boolean;
  is_best_bj: boolean;
  is_favorite: boolean;
  is_manager: boolean;
  is_mobile_push: boolean;
  is_notice: boolean;
  is_owner: boolean;
  is_partner_bj: boolean;
  is_ppv_bj: boolean;
  is_shopfreeca_bj: boolean;
  is_sports_bj: boolean;
  is_subscription: boolean;
  profile_image: string;
  starballoon_top: User[];
  station: Station;
  sticker_top: User[];
  subscribe_visible: string;
  subscription: {
    count: number;
  };
}

export interface Personalcon {
  MONTH: number;
  FILENAME: string;
}

export interface Channel {
  AUTO_HASHTAGS: unknown[];
  BJAWARD: boolean;
  BJAWARDWATERMARK: boolean;
  BJAWARDYEAR: string;
  BJGRADE: number;
  BJID: string;
  BJNICK: string;
  BNO: string;
  BPCBANNER: boolean;
  BPCCHATPOPBANNER: boolean;
  BPCPOSTROLL: string;
  BPCPREROLL: string;
  PBCTIMEBANNER: boolean;
  BPS: string;
  BPWD: string;
  BTIME: number;
  BTYPE: string;
  CATE: string;
  CATEGORY_TAGS: string[];
  CDN: string;
  CHATNO: string;
  CHDOMAIN: string;
  CHIP: string;
  CHPT: string;
  CLEAR_MODE_CATE?: string[];
  CPNO: number;
  CTIP: string;
  CTPT: string;
  CTUSER: number;
  DH: number;
  FTK: string;
  GEM: boolean;
  GEM_LOG: boolean;
  GRADE: string;
  GWIP: string;
  GWPT: string;
  HASH_TAGS: string[];
  ISFAV: string;
  ISSP: number;
  LOWBUFFER_DURATION: string;
  LOWLAYTENCYBJ: number;
  MAXBUFFER_DURATION: string;
  MAXOVERSEEKDURATION: string;
  MDPT: string;
  MIDROLL: {
    VALUE: string;
    OFFSET_START_TIME: number;
    OFFSET_END_TIME: number;
  };
  MIDROLLTAG: string;
  ORG: string;
  PBNO: string;
  PCON: number;
  PCON_MONTH: string[];
  PCON_OBJECT: Record<'tier1' | 'tier2' | 'tier3', Personalcon[] | undefined> | null;
  PCON_TIME: number;
  PLAYBACKRATEDELTA: string;
  PLAYTIMINGBUFFER_DURATION: string;
  POSTROLLTAG: string;
  PREROLLTAG: string;
  RESOLUTION: string;
  RESULT: number;
  RMD: string;
  S1440P: number;
  STNO: string;
  STREAMER_PLAYTIMINGBUFFER_DURATION: string;
  STYPE: string;
  TITLE: string;
  VBT: string;
  VIEWPRESET: {
    bps: number;
    label: string;
    label_resolution: string;
    name: string;
  }[];
  WC: number;
  acpt_lang: string;
  geo_cc: string;
  geo_rc: string;
  svc_lang: string;
}

export interface Emoticon {
  title: string;
  pc_img: string;
  mobile_img: string;
  pc_alternate_img: string;
  mob_alternate_img: string;
  move_img: string;
  order_no: string;
  black_keyword: string;
}

export interface EmoticonResponse {
  result: number;
  data: Emoticon[];
}
