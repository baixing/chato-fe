import { getCurrentEnv } from '@/config'
import { useStorage } from '@vueuse/core'
import { ElNotification } from 'element-plus'
import { onBeforeUnmount, onMounted } from 'vue'

export default function useVersionCheck() {
  const lastestV = useStorage<{ buildId: string }>('lastestV', { buildId: '' })
  let intervaler

  async function fetchVersion() {
    const res = await fetch('/version.json', {
      headers: { 'Cache-Control': 'no-cache' }
    })
    const lastestVersion = await res.json()
    lastestV.value = lastestVersion
    return lastestVersion
  }

  async function checkVersion() {
    const lastestVersion = await fetchVersion()
    if (lastestVersion.buildId !== lastestV.value?.buildId) {
      lastestV.value = lastestVersion
      ElNotification({
        title: '温馨提示',
        message: '网站已发布新版本，请刷新后继续使用'
      })
    }
  }

  onMounted(() => {
    const env = getCurrentEnv()
    if (env === 'dev') {
      return
    }
    fetchVersion()
    !intervaler &&
      (intervaler = setInterval(() => {
        checkVersion()
      }, 60000))
  })

  onBeforeUnmount(() => {
    intervaler = null
  })
}
