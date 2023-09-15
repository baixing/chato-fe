import type { EDomainConversationMode } from '@/enum/domain'
import type {
  EMessageActionType,
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import type { IOrg } from './user'

export interface IMessageItem {
  type?: EMessageType
  displayType: EMessageDisplayType
  id: string
  content?: string
  ref_source_len?: number
  questionId?: number
  evaluation?: EMessageEvalution | null
  question?: string
  first?: boolean
  isWelcome?: boolean
  isLoading?: boolean
  status?: EWsMessageStatus
  msg_id?: string
  translate?: string | null
  progress?: number
  command?: string[]
}

export interface IMessageShortcut {
  image: string
  response: string
  title: string
}

export interface IMessageDetail {
  avatar: string
  avatar_show: boolean
  created: string
  creator: number
  customer_limit: string
  desc: string
  desc_show: number
  file_count: number
  id: number
  lang: string
  message_style: string
  message_style_color: string
  modified: string
  name: string
  name_show: boolean
  org: IOrg
  question_max_length: number
  question_ref_source_show: number
  reply_length: number
  reply_tone: string
  shortcuts: IMessageShortcut[]
  slug: string
  status: number
  suspend_style: string
  system_prompt: string
  temperature: number
  type: number
  updater: number
  visible: number
  welcome: string
  whitelist_sites: string
  brand_logo: string
  brand_name: string
  brand_show: boolean
  qa_modifiable: boolean
  conversation_mode: EDomainConversationMode // 机器人对话类型
}

export interface IMessageCurrentSetting {
  questionId: number
  displayType?: EMessageDisplayType
  left?: string | number
  right?: string | number
}

export interface IMessageMoreControl {
  [EMessageActionType.like]?: boolean // 赞
  [EMessageActionType.dislike]?: boolean // 踩
  [EMessageActionType.fix]?: boolean // 修正
  [EMessageActionType.copy]?: boolean // 复制
  [EMessageActionType.delete]?: boolean // 删除
  [EMessageActionType.translate]?: boolean // 翻译
  [EMessageActionType.expand]?: boolean // 拓展
  [EMessageActionType.retry]?: boolean // 重试
}
