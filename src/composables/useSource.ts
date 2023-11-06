import { CHARO_SOURCE_RESOURCE, CHATO_SOURCE_SHAKEDOWN } from '@/constant/common'
import { RoutesMap } from '@/router'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const useSource = () => {
  const route = useRoute()
  const urlSource = route.query.source as string
  const routeName = route.name as string

  const source = computed(() => {
    if (routeName === RoutesMap.tranning.roleInfo) {
      return CHATO_SOURCE_SHAKEDOWN
    }

    if (!urlSource) {
      return CHARO_SOURCE_RESOURCE
    }

    return urlSource
  })

  return {
    source
  }
}
