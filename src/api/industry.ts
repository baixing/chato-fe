import type { IDomainInfo } from '@/interface/domain'
import request from '@/utils/request'

// 新用户引导-提交
export function saveFirstGuideAdditions(data: any) {
  return request({
    method: 'post',
    url: '/chato/api/v1/org/additions/save',
    data
  })
}

// 新用户引导-机器人推荐
export function getFirstGuideInterestDomains() {
  return request<IDomainInfo[]>({
    url: '/chato/api/v2/domains/interests'
  })
}
