import { computed } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export default function useBdVid(route: RouteLocationNormalized) {
  const BD_VID = 'bd_vid'

  const routeBdVid = route.query.bd_vid as string

  const localBdVid = localStorage.getItem(BD_VID) || ''

  const bdvid = computed({
    get: () => routeBdVid || localBdVid,
    set: (val) => {
      localStorage.setItem(BD_VID, val)
    }
  })

  const setBdVid = (id: string) => {
    bdvid.value = id
    localStorage.setItem(BD_VID, id)
  }

  routeBdVid && setBdVid(routeBdVid)

  return {
    bdvid,
    setBdVid
  }
}
