<template>
  <div
    :class="[
      'bg-orange-400 rounded flex items-center justify-center shrink-0',
      rounded && '!rounded-full'
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <svg-icon
      name="activity"
      svg-class="text-white"
      :style="{
        width: `${iconSize}px`,
        height: `${iconSize}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ size?: number; iconSize?: number; rounded?: boolean }>(), {
  size: 26,
  rounded: false
})

const iconSize = computed(() => props.iconSize || props.size - 12)
</script>
