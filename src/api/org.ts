import request from '@/utils/request'

export function getMyOrgs() {
  return request({
    url: `/chato/api/users/me/orgs`
  })
}
