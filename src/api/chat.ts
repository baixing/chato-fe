import { ETerminal } from '@/enum/common'
import type { IChatCitationSource } from '@/interface/chat'
import type { IRecommendQuestion, IRecommendQuestionParams } from '@/interface/question'
import type { ITTSList, ITTSParams } from '@/interface/tts'
import request from '@/utils/request'

export function getMessages(orgId) {
  return request({
    url: `/chato/api/orgs/${orgId}/questions`
  })
}

export function chatToBot(botId, question) {
  return request({
    method: 'post',
    url: `/chato/api/domains/${botId}/chat`,
    data: {
      p: question
    }
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

// 问题推荐
export const getChatRecommendQuestions = (data: IRecommendQuestionParams) => {
  return request<{ recommends: IRecommendQuestion[] }>({
    method: 'post',
    url: 'api/recommend/question',
    data
  })
}
