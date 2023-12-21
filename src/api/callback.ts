import request from '@/utils/request'

export const postDouyinApplicationAPI = (
  id: string,
  platform: string,
  event_type: string = 'active'
) => {
  return request({
    method: 'post',
    url: `/chato/api/v1/douyin/callback/application/${id}/${platform}`,
    data: {
      event_type
    }
  })
}
