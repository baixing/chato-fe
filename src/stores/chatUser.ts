import type { ICRMMessage } from '@/interface/message'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatUserStore = defineStore('chatUser', () => {
  const chatUsersMap = ref(new Map<string, ICRMMessage[]>())

  const setUserChatMessages = (uid: string, msgList: ICRMMessage[]) => {
    chatUsersMap.value.set(uid, msgList)
  }

  const addUserChatMessage = (uid: string, msg: ICRMMessage) => {
    const msgList = chatUsersMap.value.get(uid) || []
    msgList.push(msg)
    setUserChatMessages(uid, msgList)
  }

  const updateLatestUserChatMessage = (uid: string, msg: Partial<ICRMMessage>) => {
    const msgList = [...chatUsersMap.value.get(uid)]
    const newMsg = { ...msgList.at(-1), ...msg }
    msgList[msgList.length - 1] = newMsg
    setUserChatMessages(uid, msgList)
  }

  return {
    chatUsersMap,
    updateLatestUserChatMessage,
    setUserChatMessages,
    addUserChatMessage
  }
})
