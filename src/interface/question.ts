import type { IChatCommonParams } from './chat'

export interface IQuestionFilter {
  domainId: string | number
  source: string
  evaluation?: string
  page?: number
  page_size?: number
  begin_time?: string
  end_time?: string
  mid_question_id?: string | number
  keyword?: string
}

export interface IRecommendQuestion {
  question: string
}

export interface IRecommendQuestionParams extends IChatCommonParams {
  question: string
}

export interface IUserChatMessageFilter {
  domainId: string | number
}

export interface IUserChatMessage {
  id: string // 获取用户对话的 id
  avatar: string // 微信头像
  nickname: string // 微信昵称
  source: string // 渠道来源
  tag: string // 企微 tag
  last_chat_time: string // 最后一次聊天时间
}
