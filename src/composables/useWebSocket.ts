import { useSocketStore } from '@/stores/socket'
import { useWebSocket } from '@vueuse/core'
import { watchEffect } from 'vue'

export const useWebSocketConnect = (url: string) => {
  const socketStore = useSocketStore()
  const { status, data, send, close } = useWebSocket(`wss://${url}`, {
    autoReconnect: true
  })

  watchEffect(() => {
    if (data.value) {
      socketStore.updateSocketResultMap(JSON.parse(data.value))
    }
  })

  return {
    status,
    close,
    send
  }
}
