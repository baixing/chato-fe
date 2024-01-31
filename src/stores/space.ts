import { getCommonGraph } from '@/api/graph'
import { getSpaceQuota, getSpaceRights } from '@/api/space'
import { ESpaceRightsType } from '@/enum/space'
import type { IPage } from '@/interface/common'
import type { ISpaceQuota, ISpaceRights } from '@/interface/space'
import type { IUserInfo } from '@/interface/user'
import { defineStore, storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import { useBase } from './base'

export const useSpaceStore = defineStore('space', () => {
  const spaceMemberPagination = ref<IPage>({
    page: 1,
    size: 9,
    page_count: 1,
    total: 0
  })
  const spaceMembers = ref<IUserInfo[]>([])
  const spaceQuota = ref<ISpaceQuota>({
    consumed: 0,
    total: 0
  }) // 空间额度
  const followPublicVisible = ref(false) // 引导关注公众号弹框
  const upgradeRightsVisible = ref(false) // 升级权益弹窗
  const upgradeRightsType = ref(ESpaceRightsType.default) // 升级权益类型
  const base = useBase()
  const { orgInfo } = storeToRefs(base)

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

  // 空间成员
  const initSpaceMembers = async (
    page = spaceMemberPagination.value.page,
    size = spaceMemberPagination.value.size
  ) => {
    const {
      data: { data, pagination }
    } = await getCommonGraph<IUserInfo[]>(`chato_orgs/${orgInfo.value.id}/users`, {
      page,
      size
    })
    spaceMembers.value = data
    spaceMemberPagination.value = pagination
    return data
  }

  watch(
    () => spaceMemberPagination.value.page,
    (page) => {
      initSpaceMembers(page, spaceMemberPagination.value.size)
    }
  )

  return {
    spaceQuota,
    spaceMembers,
    currentRights,
    upgradeRightsType,
    upgradeRightsVisible,
    followPublicVisible,
    spaceMemberPagination,
    initSpaceRights,
    initSpaceQuota,
    initSpaceMembers
  }
})
