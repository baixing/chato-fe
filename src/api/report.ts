import type { TPagingList } from '@/interface/common'
import type { IQuestionFilter } from '@/interface/question'
import type { IFormCollectDetailList, IFormCollectSelect } from '@/interface/report'
import { paramsSerializer } from '@/utils/help'
import request from '@/utils/request'

export function getQuestionsSummary(orgId, domainId = null) {
  const params = {
    org_id: orgId,
    source: 'all',
    domain_id: undefined
  }
  if (domainId !== null) {
    params.domain_id = domainId // 只在domainId不为null时包括该参数
  }

  return request({
    url: `/chato/api/v1/statistics/questions/summary`,
    params
  })
}
export function getQuestions({
  domainId = null,
  source,
  evaluation,
  page,
  page_size,
  begin_time,
  end_time,
  mid_question_id,
  keyword
}: IQuestionFilter) {
  const params = {
    // domain_id: domainId,
    source: source,
    page: page,
    evaluation: evaluation,
    page_size,
    begin_time: begin_time,
    end_time: end_time,
    mid_question_id,
    domain_id: undefined,
    keyword
  }
  if (domainId != null) {
    params.domain_id = domainId
  }
  return request({
    url: `/chato/api/v1/statistics/questions/query`,
    params
  })
}

export function exportQuestions({ ids, domainId = null, midQuestionId }) {
  const data = {
    ids: ids,
    mid_question_id: midQuestionId,
    domain_id: undefined
  }

  if (domainId !== null) {
    data.domain_id = domainId // 只在domainId不为null时包括该参数
  }

  return request({
    method: 'post',
    responseType: 'arraybuffer',
    url: '/chato/api/v1/statistics/questions/export',
    data
  })
}
/**
 * @function
 * @description 表单数据筛选
 * @params TPagingList
 * @returns { Promise<IFormCollectSelect[]> }
 */
export function getFormCollectSelect(params: TPagingList) {
  return request<IFormCollectSelect[]>({
    url: `/chato/api/v1/graph/forms?${paramsSerializer(params)}`
  })
}

/**
 * @function
 * @description 表单收集列表
 * @params TPagingList
 * @return { Promise<IFormCollectDetailList[]> }
 */
export function getFormCollectDetailList(params: TPagingList) {
  return request<IFormCollectDetailList[]>({
    url: `/chato/api/v1/graph/form_datas?${paramsSerializer(params)}`
  })
}

/**
 * @function
 * @description 导出表单收集
 * @params TPagingList
 * @return { Promise<ArrayBuffer> }
 */
export function exportFormCollectDetailList(params: TPagingList) {
  return request<ArrayBuffer>({
    url: `/chato/api/v1/graph/export/form_datas?${paramsSerializer(params)}`,
    responseType: 'arraybuffer'
  })
}
