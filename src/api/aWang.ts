import request from '@/utils/request'

export const getChatList = (user_uuid: string, limit_key?: string) => {
  return request({
    method: 'get',
    url: `/api/domains/user/${user_uuid}/conversations`,
    data: { limit_key }
  })
}

export const getCategoryList = (category: string) => {
  return request({
    method: 'get',
    url: `/api/domains/awang/banner/${category}`
  })
}
