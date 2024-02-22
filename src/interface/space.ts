import type { ESettingSpaceRole, ESpaceCommercialType } from '@/enum/space'

export interface ISpaceRights {
  quota: number
  days: number
  domain_num: number
  account_num: number
  wx_group_num: number
  trustee_account_num: number
  ad: boolean // 是否可配置对话广告
  brand: boolean // 是否可配置品牌广告
  dns: boolean // 是否可配置品牌域名
  type: ESpaceCommercialType // 空间权益
}

export interface ISpaceQuota {
  total: number
  consumed: number
}

export interface ISpaceRole {
  role: ESettingSpaceRole
}

export interface IGetInviteInfo {
  eid: string
}

export interface IRemoveMemeber {
  org_user_id: number | string
}

export interface IAddMemeberRole {
  invite_ticket: string
}

export interface ISpaceRightsSummaryItem {
  consumed: number
  total: number
}

export interface ISpaceRightsSummary {
  quota: ISpaceRightsSummaryItem
  wx_group_num: ISpaceRightsSummaryItem
  domain_num: ISpaceRightsSummaryItem
  account_num: ISpaceRightsSummaryItem
  image_quota: ISpaceRightsSummaryItem
  expire_time: string
  type: ESpaceCommercialType
}
