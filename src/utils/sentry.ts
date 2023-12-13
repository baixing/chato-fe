import * as Sentry from '@sentry/vue'
import type { AxiosError, AxiosResponse } from 'axios'

// 手动上报sentry的信息
export function captureErrorMessageToSentry(response: AxiosError | AxiosResponse) {
  if (!response) {
    return
  }
  const data = {
    // 接口url
    url: response.config?.url,
    // 接口参数
    params: response.config?.data,
    // 接口返回的数据
    data: 'data' in response ? JSON.stringify(response.data) : '',
    // 接口方法
    method: response.config?.method,
    // 接口状态
    status: response.status,
    // 所有信息
    responseStr: JSON.stringify(response)
  }
  Sentry.setTag('api', response.config?.url)
  Sentry.setExtra('request', { ...data })
  Sentry.captureException(`手动上报 api:` + response.config.url, { level: 'error' })
}
