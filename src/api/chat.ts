import { ETerminal } from '@/enum/common'
import type { ChatHistoryParams, ChatToBotRes, IChatCitationSource } from '@/interface/chat'
import type { ITTSList, ITTSParams } from '@/interface/tts'
import request from '@/utils/request'

export function getMessages(orgId) {
  // return Promise.reject({ response: { status: 403 } })
  // return Promise.resolve({ data: dataQuestions })

  return request({
    url: `/chato/api/orgs/${orgId}/questions`
  })
}

export function chatToBot(botId, question) {
  // return Promise.reject({ response: { status: 403 } })
  // return Promise.resolve({ data: dataQuestion })

  return request({
    method: 'post',
    url: `/chato/api/domains/${botId}/chat`,
    data: {
      p: question
    }
  })
}
export function chatToBotPublic(botSlug, question, uid) {
  // return Promise.reject({ response: { status: 403 } })
  // return Promise.resolve({ data: dataQuestion })

  uid = uid || undefined
  return request({
    enforceAnonymity: true, // 此接口强制使用匿名方式调用，哪怕当前用户有 authToken 也不用
    method: 'post',
    url: `/chato/api-public/domains/${botSlug}/chat`,
    data: {
      p: question,
      uid
    }
  })
}

// c端聊天
export function chatToBotHistoryC(params: ChatHistoryParams) {
  return request<ChatToBotRes[]>({
    method: 'get',
    url: '/chato/api/v1/questions/query',
    params
  })
}

// b端聊天
export function chatToBotHistoryB(params: ChatHistoryParams) {
  return request<ChatToBotRes[]>({
    method: 'get',
    url: '/chato/api/v1/questions/auth/query',
    params
  })
}

// 聊天-问题风控
export function forbidSerach(domainId, params) {
  return request({
    method: 'post',
    url: `/chato/api/forbid/${domainId}`,
    data: params
  })
}

// 问答-踩和赞
export function evaluate(questionId, params) {
  return request({
    method: 'post',
    url: `/chato/api/v1/questions/${questionId}/evaluate`,
    data: params
  })
}

// 清除会话记录

export function clearSession(params) {
  return request({
    url: `/chato/api/v1/questions/chat/clear`,
    params
  })
}

// 删除单条会话记录
export function deleteSession(params) {
  return request({
    method: 'post',
    url: '/chato/api/v1/questions/delete',
    data: params
  })
}

// 翻译
export function translate(params) {
  return request({
    method: 'post',
    url: '/api/translate/text',
    data: params
  })
}

// 答案引用文档来源
export const getCitationSource = ({ slug, question_id, terminal = ETerminal.B }) => {
  const url =
    ETerminal.B === terminal
      ? `/chato/api/v1/questions/question_ref_doc`
      : `/chato/api-public/domains/${slug}/question_ref_doc`
  return request<IChatCitationSource[]>({
    method: 'get',
    url,
    data: { question_id }
  })
}

// 文本转语音
export const getTTS = (data: ITTSParams) => {
  return request<ITTSList>({
    method: 'post',
    url: '/api/tts/stream',
    data
  })
}
