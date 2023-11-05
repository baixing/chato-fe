export const enum EDomainType {
  document = 1,
  role = 2
}

export const enum EDomainStatus {
  able = 0, // 正常
  disable = 1, // 被禁用
  temporaryDraft = 2, // 临时草稿
  draft = 3 // 草稿
}

export enum EBrandDomainStatusType {
  normal = 'normal',
  refuse = 'refuse',
  pending = 'pending',
  offline = 'offline'
}

export enum EBrandCreateEditStatusType {
  create = 'create',
  update = 'update'
}

export const enum EDomainAIGenerateType {
  intro = '简介',
  role = '角色设定',
  welcome = '欢迎语'
}

export const enum EDomainConversationMode {
  text = 'text',
  audio = 'audio',
  video = 'video'
}

export const enum EDomainConversationModeArousalMethod {
  ActiveTrigger = 0, //主动触发
  AutomaticSpeechRecognition = 1 //自动识别
}
