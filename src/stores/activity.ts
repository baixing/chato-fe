import { getActivityList } from '@/api/activity'
import type { IActivity } from '@/interface/activity'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useActivityStore = defineStore('activity', () => {
  const activityList = ref<IActivity[]>([])

  const initActivityList = async (page = 1) => {
    try {
      if (page === 1) {
        activityList.value = []
      }
      const {
        data: { data, pagination }
      } = await getActivityList({ page, page_size: 10 })
      activityList.value = activityList.value.concat(data)
      return { data, pagination }
    } catch (e) {}
  }

  return {
    activityList,
    initActivityList
  }
})
