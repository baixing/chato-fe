import type {
  GetFilesByDomainIdType,
  IDocumentList,
  IKnowledgeShared,
  IQuestionConvertQAForm,
  IWXPublic,
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
  return request<{ title: string; url: string }[]>({
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

// 公众号异步爬取，秒返回
export function uploadPublicAsync(domain_id, data, params) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domain_id}/spider/wx-public/async`,
    data: data,
    params: params
  })
}

// 获取知识库关联列表
export function getKnowledgeSharedList(data: any) {
  return request<IKnowledgeShared[]>({
    method: 'get',
    url: `/chato/api/v1/graph/knowledge_shared`,
    data
  })
}

// 更新知识库关联状态
export function updateKnowledgeSharedStatus(data: any) {
  return request({
    method: 'post',
    url: `/api/knowledge/share`,
    data
  })
}

//获取公众号list
export function getWXPublicList(data: { name: string }) {
  return request<IWXPublic[]>({
    method: 'get',
    url: `/chato/api/document_management/search_wx_public`,
    data
  })
}

//获取公众号 count数量
export function getWXPublicCount(data: { name: string }) {
  return request<string>({
    method: 'get',
    url: `/chato/api/document_management/get_wx_public_count`,
    data
  })
}

//获取公众号 count进度
export function getWXPublicLearnCount(domain_id: number) {
  return request<{
    success: string
    total: string
  }>({
    method: 'post',
    url: `/chato/api/document_management/${domain_id}/get_wx_public_article_spider_process`
  })
}

// 生成问答
export function postGenerateDocAPI(fileId: number) {
  return request<boolean>({
    method: 'post',
    url: `/chato/api/document_management/${fileId}/qa`
  })
}

// 生成问答-问答列表
export function getGenerateDocListAPI(
  fileId: string,
  params: { page: number; size: number; is_handle: boolean }
) {
  return request({
    url: `/chato/api/document_management/${fileId}/qa`,
    params
  })
}

// 生成问答-转存/废弃
export function postGenerateQAUnloadingAPI(fileId: string, data: IQuestionConvertQAForm) {
  return request({
    method: 'patch',
    url: `/chato/api/document_management/${fileId}/qa`,
    data
  })
}

// // 生成问答-存储
export function patchGenerateQASaveAPI(QaId: number, data: { question: string; answer: string }) {
  return request({
    method: 'patch',
    url: `/chato/api/document_management/qa/${QaId}`,
    data
  })
}
