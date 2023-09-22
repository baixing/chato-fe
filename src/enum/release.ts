export const enum EAfficialAccountStatusType {
  normal = 'normal',
  disabled = 'disabled',
  deleted = 'deleted'
}

export const enum EWeixinConfigText {
  url = '回调URL',
  token = 'Token',
  encoding_aes_key = 'EncodingAESKey',
  app_id = '企业ID',
  app_secret = 'Secret'
}

export enum EWeixinConfigType {
  url = 'url',
  token = 'token',
  encoding_aes_key = 'encoding_aes_key',
  app_id = 'app_id',
  app_secret = 'app_secret'
}

export const enum EChannelType {
  FEISHU = 'feishu',
  WECHAT_KF = 'wechat_kf',
  WECHAT_MP = 'wechat_mp',
  DOUYIN = 'douyin',
  DINGDING = 'dingding'
}

export enum EReleaseSettingExampleType {
  doc = 'doc',
  correct = 'correct',
  ad = 'ad'
}

export enum EQrCodeHookType {
  wxwork = 'wxwork'
}

export enum EAccountCreateStatus {
  create = 'create',
  failed = 'failed',
  success = 'success'
}

export enum EAccountSettingStatus {
  creating = 'creating',
  restart = 'restart'
}

export enum ECreateChatType {
  groupChat = 'groupChat',
  singleChat = 'singleChat'
}

export enum EActivateGroupType {
  joinGroupChat = 'joinGroupChat',
  createGroupChat = 'createGroupChat',
  singleGroupChat = 'singleGroupChat'
}

export enum EAccountStatus {
  online = '在线',
  offline = '离线'
}

export enum ESiteShowLocationType {
  full = 'full',
  lower_right = 'lower_right'
}

export enum ESitePopupType {
  passive = 0,
  active = 1
}
export enum ESiteStatus {
  create = 'create',
  update = 'update',
  delete = 'delete'
}
