import { currentEnvConfig } from '@/config'
import { ELangKey } from '@/enum/locales'
import { useBase } from '@/stores/base'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { useLocalStorage } from '@vueuse/core'
import { handleRequestError } from './help'

export default class SSE {
  private token: string
  public abortCtrl: AbortController

  constructor() {
    const { authToken } = useBase()
    this.token = authToken
  }

  request(
    url: string,
    bodyData: Record<string, any>,
    fn?: (data: string) => void,
    initConfig?: { responseAll?: boolean }
  ) {
    const currentlocales = useLocalStorage('locale', ELangKey.zh_cn)
    const { responseAll } = initConfig || { responseAll: false }
    this.abortCtrl = new AbortController()

    return fetchEventSource(currentEnvConfig.baseURL + url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-lang': currentlocales.value
      },
      body: JSON.stringify({ token: this.token, ...bodyData }),
      signal: this.abortCtrl.signal,
      openWhenHidden: true,
      onmessage: (ev) => {
        if (!fn) {
          return
        }

        const result = JSON.parse(ev.data)
        if (responseAll) {
          fn(result)
        } else if ('code' in result && result.code === 200) {
          fn(result.data.chunk)
        } else {
          handleRequestError(result?.message || 'SSE 请求错误')
        }
      },
      onerror: (err) => {
        throw err
      }
    })
  }
}
