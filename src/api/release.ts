import type { EChannelType, EQrCodeHookType } from '@/enum/release'
import type {
  IApplicationFormData,
  IGroupList,
  IBrandDomainType,
  IBrandDomainTypeKeyFile,
  ISingelGroupList,
  IFeishuPublicSerachRes,
  IFeishuSwitchConfigType,
  IFeishuiPublicFormType,
  IPatchChannelType,
  IWeixinConfigType,
  IDingDingPublicFormType,
  IJoinGroupChatAPI,
  ICreateSingleChatAPI,
  ICreateAccountParams,
  ICreateAccountEmpowerRes,
  ICreateGroupRes
} from '@/interface/release'
import request from '@/utils/request'

// 创建新群
export function createGroupAPI(domainId: number, data: IJoinGroupChatAPI) {
  return request<ICreateGroupRes>({
    method: 'post',
    url: `/chato/weixin_group/${domainId}/create`,
    data
  })
}

// 拉入已有群
export function joinGroupChatAPI(domainId: number, data: IJoinGroupChatAPI) {
  return request<ICreateGroupRes>({
    method: 'post',
    url: `/chato/weixin_group/v2/${domainId}/invite_by_user`,
    data
  })
}

// 创建单聊
export function createSingleChatAPI(data: ICreateSingleChatAPI) {
  return request<ICreateGroupRes>({
    method: 'post',
    url: `/chato/weixin_group/single_chat`,
    data
  })
}

// 转移群聊
export function transferGroupAPI(domainId: number, data) {
  return request({
    method: 'post',
    url: `/chato/weixin_group/${domainId}/update/v2`,
    data
  })
}

// 获取群聊
export function getGroupListAPI(domainId: number) {
  return request<IGroupList[]>({
    url: `/chato/weixin_group/v3/${domainId}/list`
  })
}

// 获取单聊
export function getSingleGroupListAPI(domainId: number) {
  return request<ISingelGroupList[]>({
    url: `/chato/weixin_group/single_chat/${domainId}`
  })
}

// 获取群聊图片
export function getGroupImgAPI(domainId: number, id: string) {
  return request({
    url: `/chato/weixin_group/${domainId}/refresh/${id}`
  })
}

// 行业列表
export function getIndustry() {
  return request({
    method: 'post',
    url: `/chato/api/v1/config/industry`
  })
}

// 空间保存
export function applicationFormSave(data: IApplicationFormData) {
  return request({
    method: 'post',
    url: `/chato/api/v1/org/release_applications/save`,
    data
  })
}

// 保存品牌域名
export function saveBrandDomain(domain_slug: string, data: IBrandDomainType) {
  return request({
    method: 'post',
    url: `/api/custom_host/${domain_slug}/save`,
    data
  })
}

export function getBrandDomain(domain_slug: string) {
  return request<IBrandDomainTypeKeyFile[]>({
    url: `/api/custom_host/${domain_slug}/get`
  })
}

// 查询飞书配置
export function getFeishuConfig(domain_slug: string) {
  return request<IFeishuPublicSerachRes>({
    method: 'post',
    url: '/chato/feishu/search',
    data: { domain_slug }
  })
}

// 配置飞书
export function postFeishuConfig(data: IFeishuiPublicFormType & { domain_slug: string }) {
  return request({
    method: 'post',
    url: '/chato/feishu/login',
    data: data
  })
}

// 飞书群聊开关
export function postSwitchFeishuConfig(data: IFeishuSwitchConfigType) {
  return request({
    method: 'post',
    url: '/chato/feishu/ban',
    data
  })
}

// 创建微信客服：app-id
export function postWeixinConfig(domain_slug: string, app_id: string) {
  return request({
    url: `/chato/api/v1/wechat_kf/url/${domain_slug}/${app_id}`
  })
}

// 创建微信客服：app-id、app-secret
export function patchWeixinConfig(domain_slug: string, data: IWeixinConfigType) {
  return request({
    method: 'post',
    url: `/chato/api/v1/wechat_kf/account/${domain_slug}`,
    data
  })
}

// 查询微信客服
export function getWeixinServiceConfig(domain_slug: string) {
  return request({
    url: `/chato/api/v1/wechat_kf/account/${domain_slug}`
  })
}

// 查询抖音
export function getTitokServiceConfig(domain_slug: string) {
  return request({
    url: `/chato/api/v1/douyin/authorization/${domain_slug}`
  })
}

// channel_get
export function getChannelType(channel_type: EChannelType, domain_slug: string) {
  return request({
    url: `/chato/api/v1/channel/${channel_type}/account/${domain_slug}`
  })
}

// channel_patch
export function patchChannelType(
  channel_type: EChannelType,
  domain_slug: string,
  data: IPatchChannelType
) {
  return request({
    method: 'patch',
    url: `/chato/api/v1/channel/${channel_type}/account/${domain_slug}`,
    data
  })
}

// 配置钉钉
export function postDingDingConfig(data: IDingDingPublicFormType, domain_slug) {
  return request({
    method: 'post',
    url: `/chato/api/v1/dingding/account/${domain_slug}`,
    data
  })
}

// 账号列表
export function serachAccountListAPI(orgId: number) {
  return request({
    url: `/chato/weixin_group/org/${orgId}/robots`
  })
}

// 创建账号-账号二维码
export function getAccountQrCode(hook_type: EQrCodeHookType) {
  return request({
    url: '/chato/weixin_group/open_hook_client',
    data: { hook_type }
  })
}

// 创建账号-查询绑定状态
export function getAccountBindingStatus(orgId: number, params: ICreateAccountParams) {
  return request<ICreateAccountEmpowerRes>({
    url: `/chato/weixin_group/${orgId}/online`,
    params
  })
}

// 账号重启
export function postAccountRestartAPI(params: { wx_host_user_id: string }) {
  return request({
    url: '/chato/weixin_group/restart/robot',
    params
  })
}

// 账号下线
export function postAccountOfflineAPI(params: { wx_host_user_id: string }) {
  return request({
    url: '/chato/weixin_group/shutdown/robot',
    params
  })
}

// 退出群
export function deleteGroupChatAPI(roomId: string) {
  return request({
    method: 'delete',
    url: `/chato/weixin_group/remove/group/${roomId}`
  })
}
