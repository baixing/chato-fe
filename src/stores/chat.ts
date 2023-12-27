import { getCategoryList, getChatList } from '@/api/aWang'
import { getChatSessionListB } from '@/api/chatList'
import type { IDomainInfo } from '@/interface/domain'
import { useStorage } from '@vueuse/core'
import { defineStore, storeToRefs } from 'pinia'
import { ref } from 'vue'
import { useAuthStore } from './auth'

export const useChatStore = defineStore('chat', () => {
  const $uid = useStorage('uid', '')
  const authStore = useAuthStore()
  const { authToken } = storeToRefs(authStore)
  const chatList = ref<IDomainInfo[]>([])
  const AIDialogue = ref<IDomainInfo[]>()
  const AIPainting = ref<IDomainInfo[]>()
  const chatingInfo = ref<any>({})

  const initChatList = async () => {
    const getChatSessionListFunc = authToken.value
      ? getChatSessionListB
      : (uid: string) => getChatList(uid, 'default:bots')
    const res = await getChatSessionListFunc($uid.value)
    chatList.value = res.data.data
    chatingInfo.value = chatList.value[0] || {}
    initAIDialogue()
  }

  const initAIDialogue = () => {
    AIDialogue.value = [
      'ge9p359y4v27d2oq',
      '392mjrmgmzvrqxep',
      'ymk867pn429rv941',
      'q94e6rxnl8q7830m',
      'l3evn7vnd41rxopq',
      'ymk867pnzwxrv941'
    ].map((dialogue) => chatList?.value.find((item) => item.slug === dialogue))
    AIPainting.value = ['zk34lrlxwnvr9xnj'].map((dialogue) =>
      chatList?.value.find((item) => item.slug === dialogue)
    )
    getCategory()
  }

  const getCategory = async () => {
    const dialogueList = await getCategoryList('ai_chat')
    AIDialogue.value = dialogueList.data.data.map((dialogue) =>
      chatList.value.find((item) => item.slug === dialogue)
    )
    const drawList = await getCategoryList('ai_draw')
    AIPainting.value = drawList.data.data.map((painting) => {
      return chatList.value.find((item) => item.slug === painting)
    })
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
    AIPainting,
    AIDialogue,
    initChatList,
    switchChatingInfo
  }
})
