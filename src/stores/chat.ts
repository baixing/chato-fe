import { getChatSessionList } from '@/api/chatList'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const chatList = ref<any>([])
  const chatingInfo = ref<any>({})

  const initChatList = async () => {
    const res = await getChatSessionList()
    chatList.value = res.data.data
    chatingInfo.value = chatList.value[0] || {}
  }

  const switchChatingInfo = (slug: string) => {
    if (!chatList.value.length) {
      return
    }
    const currentChatDomain = chatList.value.find((item) => item.slug === slug) || {}
    chatingInfo.value = currentChatDomain
  }

  return {
    chatList,
    chatingInfo,
    initChatList,
    switchChatingInfo
  }
})
