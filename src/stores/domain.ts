import { getMyOrgs } from '@/api/org'
import type { IDomainInfo } from '@/interface/domain'
import { RoutesMap } from '@/router'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useRouter, type RouteLocationNormalizedLoaded } from 'vue-router'
import { useBase } from './base'

export const useDomainStore = defineStore('domain', () => {
  const domainList = ref<IDomainInfo[]>([])
  const domainInfo = ref<Partial<IDomainInfo>>({})
  const baseStore = useBase()
  const router = useRouter()

  const switchDomainInfoById = (id: number | string) => {
    domainInfo.value = domainList.value.find((item) => item.id === Number(id)) || {}
  }

  const initDomainList = async (route?: RouteLocationNormalizedLoaded) => {
    try {
      let domain: IDomainInfo
      const res = await getMyOrgs()
      const org = res.data?.data?.[0] || {}
      baseStore.updateOrgInfo(org)

      if (route?.params?.botId) {
        domain = org?.domains?.find((item: IDomainInfo) => String(item.id) === route.params.botId)
      } else {
        domain = org?.domains?.[0]
      }

      if (org?.domains.length && !domain && route.name !== RoutesMap.manager.create) {
        router.replace('/error/404')
        return
      }

      domainInfo.value = domain || {}
      domainList.value = org.domains
      return Promise.resolve(domain)
    } catch (e) {}
  }

  return {
    domainList,
    domainInfo,
    initDomainList,
    switchDomainInfoById
  }
})
