import { ChatMessageFinalStatus } from '@/constant/chat'
import { EMessageType, EWsMessageStatus } from '@/enum/message'
import { formatChatMessageAnswer } from '@/utils/chat'
import { defineStore } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { nextTick, ref } from 'vue'

export const useSocketStore = defineStore('socket', () => {
  const socketResultMap = ref(new Map<string | number, any>())
  const peddingDomains = ref<string[]>([])

  const updateSocketResultMap = (res) => {
    const msgId = res.msg_id || uuidv4()
    const type = res.type

    const mergeResult = {
      ...res,
      chunk_message: formatChatMessageAnswer({
        content: res.chunk_message,
        type: res.type
      })
    }

    type !== EMessageType.end_flow ? socketResultMap.value.set(msgId, mergeResult) : ''

    if (ChatMessageFinalStatus.includes(res.status)) {
      nextTick(() => {
        socketResultMap.value.delete(msgId)
      })
    }
  }

  // 终止
  const terminatedSocketResultMap = (mapResult) => {
    const { msg_id, questionId } = mapResult
    if (socketResultMap.value.has(msg_id) || socketResultMap.value.has(questionId)) {
      const result = socketResultMap.value.get(msg_id)
      const terminatedResult = {
        ...result,
        status: EWsMessageStatus.done
      }

      socketResultMap.value.set(msg_id, terminatedResult)
    }
  }

  const isExistInPeddingDomains = (domain: string) => peddingDomains.value.includes(domain)

  const updatePeddingDomains = (domain: string) => {
    if (!isExistInPeddingDomains(domain)) {
      peddingDomains.value.push(domain)
    }
  }

  return {
    socketResultMap,
    updatePeddingDomains,
    updateSocketResultMap,
    terminatedSocketResultMap,
    isExistInPeddingDomains
  }
})
