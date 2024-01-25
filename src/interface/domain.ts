import type {
  EDomainConversationMode,
  EDomainConversationModeArousalMethod,
  EDomainStatus,
  EDomainType
} from '@/enum/domain'
import type { EAllRole } from '@/enum/user'
import type { IOrg } from './user'

export interface IDomainCustomerLimit {
  mobile_limit_switch: number
  rate_limit_switch: number
  payment_limit_switch: number
  payment_limit: { total: number }
  rate_limit: {
    time_unit: number
    time_seconds: number
    num: number
    response: string
  }
  quota_limit_switch: number
  quota_limit: {
    total: number
    response: string
  }
  token_limit_switch: number
  token_limit: {
    token: string
    error_response: string
    correctness_response: string
  }
}

export interface IDomainInfoCreator {
  id: number
  nickname: string
  mobile: string
  org: number
  role: EAllRole
  status: string
  avatar: string
}

export interface IDomainInfo {
  id: number
  created: string
  modified: string
  name: string
  slug: string
  org: IOrg
  file_count: number
  system_prompt: string
  welcome: string
  creator: IDomainInfoCreator
  updater: number
  avatar: string
  avatar_show: boolean
  name_show: boolean
  human_reply_switch: number // CRM 字段，是否人工回复: 1 - 人工 | 0 - 机器人
  message_style: string
  suspend_style: string
  whitelist_sites: string
  creator_id?: number
  lang: string
  reply_tone: string
  reply_length: number
  temperature: number
  doc_threshold: number
  qa_threshold: number
  not_embedding_return_enabled: 0 | 1
  not_embedding_return_content: string
  customer_limit: Partial<IDomainCustomerLimit>
  shortcuts: string
  desc: string
  desc_show: number
  type: EDomainType
  deleted: string
  status: EDomainStatus
  visible: number // 是否在资源广场展示: 1 是 0 否
  use_scope: 0 | 1 // 可以访问 0 管理员和创建者 1 所有人
  template: number // 是否为模板: 1 是 0 否
  question_max_length: number
  system_prompt_max_length: number
  brand_name: string
  brand_logo: string
  ad_content: string
  ad_frequency: number
  ad_show: number
  category: string
  token: string
  llm: string | null
  top_k: number
  keyword_block: string[]
  keyword_block_reply: string
  keyword_block_show: boolean
  conversation_mode: EDomainConversationMode // 机器人对话类型
  brand_show: number
  qa_modifiable: number
  question_ref_source_show: number
  name_and_avatar_show: number
  is_session_effective: number
  show_recommend_question: number // 问题推荐
  conversation_mode_meta?: string
  conversation_arouse_mode?: EDomainConversationModeArousalMethod
  toc_privacy: number
  task_progress?: [
    basicInformation: 0 | number,
    knowledge: 0 | number,
    moreInformation: 0 | number,
    publish: 0 | number,
    receiveMessages: 0 | number
  ]
}

export interface IDomainShortcut {
  title: string
  response: string
  images: string[]
  image: string
}

export interface IDomainDetail {
  customer_limit: {
    rate_limit_switch: boolean
    mobile_limit_switch: boolean
    rate_limit: {
      time_seconds: number
      num: number
      response: string
    }
    quota_limit_switch: boolean
    quota_limit: {
      total: number
      response: string
    }
  }
  show: {
    ad_show: boolean
    name_and_avatar_show: boolean
    desc_show: boolean
    question_ref_source_show: boolean
    suspend_style: string
    suspend_style_color: string
    message_style: string
    qa_modifiable: boolean
  }
  domain: IDomainInfo
  shortcuts: IDomainShortcut[]
}

export interface IDomainLLMConfig {
  name: string
  type: string
  consume_quota: number
  need_vip: boolean
}

export interface IDemonstration {
  file_url: string
  text: string
  web_url: string
  wx_public_url: string
}
