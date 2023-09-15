import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'

export const useAudioStore = defineStore('audio', () => {
  const audioRef = ref()
  const audioLoading = ref(false)
  const audioPlaying = ref(false)
  const audioPlayingId = ref('')

  const audioIndex = ref(0)
  const audioListMap = reactive(new Map<string, string[]>())
  const audioList = computed<string[]>(() => audioListMap.get(audioPlayingId.value) || [])
  const audioSrc = computed(() => audioList.value?.[audioIndex.value] || '')

  const addAudioListByPlayer = (playerId: string, audioUrl: string | string[]) => {
    let newAudioList = audioListMap.get(audioPlayingId.value) || []
    if (typeof audioUrl === 'string') {
      newAudioList.push(audioUrl)
    } else {
      newAudioList = audioUrl
    }
    audioListMap.set(playerId, newAudioList)
    audioLoading.value = false
    audioPlaying.value = true
  }

  const resetAudioIndex = () => {
    audioIndex.value = 0
  }

  const clearAudioListByPlayerId = (playerId: string) => {
    initAudioListByPlayerId(playerId)
    resetAudioIndex()
  }

  const initAudioListByPlayerId = (playerId: string) => {
    audioListMap.set(playerId, [])
  }

  const setAudioRef = (el: any) => {
    audioRef.value = el
  }

  return {
    audioRef,
    audioSrc,
    audioList,
    audioListMap,
    audioIndex,
    audioLoading,
    audioPlaying,
    audioPlayingId,
    setAudioRef,
    addAudioListByPlayer,
    initAudioListByPlayerId,
    clearAudioListByPlayerId,
    resetAudioIndex
  }
})
