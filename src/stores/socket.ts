import { ChatMessageFinalStatus } from '@/constant/chat'
import { EMessageType, EWsMessageStatus } from '@/enum/message'
import { formatChatMessageAnswer } from '@/utils/chat'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { nextTick, ref } from 'vue'

export const useSocketStore = defineStore('socket', () => {
  const socketResultMap = ref(new Map<string | number, any>())
  const peddingDomains = ref<string[]>([])

  const updateSocketResultMap = (res) => {
    const msgId = res.msg_id
    const type = res.type

    if (!msgId) {
      ElMessage.warning('参数丢失: msg_id 丢失')
      return
    }

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
