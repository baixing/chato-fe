import type {
  IAppletAuthParams,
  IAppletAuthRes,
  IApplicationFormData,
  IBrandDomainType,
  ICreateAccountCode,
  ICreateAccountEmpowerRes,
  ICreateAccountParams,
  ICreateGroupRes,
  ICreateSingleChatAPI,
  IDingDingPublicFormType,
  IFeishuPublicSerachRes,
  IFeishuSwitchConfigType,
  IFeishuiPublicFormType,
  IGroupList,
  IJoinGroupChatAPI,
  ISettingBroadcastType,
  ISingelGroupList,
  IUpdateGroupDetail,
  IWeixinConfigType
} from '@/interface/release'
import request from '@/utils/request'

// 创建账号-验证码校验
export function createGroupVerificationCodeAPI(data: ICreateAccountCode) {
  return request<ICreateGroupRes>({
    method: 'post',
    url: `/chato/weixin_group/account/verify_code`,
    data
  })
}

// 创建新群
export function createGroupAPI(domainId: number, data: IJoinGroupChatAPI) {
  return request<ICreateGroupRes>({
    method: 'post',
    url: `/chato/weixin_group/${domainId}/create`,
    data
  })
}

// 编辑群聊
export function editGroupAPI(domainId: number, data: IUpdateGroupDetail) {
  return request({
    method: 'post',
    url: `/chato/weixin_group/${domainId}/update/v2`,
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
export function getAccountQrCode() {
  return request({
    method: 'post',
    url: '/chato/weixin_group/account/login'
    // data: { hook_type }
  })
}

// 创建账号-查询绑定状态
export function getAccountBindingStatus(data: ICreateAccountParams) {
  return request<ICreateAccountEmpowerRes>({
    method: 'post',
    url: `/chato/weixin_group/account/status`,
    data
  })
}

// 账号重启
export function postAccountRestartAPI(data: { hosting_id: string }) {
  return request({
    method: 'post',
    url: '/chato/weixin_group/account/reboot',
    data
  })
}

export function postCheckAPI(data: { hosting_id: string }) {
  return request({
    method: 'post',
    url: '/chato/weixin_group/account/verify_account',
    data
  })
}

// 账号下线
export function postAccountOfflineAPI(data: { hosting_id: string }) {
  return request({
    method: 'post',
    url: '/chato/weixin_group/account/logout',
    data
  })
}

// 退出群
export function deleteGroupChatAPI(roomId: string) {
  return request({
    method: 'delete',
    url: `/chato/weixin_group/remove/group/${roomId}`
  })
}

// 微信小程序授权链接
export function postMiniAppAuthUrlAPI(data: IAppletAuthParams) {
  return request<string>({
    method: 'post',
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/get_auth_link`,
    data
  })
}

// 查询微信小程序授权状态
export function postMiniAppAuthStatusAPI(data: { domain_id: number | string }) {
  return request<IAppletAuthRes>({
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/get_by_domain`,
    data
  })
}

export function postTimeBroadcastAPI(data: ISettingBroadcastType) {
  return request({
    method: 'post',
    url: `/chato/api/v1/send_schedule/task`,
    data
  })
}

export function postMobileLimitFileAPI(domainId: number, file: string) {
  return request({
    method: 'post',
    url: `/chato/api/domains/${domainId}/mobile_limit/file`,
    data: { file }
  })
}

// ------群聊广播-------
export function patchTimeBroadcastAPI(data: ISettingBroadcastType) {
  return request({
    method: 'patch',
    url: `/chato/api/v1/send_schedule/task`,
    data
  })
}

export function createPosterAPI(data: { domain_id: number }) {
  return request({
    method: 'post',
    url: `/chato/api/get_poster`,
    data
  })
}
// -----------------
