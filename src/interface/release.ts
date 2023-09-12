import type { brandCreateEditStatusType, brandDomainStatusType } from '@/enum/domain'
import type { AfficialAccountStatusType, EFeishuConfigStatus } from '@/enum/release'
import type { UploadUserFile } from 'element-plus'
export interface PlatFormListProps {
  title: string
  icon: string
}

export interface ApplicationFormData {
  org_id: number
  org_user_id: number
  name: string
  company_name: string
  industry: string
}

export interface createAfficialAccountData {
  id: number
  app_id: string
  app_secret: string
  // reply_mode: AfficialAccountRepplyModeType
  s_status: AfficialAccountStatusType
}

export interface createAfficialAccountRes {
  id: number
  url: string
  ip_whitelist: string
  created: string
  modified: string
  app_id: string
  app_secret: string
  token: string
  s_status: AfficialAccountStatusType
  encoding_aes_key: string
  domain_slug: string
}

export interface createDeleteEditSitesData {
  id: number
  source: string
  status: string
}

export interface createSitesChannelsRes {
  created: string
  deleted: string
  domain_slug: string
  id: number
  modified: string
  source: string
  codeIframeHtml?: string
  codeContent?: string
}

export interface createSitesRes {
  channels: createSitesChannelsRes[]
}

export interface certificateParam {
  name: string
  url: string
}

export interface brandDomainType {
  id: number
  hostname?: string
  record?: string
  pub_key?: string | UploadUserFile | UploadUserFile[]
  pri_key?: string | UploadUserFile | UploadUserFile[]
  status?: brandCreateEditStatusType
  s_status?: brandDomainStatusType
  expired?: number
  memo?: string
}

export type brandDomainTypeKeyFile = brandDomainType & {
  pub_key: UploadUserFile
  pri_key: UploadUserFile
}
export interface createPublicStatus {
  is_done: boolean
}

export interface CreateGroupChatResponse {
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

export interface feishuiPublicFormType {
  app_id: string
  app_secret: string
  encrypt_key: string
  verification_token: string
  url?: string
}

export interface feishuiPublicFormRes {
  domain_slug: string
  status: EFeishuConfigStatus
  url: string
}

export interface feishuPublicSerachRes {
  domain_slug: string
  info?: feishuiPublicFormType
  ban?: boolean
}

export interface feishuSwitchConfigType {
  domain_slug: string
  app_id: string
  ban: boolean
}

export interface weixinConfigType {
  id?: number
  app_id?: string
  app_secret?: string
  s_status?: AfficialAccountStatusType
}

export interface weixinConfigListRes {
  app_id: number
  id: number
  app_secret: string
  created: string
  domain_slug: string
  encoding_aes_key: string
  ip_whitelist: any
  modified: string
  reply_mode: unknown
  s_status: AfficialAccountStatusType
  token: string
  type_def: string
  url: string
}

export interface patchChannelType {
  id?: number
  app_id?: string
  app_secret?: string
  s_status?: AfficialAccountStatusType
}

export interface weixinCreateConfigType {
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

export interface RobotQrCodeInfoProps {
  url?: string
  secret?: string
}
