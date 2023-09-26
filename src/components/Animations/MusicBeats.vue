<template>
  <div class="music-beats" :style="{ width: internalContainerWidth }">
    <i
      v-for="(item, index) in beatsArr"
      :key="`music_beat_${index}`"
      :style="{
        backgroundColor: color,
        animation: `beatWave ${item.times}s linear infinite`,
        animationPlayState: internalRunning,
        width: `${beatWidth}px`,
        height: `${item.height}px`,
        left: `${index * (beatWidth + beatGap)}px`,
        '--init-height': `${item.height}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    length?: number
    color?: string
    beatWidth?: number
    beatGap?: number
    running?: boolean
  }>(),
  {
    length: 20,
    beatWidth: 2,
    beatGap: 4,
    color: '#7C5CFC',
    running: false
  }
)

const beatsArr = ref<{ height: number; times: number }[]>([])
const internalRunning = computed(() => (props.running ? 'running' : 'paused'))
const internalContainerWidth = computed(
  () => `${props.length * (props.beatGap + props.beatWidth)}px`
)

onMounted(() => {
  const randomArr = new Array(props.length).fill('').map((item) => {
    return {
      height: parseInt((Math.random() * 11).toString(), 10),
      times: Number(((Math.random() * 6 + 5) / 10).toFixed(2))
    }
  })

  beatsArr.value = randomArr
})
</script>

<style lang="scss">
@keyframes beatWave {
  0% {
    height: var(--init-height);
  }
  50% {
    height: 10px;
  }
  100% {
    height: 6px;
  }
}

.music-beats {
  min-width: 120px;
  position: relative;
  margin-bottom: 2px;
  i {
    position: absolute;
    bottom: 0;
  }
}
</style>
