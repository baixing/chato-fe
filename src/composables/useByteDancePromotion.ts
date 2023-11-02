import qs from 'query-string'
import { ref } from 'vue'

export default function useByteDancePromotion() {
  const BYTEDANCE_PROMOTION_CLICKID_KEY = 'chato-bytedance-clickid'

  const clickid = ref('')
  console.log('clickid', clickid)
  const parsedUrl = qs.parseUrl(window.location.href).query

  const routerClickid = parsedUrl.clickid || ''

  function updateSessionStorage(key, refVar, routerVar) {
    if (!refVar.value && routerVar) {
      sessionStorage.setItem(key, routerVar)
    }
    if (routerVar && refVar.value !== routerVar) {
      sessionStorage.removeItem(key)
      sessionStorage.setItem(key, routerVar)
    }
    refVar.value = sessionStorage.getItem(key) || ''
  }

  updateSessionStorage(BYTEDANCE_PROMOTION_CLICKID_KEY, clickid, routerClickid)

  return {
    bytedancePromotionClickid: clickid
  }
}
