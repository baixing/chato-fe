import type { ESpaceCommercialType } from '@/enum/space'
import type { EAllRole } from '@/enum/user'
import type { EUserOriganizationRole } from '@/enum/userInformation'
import type { IDomainInfo } from './domain'

export interface IOrg {
  id: number
  created: string
  modified: string
  name: string
  short_name: string | null
  slug: string | null
  avatar: string
  qywx_corp_id: string | null
  visible: number
  type: ESpaceCommercialType
  owner_id: number
  space_max_capacity: number
  space_real_capacity: number
  additions: boolean | null
}

export interface IUserInfo {
  id: number
  eid: string
  consume_total: number
  created: string
  modified: string
  nickname: string
  avatar: string
  mobile: string
  delete: string | null
  wx_union_id: string
  qywx_union_id: string
  qywx_corp_id: string
  org: IOrg
  role: EAllRole
  status: string
  channel: string
  unified_user_id: string
  token: string
}

export interface IUserIdentity {
  organization_type?: EUserOriganizationRole
  surname?: string
  company?: string
}

export interface IOrgUserList {
  all: IUserInfo[]
  current: IUserInfo
}

export interface IToken {
  auth_token: string
  domains: IDomainInfo[]
  user_info: IUserInfo
}

export interface IParamsToken {
  org_user_id: number
}
