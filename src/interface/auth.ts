import type { ELoginEmpowerStatus } from '@/enum/auth'
import type { EWeixinH5LoginType } from '@/enum/order'

export interface ILoginParams {
  mobile: string
  verification_code: string
  channel: string
  bd_vid: string
  bd_keyword: string
  dy_clickid: string
  nickname?: string
  eid?: string
  external_user_id?: number
}

export interface ILoginQRCodeResult {
  session: string
  url: string
}

export interface ILoginQRCodeSerachParams {
  session: string
}

export interface ILoginQRCodeEmpowerResult {
  status: ELoginEmpowerStatus
  external_user_id: string
  token: string | null
}

export interface ILoginMobile {
  mobile: string
  code: string
  channelType: string
  channel: string
}

export interface IChatCheckMobileRes {
  login: boolean
  usable: boolean
}

export interface IH5LoginAuthParams {
  redirect_uri: string
  appid: string
}

export interface IWeixinH5LoginParams {
  code: string
  app_id: string
  type: EWeixinH5LoginType
}

export interface IWeixinH5LoginRes {
  need_bind_mobile: boolean
  token: string
  external_user_id: number
}
