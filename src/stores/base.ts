import { getABTestConfig } from '@/api/abtest'
import { getOrgUserList } from '@/api/user'
import useLocationDvid from '@/composables/useLocationDvid'
import { ESpaceCommercialType } from '@/enum/space'
import type { IUserInfo } from '@/interface/user'
import * as Sentry from '@sentry/vue'
import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'

interface State {
  authToken: any
  userInfo: Partial<IUserInfo> // 当前空间用户
  collectConfig: any
  orgInfo: any
  orgInfoList: Partial<IUserInfo[]>
  userCommercialType: ESpaceCommercialType
  abTestConfig: any
}

interface UpdateUserInfoAttri {
  avatar: string
  nickname: string
}

interface UpdateOrgInfoAtti {
  avatar: string
  name: string
}

export const useBase = defineStore('base', {
  state: (): State => {
    return {
      authToken: '',
      userInfo: {},
      collectConfig: {},
      orgInfo: {},
      orgInfoList: [],
      userCommercialType: ESpaceCommercialType.free,
      abTestConfig: {}
    }
  },
  actions: {
    getAuthToken() {
      this.authToken = useStorage<string>('auth_token', '')
      return Promise.resolve(this.authToken)
    },
    async getUserInfo() {
      try {
        const res = await getOrgUserList()
        const { current, all } = res.data.data
        this.orgInfoList = all
        this.userInfo = current
        this.userCommercialType = current.org.type || ESpaceCommercialType.free
        Sentry.setUser({ user: JSON.stringify(current) })
        return Promise.resolve(this.userInfo)
      } catch (e) {}
    },
    // 切换空间时，需要切换userInfo，token，orgInfo，domainList
    // 切换空间时，更新用户信息
    async updateUserInfo(info: IUserInfo) {
      const res = await getOrgUserList()
      const { all } = res.data.data
      const filterCurrent = all.filter((i) => i.id === info.id)
      const resInfo = filterCurrent.length > 0 ? filterCurrent[0] : info
      this.updateUserInfoCommon(resInfo)
      return Promise.resolve()
    },
    async updateUserInfoCommon(res: IUserInfo) {
      this.updateUserToken(res.token)
      this.userInfo = res
      this.userCommercialType = res.org.type || ESpaceCommercialType.free
    },
    // 更新当前用户信息
    updateUserInfoAttri(info: UpdateUserInfoAttri) {
      const copy_orgInfoList = [...this.orgInfoList]
      this.userInfo = {
        ...this.userInfo,
        ...info
      }
      this.orgInfoList = copy_orgInfoList.map((item) => ({ ...item, ...info })) as Partial<
        IUserInfo[]
      >
    },
    // Todo:
    // 更新当前用户下空间信息
    updateUserOrgInfoAttri(info: UpdateOrgInfoAtti) {
      const copy_userInfo = { ...this.userInfo }
      const copy_orgInfoList = [...this.orgInfoList]
      copy_userInfo.org = { ...copy_userInfo.org, ...info }
      this.userInfo = { ...copy_userInfo }
      this.orgInfoList = copy_orgInfoList.map((item) =>
        item.org.id === copy_userInfo.org.id ? copy_userInfo : item
      ) as Partial<IUserInfo[]>
    },
    updateUserToken(updateToken: string) {
      try {
        const token = useStorage<string>('auth_token', '')
        token.value = updateToken
      } catch (e) {}
    },
    updateOrgInfo(info) {
      this.orgInfo = info
    },
    async getABTestConfig() {
      try {
        const { dvid } = useLocationDvid()
        const res = await getABTestConfig(dvid)
        const config = res.data
        this.abTestConfig.value = config
        return Promise.resolve(config)
      } catch (e) {}
    }
  }
})
