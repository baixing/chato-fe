import request from '@/utils/request'

export function getABTestConfig(uid: string) {
  return request({
    method: 'post',
    url: `/chato/ab_test/get`,
    data: { uid },
    timeout: 1_000
  })
}
