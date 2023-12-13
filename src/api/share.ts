import request from '@/utils/request'

export function postShare(botIdList: number[]) {
  return request({
    url: `/chato/api/v1/questions/share`,
    method: 'post',
    data: {
      question_ids: botIdList
    }
  })
}
