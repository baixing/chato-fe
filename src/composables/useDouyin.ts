import { useStorage } from '@vueuse/core'
import type { RouteLocationNormalized } from 'vue-router'

export default function useBaidu(route: RouteLocationNormalized) {
  const query_clickid = route.query.clickid as string
  const clickId = useStorage('clickId', query_clickid)

  return {
    clickId
  }
}
