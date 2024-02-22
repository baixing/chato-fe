import type { ITemplateList } from '@/interface/template'
import type { IOrgUserList, IParamsToken, IToken } from '@/interface/user'
import request from '@/utils/request'

export function getUsersByOrgId(orgId) {
  return request({
    url: `/chato/api/orgs/${orgId}/users`
  })
}

export function inviteMembers(orgId, mobiles) {
  return request({
    method: 'post',
    url: `/chato/api/orgs/${orgId}/invite`,
    data: {
      mobiles
    }
  })
}

// 获取所有当前用户所在组织/空间信息
export function getOrgUserList() {
  return request<IOrgUserList>({
    method: 'get',
    url: `/chato/api/v1/user/org_user/list`
  })
}

// 获取制定组织/空间token
export function getOrgUserToken(params: IParamsToken) {
  return request<IToken>({
    method: 'get',
    url: `/chato/api/v1/user/auth/token`,
    params
  })
}

// 机器人模板列表
export function getTemplateList() {
  return request<ITemplateList[]>({
    method: 'get',
    url: `/chato/api/v2/domains/template/list`
  })
}

// 创建机器人
export function createDomain(id) {
  return request({
    method: 'post',
    url: `/chato/api/v1/domains/create_by_template?template_id=${id}`
  })
}

// 创建机器人
export function createDomainV2(id) {
  return request({
    method: 'post',
    url: `/chato/api/v2/domains/create_by_template?template_id=${id}`
  })
}

// 创建机器人 - By AI
export function createDomainByAI(data) {
  return request({
    method: 'post',
    url: `chato/api/v2/domains/create_by_ai`,
    data
  })
}
