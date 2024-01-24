import request from '@/utils/request'

export function getCommonGraph<R, P extends Record<string, unknown> = Record<string, unknown>>(
  suffix: string,
  params?: P
) {
  return request<R>({
    url: `/chato/api/v1/graph/${suffix}`,
    params: params ?? {}
  })
}

export function postCommonGraph<R, P extends Record<string, unknown> = Record<string, unknown>>(
  suffix: string,
  data?: P
) {
  return request<R>({
    url: `/chato/api/v1/graph/${suffix}`,
    method: 'POST',
    data: data ?? {}
  })
}
