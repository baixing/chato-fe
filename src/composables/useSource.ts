import { AWANG_SOURCE_WEB } from '@/constant/common'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const useSource = () => {
  const route = useRoute()
  const urlSource = route.query.source as string

  const source = computed(() => {
    if (!urlSource) {
      return AWANG_SOURCE_WEB
    }

    return urlSource
  })

  return {
    source
  }
}
