import { getChatList } from '@/api/chatList'
import type { IDomainInfo } from '@/interface/domain'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useChatStore = defineStore('chat', () => {
  const chatList = ref<any>([])
  const chatingInfo = ref<any>({})

  const initChatList = async () => {
    const res = await getChatList()
    chatList.value = res.data.data
    chatingInfo.value = chatList.value[0] || {}
  }

  const switchChatingInfo = (slug: string) => {
    if (chatList.value.length <= 0) {
      return
    }
    chatingInfo.value = chatList.value.filter((item) => item.slug === slug)[0] || {}
  }

  const addNewChatToList = (domain: IDomainInfo) => {
    chatList.value.unshift(domain)
    chatingInfo.value = domain
  }

  return {
    chatList,
    chatingInfo,
    initChatList,
    switchChatingInfo,
    addNewChatToList
  }
})
