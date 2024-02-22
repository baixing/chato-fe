import type { IKnowledgeShared, IWXPublic, RetryFileMateType } from '@/interface/knowledge'
import request from '@/utils/request'

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

// QA 转文档
export function qaToDoc(domainId, data) {
  return request({
    method: 'post',
    url: `/chato/api/v1/domains/${domainId}/excel_to_txt`,
    data
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

// 生成 QA 验收报告
export function generateQACheckReport(domain_id: number | string) {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${domain_id}/qa_acceptance_check`
  })
}

// 上传头像接口
export const getFileUrl = (data: FormData) => {
  return request({
    method: 'post',
    url: `/chato/api/file/upload/file`,
    data
  })
}

// 定时刷新
export const updateDocRefreshSwitch = (file_id: number, refresh_switch: number) => {
  return request({
    method: 'post',
    url: `/chato/api/document_management/${file_id}/refresh_switch`,
    data: {
      refresh_switch
    }
  })
}
