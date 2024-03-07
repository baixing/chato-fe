import { serachYouzanUserInfoAPI } from '@/api/yz'
import type { IYouzanUserData } from '@/interface/yz'
import { $notnull } from '@/utils/help'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useYouzanStore = defineStore('youzan', () => {
  const youzanInfo = ref<IYouzanUserData | null>(null)

  const updateYouzanInfo = (info: IYouzanUserData) => {
    youzanInfo.value = info
  }

  const getYouzanInfo = async () => {
    const res = await serachYouzanUserInfoAPI()

    if ($notnull(res.data.data)) {
      updateYouzanInfo(res.data.data)
    }
  }

  return {
    youzanInfo,
    updateYouzanInfo,
    getYouzanInfo
  }
})
