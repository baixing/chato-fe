<template>
  <div
    :class="[
      'w-screen h-screen bg-[#000000cc] fixed top-0 left-0 transition-all z-[999]',
      internaleVisible ? 'opacity-100 visible' : 'opacity-0 invisible'
    ]"
  >
    <el-icon
      class="!absolute top-5 right-5 cursor-pointer hover:opacity-80"
      :size="36"
      color="#fff"
      @click="internaleVisible = false"
    >
      <Close />
    </el-icon>
    <video
      class="absolute w-[80%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 lg:w-[90%] rounded-2xl"
      preload="none"
      muted
      controls
      :poster="ImagePath"
    >
      <source
        src="https://ai.baixing.net/ai/Chato8%E6%9C%8815%E7%89%88%E6%9C%AC.mp4"
        type="video/mp4"
      />
      {{ $t('您的浏览器不支持 video 标签。') }}
    </video>
  </div>
</template>
<script lang="ts" setup>
import useImagePath from '@/composables/useImagePath'
import { computed } from 'vue'

const { ImagePath } = useImagePath('video-cover', 'home', 'jpg')

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

const internaleVisible = computed({
  get: () => props.visible,
  set: (v) => emit('update:visible', v)
})
</script>
