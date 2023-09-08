<template>
  <div class="w-full h-full flex justify-center items-center upgrate-version-container">
    <img :src="ImagePath" :class="className" alt="" />
  </div>
</template>

<script setup lang="ts">
import useImagePath from '@/composables/useImagePath'

defineProps<{
  className: string
}>()
const { ImagePath } = useImagePath('upgrate-version')
</script>

<style scoped lang="scss"></style>
