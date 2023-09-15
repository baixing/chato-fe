<template>
  <div class="flex gap-2">
    <span v-if="isCurrentAudioLoading" v-loading="isCurrentAudioLoading" class="audio-loading" />
    <el-icon
      v-else
      size="20"
      color="#5240FF"
      @click="onAudioClick(internalAudioPlayerId)"
      class="cursor-pointer hover:opacity-80"
    >
      <VideoPause v-if="isCurrentAudioPlaying" />
      <VideoPlay v-else />
    </el-icon>
    <div
      :class="[
        'audio-groove',
        isCurrentAudioPlaying && 'playing-groove',
        isCurrentAudioLoading && 'opacity-30'
      ]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import useAudioPlayer from '@/composables/useAudioPlayer'
import { computed } from 'vue'

const props = defineProps<{
  playerId: string
}>()

const internalAudioPlayerId = computed(() => props.playerId)

const { onAudioClick, checkIsCurrentAudioPlaying, checkIsCurrentAudioLoading } = useAudioPlayer()

const isCurrentAudioPlaying = computed(() =>
  checkIsCurrentAudioPlaying(internalAudioPlayerId.value)
)
const isCurrentAudioLoading = computed(() =>
  checkIsCurrentAudioLoading(internalAudioPlayerId.value)
)
</script>

<style lang="scss" scoped>
@keyframes grooveScroll {
  0% {
    background-position: 0 0;
  }
  5% {
    background-position: -390px 0;
  }
  10% {
    background-position: -780px 0;
  }
  15% {
    background-position: -1170px 0;
  }
  20% {
    background-position: -1560px 0;
  }
  25% {
    background-position: -1950px 0;
  }
  30% {
    background-position: -2340px 0;
  }
  35% {
    background-position: 0 -56px;
  }
  40% {
    background-position: -390px -56px;
  }
  45% {
    background-position: -780px -56px;
  }
  50% {
    background-position: -1170px -56px;
  }
  55% {
    background-position: -1560px -56px;
  }
  60% {
    background-position: -1950px -56px;
  }
  65% {
    background-position: -2340px -56px;
  }
  70% {
    background-position: 0 -112px;
  }
  75% {
    background-position: -390px -112px;
  }
  80% {
    background-position: -780px -112px;
  }
  85% {
    background-position: -1170px -112px;
  }
  90% {
    background-position: -1560px -112px;
  }
  95% {
    background-position: -1950px -112px;
  }
  100% {
    background-position: -2340px -112px;
  }
}

.audio-loading {
  width: 20px;
  height: 20px;

  :deep(.el-loading-mask) {
    border-radius: 100%;
    background-color: rgba(124, 92, 252, 0.1);
  }

  :deep(.el-loading-spinner) {
    margin-top: -11px;
    top: 0;

    svg {
      width: 16px;
    }
  }
}

.audio-groove {
  background-image: url('@/assets/img/audio-stream.png');
  width: 390px;
  height: 56px;
  background-size: auto;
  transform: scale(0.33333);
  cursor: pointer;
  margin-left: -130px;
  margin-right: -130px;
  margin-top: -18px;
  margin-bottom: -10px;
}

.playing-groove {
  animation: grooveScroll 0.84s steps(1) infinite;
}
</style>
