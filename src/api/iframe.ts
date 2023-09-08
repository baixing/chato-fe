import type { ICreateDeleteEditSitesData, ICreateSitesRes } from '@/interface/release'
import request from '@/utils/request'

export function createDeleteEditSites(domain_slug: string, data: ICreateDeleteEditSitesData) {
  return request({
    method: 'post',
    url: `/chato/api/share_channel/${domain_slug}/save`,
    data
  })
}

export function getCreateSites(domain_slug: string) {
  return request<ICreateSitesRes>({
    url: `/chato/api/share_channel/${domain_slug}/get`
  })
}
