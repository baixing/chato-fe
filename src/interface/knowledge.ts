import type {
  DeleteRetryFileMateStatusType,
  EDocConvertCheckStatus,
  EDocConvertOrDisuse,
  EDocumentOperateType,
  EKnowledgeBusinessType,
  LearningStatesPerformanceType
} from '@/enum/knowledge'
import type { IDomainInfo } from './domain'
import type { IUserInfo } from './user'

export interface IDocumentForm {
  title?: string
  content_html?: string
  id?: number
  status?: EDocumentOperateType
}

export interface IDocumentList {
  id: number
  created: string
  modified: string
  type: string
  title: string
  domain: IDomainInfo
  status: LearningStatesPerformanceType
  refresh_switch: number // 定时刷新
  raw_size: number
  raw_file_url: string
  raw_file_hash: string
  content_html: any
  processed_file_url: string
  creator: IUserInfo
  updater: IUserInfo
  business_type: string
  template: string
  image: string
  images?: string[]
  qa_status?: 0 | 1
}

export interface IQAForm {
  title?: string
  content?: string
  id?: number
  image?: string
  images?: string[]
  question_id?: number
  modalType?: EDocumentOperateType
  status?: EDocumentOperateType
}

export interface GetFilesByDomainIdType {
  page: number
  page_size?: number
  business_type?: EKnowledgeBusinessType
  status?: LearningStatesPerformanceType
  keyword?: string
}
export interface RetryFileMateType {
  status: DeleteRetryFileMateStatusType
  ids: number[]
}

export interface IRelatedKnowledgeBase {
  id: IDomainInfo['id']
  name: IDomainInfo['name']
  related: number
}

export interface IKnowledgeShared {
  id: number
  receiver_domain_id: number
  sender_domain_id: number
}

export interface IWXPublic {
  fakeid: string
  nickname: string
  alias: string
  round_head_img: string
  service_type: number
  signature: string
}

export interface IQuestionConvertQAForm {
  qa_id: number
  is_all: boolean
  status: EDocConvertOrDisuse
  domain_slug: string
}

export interface IQuestionConvertQASource {
  id: string
  score: number
  document_name: string
  content: string
}

export interface IQuestionConvertQAList {
  id: number
  question: string
  answer: string
  file_id: number
  status: EDocConvertCheckStatus
  ref_source: IQuestionConvertQASource[]
}

export interface IDocmentToQAParams {
  file_ids: (number | string)[]
  short_doc_count: number
  short_doc_txt: number
  long_doc_count: number
  long_doc_txt: number
  prompt?: string
}

export interface IKnowledgeSharedParams {
  sender_domain_id: number
  receiver_domain_id: number
  sender_user_id: number
  receiver_user_id: number
}
