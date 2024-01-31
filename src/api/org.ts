import request from '@/utils/request'

export function getMyOrgs() {
  // return Promise.resolve({ data: {} })
  // return Promise.resolve({ data: dataMyOrgs })

  return request({
    url: `/chato/api/users/me/orgs`
  })
}
