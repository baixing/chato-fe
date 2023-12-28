import type { IFlow, IIntention } from '@/interface/flow'
import request from '@/utils/request'

// Flow 列表
export function getFlowList() {
  return request<IFlow[]>({
    method: 'get',
    url: `/chato/sop_flow/list`
  })
}

// Flow 添加
export function addFlow(data) {
  return request({
    method: 'post',
    url: `/chato/sop_flow/save`,
    data
  })
}

// Flow 删除
export function deleteFlow(id: number) {
  return request({
    method: 'post',
    url: `/chato/sop_flow/${id}/delete`
  })
}

// Intention 列表
export function getIntentionList(sop_flow_id: number | string) {
  return request<IIntention[]>({
    method: 'get',
    url: `/chato/sop_flow/sop_node_list`,
    data: {
      sop_flow_id,
      parent_node_id: 0
    }
  })
}

// Intention 添加
export function addIntention(data) {
  return request({
    method: 'post',
    url: `/chato/sop_flow/create_sop_node`,
    data
  })
}

// Intention 删除
export function deleteIntention(flowId: IFlow['id'], id: number) {
  return request({
    method: 'post',
    url: `/chato/sop_flow/${flowId}/delete_node/${id}`
  })
}

// Flow wx user 查询
export function getFlowWxUsers(sop_flow_id: IFlow['id']) {
  return request({
    method: 'get',
    url: `/chato/sop_flow/bind_wx_user_ids`,
    data: { sop_flow_id }
  })
}

// Flow wx user 添加
export function addFlowWxUsers(flowId: IFlow['id'], data) {
  return request({
    method: 'post',
    url: `/chato/sop_flow/${flowId}/bind_wx_user_ids`,
    data
  })
}
