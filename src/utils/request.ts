import { currentEnvConfig } from '@/config'
import { EFengkongField } from '@/enum/common'
import { ELangKey } from '@/enum/locales'
import type { IResponse } from '@/interface/common'
import i18n from '@/locales'
import router from '@/router'
import { useAuthStore } from '@/stores/auth'
import { useLocalStorage } from '@vueuse/core'
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { handleRequestError } from './help'
let tokenAbnormal = false

const $t = i18n.global.t

const currentlocales = useLocalStorage('locale', ELangKey.zh_cn)

const baseURL = currentEnvConfig.baseURL

const service = axios.create({
  baseURL,
  timeout: 90_000 // 请求超时时间 (ms)
})

type AxiosRequestConfigType = InternalAxiosRequestConfig & { enforceAnonymity: boolean }

// 请求拦截器
service.interceptors.request.use((config: AxiosRequestConfigType) => {
  const authStoreI = useAuthStore()
  const headers = config.headers
  const token = authStoreI.authToken
  headers['X-LANG'] = currentlocales.value
  if (token && !config.enforceAnonymity) headers.Authorization = 'Bearer ' + token
  return config
})

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const data = response?.data || {}
    if ('code' in data && Number(data.code) !== 200) {
      const authStoreI = useAuthStore()
      switch (data.code) {
        case 401: {
          authStoreI.$patch({ authToken: '' })
          data.message = $t('您的登录状态已失效，请重新登录。')
          if (window.location.pathname !== '/') {
            router.replace('/auth/login')
          }
          break
        }
        case 403:
          data.message = $t('暂无访问权限')
          break
        case 200002: // 已经加入的空间，直接进入，不提示！
          data.notThrowError = true
          break
        case 200011: {
          const errorMap = data.data
            .reduce((pre: string, cur: EFengkongField) => {
              return pre + EFengkongField[cur] + '、'
            }, '')
            .slice(0, -1)
          data.message = errorMap + data.message + '，请重新操作'
          break
        }
      }
      if (!tokenAbnormal) {
        tokenAbnormal = true
        !data.notThrowError && handleRequestError(null, data.message)
        const timer = setTimeout(() => {
          tokenAbnormal = false
          clearTimeout(timer)
        }, 3000)
      }
      return Promise.reject(data)
    }

    return response
  },
  (err: AxiosError) => {
    if (err.response) {
      // 对于 HTTP 错误状态码进行处理，例如 404 Not Found
      err.message = $t('请求错误')
    } else if (err.request) {
      // 对于请求未发送到服务器的错误进行处理，例如网络错误
      err.message = $t('网络异常，请检查后重试')
    }
    // Todo: 避免3s内客户端显示很多报错
    if (!tokenAbnormal) {
      tokenAbnormal = true
      handleRequestError(err, err.message)
      const timer = setTimeout(() => {
        tokenAbnormal = false
        clearTimeout(timer)
      }, 3000)
    }
    return Promise.reject(err)
  }
)

/**
 * 核心函数，可通过它处理一切请求数据，并做横向扩展
 */
function request<T = any>(options) {
  const method = options.method || 'get'
  // get 请求做参数的兼容
  if (method.toLowerCase() === 'get') {
    if (!options.params) options.params = options.data
  }
  return service<IResponse<T>>(options)
}

export default request
