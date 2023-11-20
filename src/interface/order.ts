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
  trustee_account_num: number
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

export interface IUserSettingOrderPayment {
  price: number
  total_quota: number
  duration: number
}

export interface ICUserBuyProductionParams {
  package_id: number
  customer_uuid: string
  biz_id?: number
  pay_type: 0 | 2 | 3
}

export interface ICUserPackageDetail {
  created: string
  domain_slug: string
  duration: number
  id: number
  price: number
  status: string
  total_quota: number
}

export interface ICUserBuyProductionDetail {
  biz_id: number
  consumed: number
  created: string
  domain_slug: string
  from_time: string
  id: number
  remark: string
  status: string
  to_time: string
  total: number
  user_uuid: string
  package: ICUserPackageDetail
}

export interface IJSAPISignParams {
  appId: string
  timeStamp: number
  signType: string
  nonceStr: string
  package: string
  paySign: string
}

export interface IJSAPISignRes {
  data: {
    app_id: string
    timestamp: string
    nonce_str: string
    package: string
  }
  sign_str: string
}
