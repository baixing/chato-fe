import type { EBrandCreateEditStatusType, EBrandDomainStatusType } from '@/enum/domain'
import type {
  EAfficialAccountStatusType,
  ESitePopupType,
  ESiteShowLocationType
} from '@/enum/release'
import type { UploadUserFile } from 'element-plus'
import type { IDomainInfo } from './domain'

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

export interface ISaveSitesParams {
  id: number
  source: string
  popup: number
  popup_frequency: number
  show_bubble: number
  show_location: ESiteShowLocationType
  suspend_style: string
  suspend_style_color: string
  status: string
}

export interface ICreateSitesChannelsRes {
  created: string
  deleted: string
  domain_slug: string
  id: number
  modified: string
  source: string
  show_location: ESiteShowLocationType
  show_bubble: number
  popup_frequency: number
  popup: ESitePopupType
  codeIframeHtml?: string
  codeContent?: string
  suspend_style?: string
  suspend_style_color?: string
}

export interface ICreateSitesRes {
  channels: ICreateSitesChannelsRes[]
}

export interface ISerachSitesRes extends ICreateSitesChannelsRes {
  suspend_style: string
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

export interface IAccountList {
  additions: { avatar: string; company_name: string; name: string }
  created: string
  default_domain_slug: string
  deleted: number | null
  hosting_id: string
  id: number
  org_id: number
  platform: number
  status: number
  wx_user_id?: number
  name?: string
}

export interface IGroupList {
  created: string
  id: number
  deleted: string | null
  hosting_id: string
  group_qr_code_data: string
  title: string
  conversation_id: string
  conversation_type: number
  status: number
  domain_slug: string
  additions: { nickname: string; wellcome: string; response_type: number }
}

export interface ISingelGroupList {
  secret: string
  qrcode_data: string
  name: string
  corp_name: string
  status: string
  people_cnt: number
  token: string
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
  account?: string
}

export interface IDingDingPublicFormType {
  app_id: string
  app_secret: string
  s_status?: EAfficialAccountStatusType
  url?: string
}

export interface IJoinGroupChatAPI {
  name: string
  owner_phone_number: string
  custom_robot_wx_user_id: string
  robot_nickname: string
  new_user_msg: string
  robot_response_type: number
  endpoint: string
  domain_id: number
  org_id: number
}

export interface ICreateAccountCode {
  client_id: number
  qr_code_key: string
  code: string
}

export interface ICreateSingleChatAPI {
  robot_wx_user_id: string
  org_id: number
  domain_id: number
  new_user_msg: string
  endpoint: string
}

export interface ICreateGroupRes {
  qrcode_data: string
  room_id?: string
  secret?: string
}

export interface ICreateAccountRes {
  client_id: number
  qr_code: string
  qr_code_key: string
}

export interface ICreateAccountParams {
  qr_code_key: string
  default_domain_slug: string
}

export interface ICreateAccountEmpowerRes {
  is_online: boolean
  is_expired: boolean
  is_used: boolean
  login_status: number
}

export interface ISetSiteFormType {
  source: string
  popup_frequency: number
  popup: ESitePopupType
  show_location: ESiteShowLocationType
}

export interface IUpdateGroupDetail {
  id: number
  robot_nickname: string
  endpoint: string
  name: string
  response_type: string
  new_user_msg: string
}

export interface IAppletAuthParams {
  redirect_uri: string
  domain_id: string | number
}

export interface IAppletAuthRes {
  name: string
  qr_code: string
  domain: IDomainInfo
  status: string
  version: string
  app_id: string
  component_app_id: string
  error_msg: string
  response: string
  id: string
  created: string
  modified: string
}

export interface ISettingBroadcastAttachmentItem {
  url: string
  type: number
}

export interface ISettingBroadcastType {
  send_schedule_id: number
  domain?: number | string
  domain_id?: number | string
  receiver_id: string
  status: number
  channel: string
  trigger_time: string
  send_pattern: number
  content: string
  attachment: ISettingBroadcastAttachmentItem[]
}

export interface IGetBroadcastParams {
  domain: number | string
  receiver_id: string
}

export interface IMobileLimitItem {
  id: number
  mobile: string
  remark: string
}

export interface IAppletDomainCheckParams {
  file_url: string
  file_name: string
}
