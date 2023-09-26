<template>
  <div class="flex gap-2 mb-1">
    <span v-if="isCurrentAudioLoading" v-loading="isCurrentAudioLoading" class="audio-loading" />
    <svg-icon
      v-else
      :name="isCurrentAudioPlaying ? 'audio-pause' : 'audio-play'"
      svg-class="w-4 h-4 text-[#7C5CFC] cursor-pointer transition-colors hover:opacity-80"
      @click="onAudioClick(internalAudioPlayerId)"
    />
    <MusicBeats :running="isCurrentAudioPlaying" :class="[isCurrentAudioLoading && 'opacity-30']" />
  </div>
</template>

<script setup lang="ts">
import MusicBeats from '@/components/Animations/MusicBeats.vue'
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
</style>
