import { getCommonGraph } from '@/api/graph'
import { getGroupListAPI } from '@/api/release'
import { checkSpaceRightsTypeCanShow } from '@/api/space'
import { ESpaceCommercialType, ESpaceRightsType } from '@/enum/space'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useSpaceStore } from '@/stores/space'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default function useSpaceRights() {
  const spaceStoreI = useSpaceStore()
  const domainStoreI = useDomainStore()
  const baseStoreI = useBase()
  const router = useRouter()
  const route = useRoute()

  const { upgradeRightsVisible, upgradeRightsType, currentRights, spaceMembers } =
    storeToRefs(spaceStoreI)
  const { domainList, domainInfo } = storeToRefs(domainStoreI)
  const { userInfo, userCommercialType } = storeToRefs(baseStoreI)

  const remainDays = computed(() => currentRights.value.days)
  const trusteeAccountNum = computed(() => currentRights.value.trustee_account_num)

  const isNotAllowedCommercialType = (notAllowedTypes: ESpaceCommercialType[]) => {
    return notAllowedTypes.includes(userCommercialType.value)
  }

  const isAllowedCommercialType = (allowedTypes: ESpaceCommercialType[]) => {
    return allowedTypes.includes(userCommercialType.value)
  }

  const isRightsTypeUpperLimited = async (type: ESpaceRightsType) => {
    // 超期版本权益最大使用时间时，所有类型都返回达到上限提示
    if (userInfo.value?.org?.created && !remainDays.value) {
      return true
    }

    let isUpperLimited = false
    switch (type) {
      case ESpaceRightsType.bot: {
        isUpperLimited = domainList.value.length >= currentRights.value.domain_num
        break
      }
      case ESpaceRightsType.usage: {
        isUpperLimited = !currentRights.value.days
        break
      }
      case ESpaceRightsType.space: {
        isUpperLimited = spaceMembers.value.length >= currentRights.value.account_num
        break
      }
      case ESpaceRightsType.groupChat:
      case ESpaceRightsType.groupChatFree: {
        const res = await getGroupListAPI(domainInfo.value.id)
        isUpperLimited = res.data.data.length >= currentRights.value.wx_group_num
        break
      }
      case ESpaceRightsType.weixinAccount: {
        const res = await getCommonGraph<any>('hosting_account', {
          filter: `org_id=="${userInfo.value?.org?.id}"`,
          size: 500
        })
        // serachAccountListAPI(userInfo.value?.org?.id)
        isUpperLimited = res.data.data.length >= trusteeAccountNum.value
        break
      }
      default: {
        isUpperLimited = false
      }
    }

    return isUpperLimited
  }

  const ShowDirectlyRightsType = [
    ESpaceRightsType.default,
    ESpaceRightsType.brand,
    ESpaceRightsType.quota,
    ESpaceRightsType.paintQuota
  ]

  const onOpenUpgradeRightsModal = (type: ESpaceRightsType, toVip: boolean) => {
    // if (
    //   route.name !== RoutesMap.vip.center &&
    //   currentRights.value &&
    //   [ESpaceCommercialType.free, ESpaceCommercialType.freeFirstExp].includes(
    //     currentRights.value.type
    //   ) &&
    //   [
    //     ESpaceRightsType.default,
    //     ESpaceRightsType.brand,
    //     ESpaceRightsType.bot,
    //     ESpaceRightsType.createAccount,
    //     ESpaceRightsType.space,
    //     ESpaceRightsType.usage
    //   ].includes(type) &&
    //   toVip
    // ) {
    //   router.push({ name: RoutesMap.vip.center })
    // } else {
    upgradeRightsVisible.value = true
    // }
  }

  const checkRightsTypeNeedUpgrade = async (type: ESpaceRightsType, toVip = true) => {
    try {
      // 针对群聊权益不同类型
      let rightsType = type
      if (
        type === ESpaceRightsType.groupChat &&
        userCommercialType.value === ESpaceCommercialType.free
      ) {
        rightsType = ESpaceRightsType.groupChatFree
      }
      upgradeRightsType.value = rightsType

      // 升级无固定类型权益弹框展示
      if (ShowDirectlyRightsType.includes(type)) {
        // upgradeRightsVisible.value = true
        onOpenUpgradeRightsModal(type, toVip)
        return true
      }

      // 具体类型权益是否用满，需要升级
      const isUpperLimited = await isRightsTypeUpperLimited(type)
      if (!isUpperLimited) {
        return false
      }

      // 获取权益使用时间后端记录 24 小时是否触发展示
      if (ESpaceRightsType.usage === type) {
        const {
          data: { data }
        } = await checkSpaceRightsTypeCanShow(type)

        if (data) {
          // upgradeRightsVisible.value = true
          onOpenUpgradeRightsModal(type, toVip)
          return true
        } else {
          return false
        }
      }

      onOpenUpgradeRightsModal(type, toVip)
      // upgradeRightsVisible.value = true
      return true
    } catch (err) {
      return false
    }
  }

  return {
    remainDays,
    isRightsTypeUpperLimited,
    isAllowedCommercialType,
    isNotAllowedCommercialType,
    checkRightsTypeNeedUpgrade
  }
}
