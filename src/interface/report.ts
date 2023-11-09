import type { IDomainInfo } from '@/interface/domain'

export interface IFormCollectSelect {
  created: string
  creator: any
  deleted: boolean
  domain: IDomainInfo
  fields: any[]
  id: number
  modified: string
  schema: any
  status: number
  title: string
}

export interface IFormCollectDetailList {
  created: string
  deleted: boolean
  field_1: string
  field_2: string
  field_3: string
  field_4: string
  field_5: string
  form: IFormCollectSelect
  id: number
  modified: string
  sender_uid: string
  channel: string
}
