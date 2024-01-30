import { getChatSessionListB, getChatSessionListC } from '@/api/chatList'
import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const authStore = useAuthStore()
  const { authToken, uid } = storeToRefs(authStore)
  const chatList = ref<any>([])
  const chatingInfo = ref<any>({})

  const initChatList = async () => {
    const getChatSessionListFunc = authToken.value
      ? getChatSessionListB
      : (uid: string) => getChatSessionListC(uid)
    const res = await getChatSessionListFunc(uid.value)
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
