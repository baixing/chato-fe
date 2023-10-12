import type {
  GetFilesByDomainIdType,
  IDocumentList,
  RetryFileMateType
} from '@/interface/knowledge'
import request from '@/utils/request'

const PAGE_SIZE = 10

export function getFilesByDomainId(domainId: string | number, params: GetFilesByDomainIdType) {
  return request<IDocumentList[]>({
    url: `/chato/api/domains/${domainId}/files`,
    params: {
      page_size: PAGE_SIZE,
      ...params
    }
  })
}

// 删除文件
export function deleteFile(fileId) {
  return request({
    method: 'delete',
    url: `/chato/api/files/${fileId}`
  })
}

//批量删除文件
export function deleteRetryFileMate(domainId: string | number, data: RetryFileMateType) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domainId}/batch_update`,
    data
  })
}

// 录入文本
export function uploadText(domainId, params) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domainId}/text`,
    data: params
  })
}

// 录入问答
export function uploadQa(domainSlug, params) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domainSlug}/qa/text`,
    data: params
  })
}

// 图片上传
export function uploadImage(params) {
  return request({
    method: 'post',
    url: `/chato/api/file/upload/file`,
    data: params
  })
}

// 网页爬取
export function uploadURL(domain_id, params) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domain_id}/spider/url/save`,
    data: params
  })
}

// 公众号爬取
export function uploadPublic(domain_id, params) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domain_id}/spider/wx-public/save`,
    data: params
  })
}
