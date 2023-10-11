import type { IDomainInfo } from '@/interface/domain'
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
    data
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
