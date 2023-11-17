import { EAllRole } from '@/enum/user'
import router, { RoutesMap } from '@/router'
import { useBase } from '@/stores/base'
import { storeToRefs } from 'pinia'
import { watch } from 'vue'
import type { RouteLocationNormalized } from 'vue-router'

export default function useRoleCheck(to: RouteLocationNormalized) {
  const baseStoreI = useBase()
  const { userInfo } = storeToRefs(baseStoreI)

  watch(userInfo, (v) => {
    if (v && /^(tranning|manager).*/.test(to.name as string) && v.role === EAllRole.member) {
      return router.replace({ name: RoutesMap.home.homeResource })
    }
  })
}
