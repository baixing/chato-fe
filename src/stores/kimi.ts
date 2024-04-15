import { useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useKimiStore = defineStore('kimi', () => {
  const kimiHistoryLength = useStorage('kimiHistoryLength', 0)
  const showKimi = ref(false)
  const question = ref('')

  watch(
    kimiHistoryLength,
    (v) => {
      if (v >= 5) {
        showKimi.value = true
      }
    },
    { immediate: true }
  )

  return {
    question,
    showKimi,
    kimiHistoryLength
  }
})
