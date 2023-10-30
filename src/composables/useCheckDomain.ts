import { storeToRefs } from 'pinia'
import { checkDomainIdAPI } from '@/api/domain'
import { useAuthStore } from '@/stores/auth'
import { useDomainStore } from '@/stores/domain'
import type { RouteLocationNormalized } from 'vue-router'
import { $notnull } from '@/utils/help'

export default async function useCheckDomain(to: RouteLocationNormalized) {
  const authStoreI = useAuthStore()
  const domainStore = useDomainStore()
  const { domainList } = storeToRefs(domainStore)

  const checkDomain = async (id: string) => {
    const { data } = await checkDomainIdAPI(id)
    if (!data.data.current && data.data.token) {
      authStoreI.setToken(data.data.token)
    }
  }

  const initCheckDomain = async () => {
    if (authStoreI.authToken && to.params.botId) {
      const botId = to.params.botId as string
      if ($notnull(domainList.value)) {
        const hasDomain = domainList.value.some((item) => item.id === Number(botId))
        if (!hasDomain) {
          await checkDomain(botId)
        }
      } else {
        await checkDomain(botId)
      }
    }
  }

  initCheckDomain()
}
