import type { ICRMMessage } from '@/interface/message'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chatUser', () => {
  const chatUsersMap = ref(new Map<string, ICRMMessage[]>())

  const setUserChatMessages = (uid: string, msgList: ICRMMessage[]) => {
    chatUsersMap.value.set(uid, msgList)
  }

  const newUserChatMessage = (uid: string, message: ICRMMessage) => {
    const msgList = chatUsersMap.value.get(uid) || []
    msgList.push(message)
    setUserChatMessages(uid, msgList)
  }

  return {
    setUserChatMessages,
    newUserChatMessage
  }
})
