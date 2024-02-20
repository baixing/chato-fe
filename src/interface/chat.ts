import type { EChatCitationSourceFileType } from '@/enum/chat'
import type {
  ChatHistoryParamsSource,
  EMessageEvalution,
  EMessageType,
  EWsMessageStatus
} from '@/enum/message'
import type { IDomainInfo } from './domain'
import type { IOrg, IUserInfo } from './user'
export interface ChatToBotRes {
  created: string
  type: EMessageType
  displayType: string
  id: number
  content: string
  ref_source_len?: number
  ref_source: string
  evaluation: EMessageEvalution | null
  question: string
  answer: string
  answer_deleted: boolean
  question_deleted: boolean
  answer_file_url: string
  client_ip: string
  dislike_count: number
  domain: IDomainInfo
  error_reason: string
  forbid_cost_time: number
  forbid_frequency: number
  forbid_keywords: string
  group_name: string
  is_answer_blocked: boolean
  is_question_blocked: boolean
  like_count: number
  modified: string
  org: IOrg
  owner_score: string
  question_engineered: string
  ref_file_ids: string
  robot: string
  sender: IUserInfo
  sender_uid: string
  seq: number
  service_provider_channel: string
  session_id: string
  source_id: string
  source: string
  status: EWsMessageStatus
  summary: string
  super_score: string
  time_to_answer_end: number
  time_to_answer_start: number
  x_request_id: string
  command: string[]
}

export interface HistoryMessages {
  question_id: string
  question: string
  answer: string
}

export interface ChatHistoryParams {
  page: number
  size: number
  org_id?: number
  domain_slug?: string
  source?: ChatHistoryParamsSource
  sender?: string
  sender_uid?: string
  begin_time?: string
  end_time?: string
}

export interface IChatCitationSource {
  content: string
  id: string
  score: number
  title: string
  file_type: EChatCitationSourceFileType
  url?: string
}

export interface IChatCommonParams {
  domain_slug: string
  token: string
  visitor_type: 'owner' | 'vistor' | 'chat'
}
