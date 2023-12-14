import type { IDemonstration, IDomainInfo, IDomainLLMConfig } from '@/interface/domain'
import type { ITTSListApi, ITimbreAuditionApi } from '@/interface/tts'
import request from '@/utils/request'

export function getDomainsByOrgId(orgId) {
  // return Promise.reject({ response: { status: 403 } })
  // return Promise.resolve({ data: {} })
  // return Promise.resolve({ data: dataDomains })

  return request({
    url: `/chato/api/orgs/${orgId}/domains`
  })
}

export function getDomainDetailPublic(domainSlug) {
  return request({
    url: `/chato/api-public/domains/${domainSlug}`
  })
}

export function getDomainDetail(domainId) {
  return request<IDomainInfo>({
    url: `/chato/api/domains/${domainId}`
  })
}
export const updateDomain = (domainId: string | number, data) => {
  return request<IDomainInfo | string[]>({
    method: 'patch',
    url: `/chato/api/domains/${domainId}`,
    data: {
      ...data,
      avatar:
        data.avatar ||
        'https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato_image/avater/932c581b16b6c2c07368d3e15c533888.jpg'
    }
  })
}

// 获取 C 端机器人额度
export function getDomainQuotaInPlatformC(domain_slug: string) {
  return request({
    method: 'get',
    url: `/chato/api/user/quota/get`,
    data: { domain_slug }
  })
}

// 更新机器人在资源广场显示或隐藏
export const updateDomainInResource = (domainId: string | number, data: any) => {
  return request<IDomainInfo>({
    method: 'patch',
    url: `/chato/api/v1/domains/${domainId}/in_resource`,
    data
  })
}

export const cloneDomainRobot = (domainId: string, data: { is_need_document: 0 | 1 }) => {
  return request({
    method: 'post',
    url: `/chato/api/v2/domains/clone_domain/${domainId}`,
    data
  })
}

export const getSystemPromptLimit = (data) => {
  return request<{ system_prompt_max_token: number }>({
    method: 'post',
    url: `/api/token/calc`,
    data
  })
}

export const generateDomainCorrectTicket = (slug: string) => {
  return request<string>({
    method: 'get',
    url: `/chato/api/v1/domains/gen_qa_modifiable_ticket`,
    data: { slug }
  })
}

export const checkDomainCorrectTicketIsExpired = (data) => {
  return request<boolean>({
    method: 'get',
    url: `/chato/api/v1/domains/check_qa_modifiable_ticket`,
    data
  })
}

export const createDraftDomain = () => {
  return request<IDomainInfo>({
    method: 'post',
    url: `chato/api/v1/domains/create_draft`
  })
}

export const domainLLMConfigAPI = () => {
  return request<IDomainLLMConfig[]>({
    url: `/chato/api/v1/config/llm`
  })
}

export const getTimbreList = () => {
  return request<ITTSListApi>({
    url: `/api/tts/timbre`
  })
}

export const getTestTimbreUrl = (timbre: String) => {
  return request<{ contentList: ITimbreAuditionApi[] }>({
    url: `/api/tts/audition`,
    data: {
      timbre
    }
  })
}

export const updateBotUseScope = (domain_id: number, use_scope: 0 | 1) => {
  return request({
    url: `/chato/api/domains/${domain_id}/use_scope`,
    method: 'PATCH',
    data: {
      use_scope
    }
  })
}

// 校验domain_id 是否在当前空间 ICheckDomainIdResult
export function checkDomainIdAPI(domainId: string) {
  return request({
    url: `/chato/api/v1/user/check_and_get_current_token`,
    params: { domain_id: domainId }
  })
}

export function getDomainCategoryList() {
  return request<string[]>({
    method: 'get',
    url: `/chato/api/v1/config/category`
  })
}

export function getDemonstration(type: string) {
  return request<IDemonstration>({
    method: 'get',
    url: `/chato/api/document_management/demonstration?domain_type=${type}`
  })
}

export function getAppletLink(slug: string) {
  return request({
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/${slug}}/link`
  })
}

export function getAppletLink2(slug: string) {
  return request({
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/${slug}}/link2`
  })
}

export function getAppletQRCode(slug: string) {
  return request({
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/${slug}}/QRCode`
  })
}

export function getAppletQRCode2(slug: string) {
  return request({
    url: `/chato/api/v1/publish_channels/wechat/mini_prog/${slug}}/QRCode2`
  })
}
