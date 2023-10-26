<template>
  <Teleport to="body">
    <audio ref="audioPlayerRef" :src="audioSrc" preload="auto" autoplay="true"></audio>
  </Teleport>
</template>

<script setup lang="ts">
import useAudioPlayer from '@/composables/useAudioPlayer'
import { useAudioStore } from '@/stores/audio'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const audioPlayerRef = ref()
const audioStoreI = useAudioStore()

const { onNextAudio, audioSrc, onCatchAudioErr } = useAudioPlayer()

const onAudioError = (e) => {
  onCatchAudioErr()
}

onMounted(() => {
  audioPlayerRef.value.addEventListener('error', onAudioError)
  audioPlayerRef.value.addEventListener('ended', onNextAudio)

  // 绕过用户进来无点击事件，浏览器限制播放的问题
  setTimeout(() => {
    audioPlayerRef.value?.click()
  }, 100)
})

onBeforeUnmount(() => {
  audioPlayerRef.value.removeEventListener('error', onAudioError)
  audioPlayerRef.value.removeEventListener('ended', onNextAudio)
})

watch(
  audioPlayerRef,
  (v) => {
    if (!v) {
      return
    }

    audioStoreI.setAudioRef(audioPlayerRef.value)
  },
  { immediate: true }
)
</script>
