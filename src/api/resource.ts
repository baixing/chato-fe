import type { IResourceList } from '@/interface/resource'
import request from '@/utils/request'

// 获取全部对话-B端
export function getResourceB() {
  return request<IResourceList[]>({
    method: 'get',
    url: '/chato/api/v1/domains/public_domain/all'
  })
}

// 获取全部对话-C端
export function getResourceC() {
  return request<IResourceList[]>({
    method: 'get',
    url: '/chato/api/v1/domains/public_domain'
  })
}
