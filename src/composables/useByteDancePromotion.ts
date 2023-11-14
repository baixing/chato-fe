import qs from 'query-string'
import { ref } from 'vue'
import type { IPromotionParams, IResponseData } from '@/interface/bytedanceSEM'
import customRequest from '@/utils/request'

export default function useByteDancePromotion() {
  const BYTEDANCE_PROMOTION_CLICKID_KEY = 'chato-bytedance-clickid'

  const clickid = ref('')
  const parsedUrl = qs.parseUrl(window.location.href).query

  const routerClickid = parsedUrl?.clickid || ''

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

export async function postBytedancePromotion(clickid: string, event_type: string): Promise<void> {
  const params: IPromotionParams = {
    event_type: event_type,
    context: {
      ad: {
        callback: clickid
      }
    },
    timestamp: Date.now()
  }
  console.log(params)

  await customRequest<IResponseData>({
    method: 'POST',
    url: 'https://analytics.oceanengine.com/api/v2/conversion',
    data: params
  })
}
