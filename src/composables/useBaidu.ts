import { useStorage } from '@vueuse/core'
import type { RouteLocationNormalized } from 'vue-router'

export default function useBaidu(route: RouteLocationNormalized) {
  const query_bd_vid = route.query.bd_vid as string
  const bdvid = useStorage('bd_vid', query_bd_vid)

  return {
    bdvid
  }
}
