import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useIsMobile } from './useBasicLayout'
import {
  CHARO_SOURCE_PC,
  CHARO_SOURCE_WAP,
  CHATO_SHARE_SOURCE,
  CHATO_SHARE_SOURCE_PC,
  CHATO_SHARE_SOURCE_WAP
} from '@/constant/common'

export const useSource = () => {
  const isMobile = useIsMobile()
  const route = useRoute()
  const urlSource = route.query.source as string
  const source = computed(() => {
    if (!urlSource) {
      return isMobile ? CHARO_SOURCE_WAP : CHARO_SOURCE_PC
    }

    if (urlSource && urlSource === CHATO_SHARE_SOURCE) {
      return isMobile ? CHATO_SHARE_SOURCE_WAP : CHATO_SHARE_SOURCE_PC
    }

    return urlSource
  })

  return {
    source
  }
}
