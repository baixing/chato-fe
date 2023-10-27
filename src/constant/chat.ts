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
