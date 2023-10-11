import type {
  EMessageActionType,
  EMessageDisplayType,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'

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
