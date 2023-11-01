import { getSpaceMembers, getSpaceQuota, getSpaceRights } from '@/api/space'
import { ESpaceRightsType } from '@/enum/space'
import type { ISpaceQuota, ISpaceRights } from '@/interface/space'
import type { IUserInfo } from '@/interface/user'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSpaceStore = defineStore('space', () => {
  const spaceMembers = ref<IUserInfo[]>([])
  const spaceQuota = ref<ISpaceQuota>({
    consumed: 0,
    total: 0
  }) // 空间额度
  const followPublicVisible = ref(false) // 引导关注公众号弹框
  const upgradeRightsVisible = ref(false) // 升级权益弹窗
  const upgradeRightsType = ref(ESpaceRightsType.default) // 升级权益类型

  // 当前权益
  const currentRights = ref<ISpaceRights>()

  const initSpaceQuota = async () => {
    const {
      data: { data }
    } = await getSpaceQuota()
    spaceQuota.value = data
  }

  const initSpaceRights = async () => {
    const {
      data: { data }
    } = await getSpaceRights()
    currentRights.value = data
  }

  const initSpaceMembers = async () => {
    const {
      data: { data }
    } = await getSpaceMembers()
    spaceMembers.value = data
    return data
  }

  return {
    spaceQuota,
    spaceMembers,
    currentRights,
    upgradeRightsType,
    upgradeRightsVisible,
    followPublicVisible,
    initSpaceRights,
    initSpaceQuota,
    initSpaceMembers
  }
})
