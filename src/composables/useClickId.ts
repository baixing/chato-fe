import { computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export default function useClickId(route: RouteLocationNormalized) {
  const CLICK_ID = 'clickId'

  const routeClickId = route.query.clickid as string

  const localClickId = localStorage.getItem(CLICK_ID) || ''

  const clickId = computed({
    get: () => routeClickId || localClickId,
    set: (val) => {
      localStorage.setItem(CLICK_ID, val)
    }
  })

  const setClickId = (id: string) => {
    clickId.value = id
    localStorage.setItem(CLICK_ID, id)
  }

  routeClickId && setClickId(routeClickId)

  return {
    clickId,
    setClickId
  }
}
