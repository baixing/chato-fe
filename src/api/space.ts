import type {
  IAddMemeberRole,
  ISpaceQuota,
  ISpaceRights,
  ISpaceRightsSummary,
  ISpaceRole
} from '@/interface/space'
import type { IUserInfo } from '@/interface/user'
import request from '@/utils/request'

// 删除空间成员
export function removeSpaceMember(id: number) {
  return request({
    method: 'post',
    url: `/chato/api/v1/user/org/member/${id}/delete`
  })
}

// 用户是否在空间内
export function hasInSpace(org_id: number) {
  return request<{ user: IUserInfo }>({
    method: 'get',
    url: `/chato/api/v1/user/org/space`,
    data: { org_id }
  })
}

// 加入空间
export function addSpaceMember(data: IAddMemeberRole) {
  return request({
    method: 'post',
    url: `/chato/api/v1/user/org/add_member`,
    data
  })
}

// 获取邀请空间的信息
export function getInviteUserDetail(data: IAddMemeberRole) {
  return request<IUserInfo | string>({
    method: 'get',
    url: `/chato/api/v1/user/get_invite_org_info`,
    data
  })
}

// 获取空间权益
export const getSpaceRights = () => {
  return request<ISpaceRights>({
    method: 'get',
    url: `/chato/api/v1/user/org/config/current`
  })
}

// 检查权益提示是否重复展示
export const checkSpaceRightsTypeCanShow = (type: string) => {
  return request<boolean>({
    method: 'get',
    url: `/chato/api/v1/user/org/tips/expire`,
    data: {
      type
    }
  })
}

// 获取空间额度
export const getSpaceQuota = () => {
  return request<ISpaceQuota>({
    method: 'get',
    url: `/chato/api/user/quota`
  })
}

// 获取空间权益信息汇总
export const getSpaceRightsSummary = () => {
  return request<ISpaceRightsSummary>({
    method: 'get',
    url: `/chato/api/v1/org/consumption`
  })
}

export const getInviteLink = (params: ISpaceRole) => {
  return request({
    method: 'get',
    url: `/chato/api/v1/user/get_invite_ticket`,
    params
  })
}
