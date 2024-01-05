import type { IDomainInfo } from './domain'

export interface IActivity {
  id: number
  name: string
  send_time: string
  total?: number
  additions: {
    wx_user_id: string
    wx_tag_ids: string[]
    wx_tags?: {
      id: string
      name: string
    }[]
    domain_id: number
    domain?: IDomainInfo
  }
}

export interface IActivityMessage {
  id: number
  content: string
  trigger_date: string
  additions: {
    user_name: string
    tag_names: string[]
  }
}

export interface IQwUserTag {
  name: string
  labelId: string
  superId: string
  type: number
  children: IQwUserTag[]
}
