import request from '@/utils/request'

// 获取全部对话-B端
export function getChatSessionListB() {
  return request({
    method: 'get',
    url: '/chato/api/v1/domains/public_domain/get_chat_session'
  })
}

// 获取全部对话-C端
export function getChatSessionListC(id: string) {
  return request({
    method: 'get',
    url: `/chato/api/v1/domains/public_domain/get_chat_session_4c?sender_uid=${id}`
  })
}

// 加入对话列表-B端
export function addChatSessionB(data) {
  return request({
    method: 'post',
    url: '/chato/api/v1/domains/public_domain/add_chat_session',
    data
  })
}

// 加入对话列表-C端
export function addChatSessionC(id: string, data) {
  return request({
    method: 'post',
    url: `/chato/api/v1/domains/public_domain/add_chat_session_4c?sender_uid=${id}`,
    data
  })
}
