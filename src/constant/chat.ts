import { EMessageActionType, EMessageDisplayType, EWsMessageStatus } from '@/enum/message'

export const SymChatDomainDetail = Symbol('chat-domain-detail')
export const SymChatToken = Symbol('chat-token')
export const SymChatMessageAudioTTSParams = Symbol('chat-message-audio-tts-params')

export const ChatMessageMoreAction = {
  viewC: {
    [EMessageDisplayType.question]: [EMessageActionType.retry, EMessageActionType.copy],
    [EMessageDisplayType.answer]: [
      EMessageActionType.like,
      EMessageActionType.dislike,
      EMessageActionType.fix,
      EMessageActionType.translate,
      EMessageActionType.copy,
      EMessageActionType.expand,
      EMessageActionType.audio
    ]
  },
  viewTranning: {
    [EMessageDisplayType.question]: [
      EMessageActionType.retry,
      EMessageActionType.copy,
      EMessageActionType.delete
    ],
    [EMessageDisplayType.answer]: [
      EMessageActionType.like,
      EMessageActionType.dislike,
      EMessageActionType.fix,
      EMessageActionType.translate,
      EMessageActionType.copy,
      EMessageActionType.delete,
      EMessageActionType.expand,
      EMessageActionType.audio
    ]
  },
  viewDetail: {
    [EMessageDisplayType.question]: [],
    [EMessageDisplayType.answer]: [
      EMessageActionType.fix,
      EMessageActionType.translate,
      EMessageActionType.copy,
      EMessageActionType.audio
    ]
  },
  viewMidjourney: {
    [EMessageDisplayType.question]: [
      EMessageActionType.retry,
      EMessageActionType.copy,
      EMessageActionType.delete
    ],
    [EMessageDisplayType.answer]: [
      EMessageActionType.save,
      EMessageActionType.like,
      EMessageActionType.dislike,
      EMessageActionType.delete
    ]
  }
}

export const ChatMessageImgLimit_Size_800 = '?imageMogr2/thumbnail/800x800/format/jpg'
export const ChatMessageImgLimit = '?imageMogr2/format/jpg'

// 回复消息完成最终状态
export const ChatMessageFinalStatus = [
  EWsMessageStatus.done,
  EWsMessageStatus.error,
  EWsMessageStatus.forbid,
  EWsMessageStatus.forbid_quota
]

// 聊天气泡颜色配置列表
export const ChatBubbleColorList = [
  {
    bg: '#3264C5',
    cl: '#fff'
  },
  {
    bg: '#00BCBC',
    cl: '#fff'
  },
  {
    bg: '#47AF3E',
    cl: '#fff'
  },
  {
    bg: '#7C5CFC',
    cl: '#fff'
  },
  {
    bg: '#EA5C56',
    cl: '#fff'
  },
  {
    bg: '#333333',
    cl: '#fff'
  },
  {
    bg: '#4C83F3',
    cl: '#fff'
  },
  {
    bg: '#76EEEE',
    cl: '#2F3447'
  },
  {
    bg: '#65E583',
    cl: '#2F3447'
  },
  {
    bg: '#DA7EDC',
    cl: '#fff'
  },
  {
    bg: '#F3A440',
    cl: '#fff'
  },
  {
    bg: '#666666',
    cl: '#fff'
  },
  {
    bg: '#6E93DE',
    cl: '#fff'
  },
  {
    bg: '#CAEA99',
    cl: '#2F3447'
  },
  {
    bg: '#F4C3DE',
    cl: '#2F3447'
  },
  {
    bg: '#F9D854',
    cl: '#2F3447'
  },
  {
    bg: '#EEEEEE',
    cl: '#2F3447'
  },
  {
    bg: '#BBCFF6',
    cl: '#2F3447'
  }
]
