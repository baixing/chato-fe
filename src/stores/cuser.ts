import { postCheckLoginCAPI } from '@/api/auth'
import { getCommonGraph } from '@/api/graph'
import type { ICUserBuyProductionDetail } from '@/interface/order'
import { RoutesMap } from '@/router'
import { ElNotification as Notification } from 'element-plus'
import { defineStore, storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, type LocationQuery } from 'vue-router'
import { useAuthStore } from './auth'

export const cuserStore = defineStore('cuser', () => {
  const { t } = useI18n()
  const router = useRouter()
  const authStore = useAuthStore()
  const { uid } = storeToRefs(authStore)
  const loginStatus = ref(false)
  const loginUsable = ref(false)
  const loginUserId = ref(0)
  const orderInfo = ref([]) // c端套餐信息
  const buyOrderInfo = ref<ICUserBuyProductionDetail[]>([]) // 已购买的套餐使用信息

  // 校验C端用户是否登录、是否在白名单中
  const checkUserLoginStatus = async (slug: string) => {
    const res = await postCheckLoginCAPI(slug, uid.value)
    const { login, usable } = res.data.data
    loginStatus.value = login
    loginUsable.value = usable
    if (!usable) {
      login ? Notification.info(t('该手机号没有被邀请')) : null
      routerToLogin(slug)
      return false
    }
    return true
  }

  const routerToLogin = (slug: string, query?: LocationQuery) => {
    router.push({
      name: RoutesMap.auth.loginInvite,
      query: {
        slug: slug,
        ...query
      }
    })
  }

  // 获取套餐信息
  const getCuserOrderInfo = async (slug: string) => {
    const res = await getCommonGraph<any[]>(`customer_package`, {
      filter: `domain_slug=="${slug}" and status=="active"`
    })
    orderInfo.value = res.data.data
  }

  // 获取c端已经购买的套餐信息
  const getCuserBuyOrderInfo = async (slug: string) => {
    const res = await getCommonGraph<any>('customer_order', {
      filter: `domain_slug=="${slug}" and user_uuid=="${uid.value}"`
    })
    buyOrderInfo.value = res.data.data
  }

  // 退出登录
  const loginoutCuser = () => {
    authStore.setUid(uuidv4())
    buyOrderInfo.value = []
    loginStatus.value = false
  }

  return {
    uid,
    loginStatus,
    orderInfo,
    buyOrderInfo,
    loginUserId,
    checkUserLoginStatus,
    routerToLogin,
    getCuserOrderInfo,
    getCuserBuyOrderInfo,
    loginoutCuser
  }
})
