import type {
  DeleteRetryFileMateStatusType,
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
