import type { IDemonstration, IDomainInfo } from '@/interface/domain'
import type { ITimbreAuditionApi } from '@/interface/tts'
import request from '@/utils/request'

export function getDomainDetailPublic(domainSlug) {
  return request({
    url: `/chato/api-public/domains/${domainSlug}`
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

export const getTestTimbreUrl = (timbre: String) => {
  return request<{ contentList: ITimbreAuditionApi[] }>({
    url: `/api/tts/audition`,
    data: {
      timbre
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

export function getDomainReplySwitch(domain_id: IDomainInfo['id'], sender_uid: string) {
  return request({
    method: 'get',
    url: `/chato/api/v2/domains/human_reply_switch`,
    data: { domain_id, sender_uid }
  })
}

export function updateDomainReplySwitch(data: {
  sender_uid: string
  domain_id: IDomainInfo['id']
  human_reply_switch: IDomainInfo['human_reply_switch']
}) {
  return request({
    method: 'post',
    url: `/chato/api/v2/domains/human_reply_switch`,
    data
  })
}
