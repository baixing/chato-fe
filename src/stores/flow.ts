import { getFlowList } from '@/api/flow'
import type { IFlow } from '@/interface/flow'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useFlowStore = defineStore('flow', () => {
  const flowList = ref<IFlow[]>([])

  const initFlowList = async () => {
    try {
      const {
        data: { data }
      } = await getFlowList()
      flowList.value = data
      return data
    } catch (e) {}
  }

  return {
    flowList,
    initFlowList
  }
})
