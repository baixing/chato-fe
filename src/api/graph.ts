import request from '@/utils/request'

export function getCommonGraph<R, P extends object = object>(suffix: string, params?: P) {
  return request<R>({
    url: `/chato/api/v1/graph/${suffix}`,
    params: params ?? {}
  })
}
