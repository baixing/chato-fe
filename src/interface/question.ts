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
  domain_id: string | number
}

export interface IUserChat {
  sender_uid: string
  avatar: string // 微信头像
  nickname: string
  source: string // 渠道来源
  tag: string // 企微 tag
  modified: string // 最后一次聊天时间
  last_msg: string
  new_count: number // 新消息数量
}
