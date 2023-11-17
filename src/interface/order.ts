import type { EOrderPackageType, EOrderPaymentStatus } from '@/enum/order'
import type { ESpaceCommercialType } from '@/enum/space'
import type { IOrg, IUserInfo } from './user'

export interface IOrderPackage {
  id: number
  created: string
  modified: string
  name: string
  desc: ESpaceCommercialType
  type: EOrderPackageType
  quota: number
  domain_num: number
  account_num: number
  wx_group_num: number
  days: number
  origin_price: number
  sale_price: number
  ad: number
  brand: number
  dns: number
  image_quota: number
  single_chat_flag: number
  custom_host_cnt: number
}

export interface IOrderPaymentCode {
  payment_code_url: string
  payment_qr_code: string
  order_id: number
}

export interface IOrderPaymentStatus {
  id: number
  created: string
  modified: string
  user_id: IUserInfo
  org_id: IOrg
  package_id: IOrderPackage
  origin_price: number
  sale_price: number
  payment_price: number
  status: EOrderPaymentStatus
  paid_time: string
  deleted: number
}
