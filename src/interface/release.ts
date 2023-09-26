import type { EBrandCreateEditStatusType, EBrandDomainStatusType } from '@/enum/domain'
import type { EAfficialAccountStatusType } from '@/enum/release'
import type { UploadUserFile } from 'element-plus'

export interface IApplicationFormData {
  org_id: number
  org_user_id: number
  name: string
  company_name: string
  industry: string
}

export interface ICreateAfficialAccountData {
  id: number
  app_id: string
  app_secret: string
  s_status: EAfficialAccountStatusType
}

export interface ICeateAfficialAccountRes {
  id: number
  url: string
  ip_whitelist: string
  created: string
  modified: string
  app_id: string
  app_secret: string
  token: string
  s_status: EAfficialAccountStatusType
  encoding_aes_key: string
  domain_slug: string
}

export interface ICreateDeleteEditSitesData {
  id: number
  source: string
  status: string
}

export interface ICreateSitesChannelsRes {
  created: string
  deleted: string
  domain_slug: string
  id: number
  modified: string
  source: string
  codeIframeHtml?: string
  codeContent?: string
}

export interface ICreateSitesRes {
  channels: ICreateSitesChannelsRes[]
}

export interface IBrandDomainType {
  id: number
  hostname?: string
  record?: string
  pub_key?: string | UploadUserFile | UploadUserFile[]
  pri_key?: string | UploadUserFile | UploadUserFile[]
  status?: EBrandCreateEditStatusType
  s_status?: EBrandDomainStatusType
  expired?: number
  memo?: string
}

export type IBrandDomainTypeKeyFile = IBrandDomainType & {
  pub_key: UploadUserFile
  pri_key: UploadUserFile
}

export interface ICreatePublicStatus {
  is_done: boolean
}

export interface ICreateGroupChatResponse {
  created_at: string
  domain_id: string
  has_admin: boolean
  host_robot_wx_id: string
  id: number
  invite_img_url: string
  name: string
  new_user_msg: string
  org_id: string
  owner_phone_number: string
  prompt: string
  pull_robot_wx_id: string
  response_type: number
  robot_nickname: string
  room_id: string
  updated_at: string
}

export interface IFeishuiPublicFormType {
  app_id: string
  app_secret: string
  encrypt_key: string
  verification_token: string
  url?: string
}

export interface IFeishuPublicSerachRes {
  domain_slug: string
  info?: IFeishuiPublicFormType
  ban?: boolean
}

export interface IFeishuSwitchConfigType {
  domain_slug: string
  app_id: string
  ban: boolean
}

export interface IWeixinConfigType {
  id?: number
  app_id?: string
  app_secret?: string
  s_status?: EAfficialAccountStatusType
}

export interface IWeixinConfigListRes {
  app_id: number
  id: number
  app_secret: string
  created: string
  domain_slug: string
  encoding_aes_key: string
  ip_whitelist: any
  modified: string
  reply_mode: unknown
  s_status: EAfficialAccountStatusType
  token: string
  type_def: string
  url: string
}

export interface IPatchChannelType {
  id?: number
  app_id?: string
  app_secret?: string
  s_status?: EAfficialAccountStatusType
}

export interface IWeixinCreateConfigType {
  name: string
  robot_response_type?: string
  new_user_in_group_msg?: string
  robot_nickname?: string
  endpoint?: string
  extra?: string
  base64_data?: string
  weixinName?: string
  slug?: string
  id?: number
}

export interface IRobotQrCodeInfoProps {
  url?: string
  secret?: string
}

export interface IDingDingPublicFormType {
  app_id: string
  app_secret: string
  s_status?: EAfficialAccountStatusType
  url?: string
}
