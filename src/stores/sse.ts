import { ChatMessageFinalStatus } from '@/constant/chat'
import { EWsMessageStatus } from '@/enum/message'
import { formatChatMessageAnswer } from '@/utils/chat'
import { ElMessage } from 'element-plus'
import { defineStore } from 'pinia'
import { computed, nextTick, ref } from 'vue'

export const useSSEStore = defineStore('sse', () => {
  const peddingDomains = ref<string[]>([])
  const sseMsgId = ref<string | number>() // 当前消息窗口内正在传输的消息 ID
  const sseResultMap = ref(new Map<string | number, any>())
  const abortControllerMap = ref(new Map<string | number, AbortController>())

  // 当前消息窗口内正在传输的消息
  const sseMsgResult = computed(() => sseResultMap.value.get(sseMsgId.value))

  const setSSEResultMap = (res) => {
    const msgId = res.msg_id
    const questionId = res.question_id

    if (!msgId || !questionId) {
      ElMessage.warning('参数丢失: msg_id 或 question_id 丢失')
      return
    }

    const lastChunkMsg =
      (sseResultMap.value.get(msgId) || sseResultMap.value.get(questionId))?.chunk_message || ''

    const mergeResult = {
      ...res,
      chunk_message: formatChatMessageAnswer({
        content: res.chunk_message,
        type: res.type,
        lastContent: lastChunkMsg
      })
    }

    sseResultMap.value.set(msgId, mergeResult)
    sseResultMap.value.set(questionId, mergeResult)

    if (ChatMessageFinalStatus.includes(res.status)) {
      // 消息传递完毕，清理 map 内的完毕消息，减少垃圾数据
      nextTick(() => {
        sseResultMap.value.delete(msgId)
        sseResultMap.value.delete(questionId)
      })
    }
  }

  const terminatedSSEResultMap = (mapResult, abortKey) => {
    const { msg_id, questionId } = mapResult
    if (sseResultMap.value.has(msg_id) || sseResultMap.value.has(questionId)) {
      const result = sseResultMap.value.get(msg_id) || sseResultMap.value.get(questionId)
      const terminatedResult = {
        ...result,
        status: EWsMessageStatus.done
      }

      sseResultMap.value.set(msg_id, terminatedResult)
      sseResultMap.value.set(questionId, terminatedResult)
    }

    // 中断清理
    if (abortControllerMap.value.has(abortKey)) {
      abortControllerMap.value.get(abortKey).abort()
      abortControllerMap.value.delete(abortKey)
    }
  }

  const setAbortControllerMap = (mapKey, controller) => {
    abortControllerMap.value.set(mapKey, controller)
  }

  const isExistInPeddingDomains = (domain: string) => peddingDomains.value.includes(domain)

  const updatePeddingDomains = (domain: string) => {
    if (!isExistInPeddingDomains(domain)) {
      peddingDomains.value.push(domain)
    }
  }

  return {
    sseMsgId,
    sseMsgResult,
    sseResultMap,
    updatePeddingDomains,
    isExistInPeddingDomains,
    terminatedSSEResultMap,
    setSSEResultMap,
    setAbortControllerMap
  }
})
