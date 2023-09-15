import { getTTS } from '@/api/chat'
import { SymChatMessageAudioTTSParams } from '@/constant/chat'
import type { ITTSParams } from '@/interface/tts'
import { useAudioStore } from '@/stores/audio'
import { ElMessage } from 'element-plus'
import { storeToRefs } from 'pinia'
import { inject, watch, type Ref } from 'vue'

export default function useAudioPlayer() {
  const audioStoreI = useAudioStore()
  const {
    audioRef,
    audioSrc,
    audioPlayingId,
    audioPlaying,
    audioLoading,
    audioListMap,
    audioIndex,
    audioList
  } = storeToRefs(audioStoreI)

  const textToAudio = async (params: ITTSParams) => {
    try {
      audioLoading.value = true
      const {
        data: { data }
      } = await getTTS({ ...params, finish_reason: 'full' })
      const ttsUrlList = (data?.contentList || []).map((item) => item.url)
      audioStoreI.resetAudioIndex()
      audioStoreI.addAudioListByPlayer(params.audio_key, ttsUrlList)
    } catch (err) {
      throw `tts error: ${err.message}`
    } finally {
      audioLoading.value = false
    }
  }

  const initAudios = async (ttsParams: ITTSParams, clearAudioPlayerId?: string) => {
    audioPlayingId.value = ttsParams.audio_key
    audioPlaying.value = false
    audioStoreI.resetAudioIndex()
    if (clearAudioPlayerId) {
      audioStoreI.clearAudioListByPlayerId(clearAudioPlayerId)
    }
    audioStoreI.initAudioListByPlayerId(ttsParams.audio_key)
    await textToAudio(ttsParams)
  }

  const chatMessageTTSParams = inject<Ref<ITTSParams>>(SymChatMessageAudioTTSParams)

  const onAudioClick = async (playerId: string) => {
    if (audioPlayingId.value === playerId) {
      if (audioRef.value.paused) {
        onAudioPlay()
      } else {
        onAudioPause()
      }
    } else {
      audioPlayingId.value = playerId
      await initAudios(chatMessageTTSParams.value)
    }
  }

  const onAudioPlay = () => {
    if (!audioRef.value.src) {
      ElMessage.warning('语音文件获取失败')
      return
    }
    audioPlaying.value = true
    audioRef.value.play()
  }

  const onAudioPause = () => {
    if (!audioRef.value.src) {
      ElMessage.warning('语音文件获取失败')
      return
    }
    audioRef.value.pause()
    audioPlaying.value = false
  }

  const checkIsCurrentAudioPlaying = (playerId: string) =>
    audioPlayingId.value === playerId && audioPlaying.value

  const checkIsCurrentAudioLoading = (playerId: string) =>
    audioPlayingId.value === playerId && audioLoading.value

  const checkShowCurrentAudioPlayer = (playerId: string) => audioListMap.value.has(playerId)

  const onResetPlayingAudio = () => {
    onAudioPause()
    audioStoreI.resetAudioIndex()
    // 最后一个播放列表指针的时候，把当前音频列表置空，下次读取的时候再推进去
    audioStoreI.clearAudioListByPlayerId(audioPlayingId.value)
  }

  const onNextAudio = () => {
    try {
      if (audioIndex.value < audioList.value.length - 1) {
        audioIndex.value = audioIndex.value + 1
      } else {
        onResetPlayingAudio()
      }
    } catch (e) {
      onCatchAudioErr()
    }
  }

  const onCatchAudioErr = () => {
    audioStoreI.$patch({
      audioPlaying: false,
      audioLoading: false
    })
  }

  const onControlAudio = () => {
    if (!audioSrc.value) {
      if (!audioRef.value) {
        return
      }

      if (!audioRef.value.paused) {
        audioRef.value.pause()
        audioPlaying.value = false
      }
      return
    }

    if (!audioRef.value) {
      return
    }

    audioPlaying.value = true
    const audioPlayPromise = audioRef.value.play()
    if (audioPlayPromise !== undefined) {
      audioPlayPromise
        .then(function () {
          console.log('可以自动播放')
        })
        .catch(function (err) {
          console.log('不允许自动播放：', err)
          // audioPlaying.value = false
          // alert('请手动点击播放')
        })
    }
  }

  watch(
    audioSrc,
    () => {
      onControlAudio()
    },
    { immediate: true }
  )

  return {
    audioSrc,
    audioPlaying,
    audioLoading,
    initAudios,
    onAudioClick,
    onAudioPlay,
    onAudioPause,
    onNextAudio,
    onCatchAudioErr,
    onResetPlayingAudio,
    checkIsCurrentAudioPlaying,
    checkIsCurrentAudioLoading,
    checkShowCurrentAudioPlayer
  }
}
