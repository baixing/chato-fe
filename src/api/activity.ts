import type { IActivity, IActivityMessage, IQwUserTag } from '@/interface/activity'
import type { IPageFilter } from '@/interface/common'
import request from '@/utils/request'

// 活动列表
export function getActivityList(data: IPageFilter) {
  return request<IActivity[]>({
    method: 'get',
    url: `/chato/api/v1/send_schedule/query_group`,
    data
  })
}

// 活动详情
export function getActivityDetail(id: string | number) {
  return request<IActivity>({
    method: 'get',
    url: `/chato/api/v1/send_schedule/group/${id}`
  })
}

// 添加活动
export function addActivity(data: Omit<IActivity, 'id'> & { type: number }) {
  return request({
    method: 'post',
    url: `/chato/api/v1/send_schedule/create_group`,
    data
  })
}

// 删除活动
export function deleteActivity(id: number) {
  return request({
    method: 'post',
    url: `/chato/api/v1/send_schedule/delete_group/${id}`
  })
}

// 企微账户下 - 用户标签列表
export function getQwUserTagList(wx_user_id: number | string) {
  return request<IQwUserTag[]>({
    method: 'get',
    url: `/chato/api/v1/send_schedule/wx_user_label_list`,
    data: { wx_user_id }
  })
}

// 活动 - 消息列表
export function getActivityMessageList(data: IPageFilter<{ group_id: number | string }>) {
  return request<IActivityMessage[]>({
    method: 'get',
    url: `/chato/api/v1/send_schedule/query_group_send_schedule`,
    data
  })
}
