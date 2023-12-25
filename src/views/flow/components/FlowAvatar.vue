<template>
  <div
    :class="[
      'bg-indigo-50 rounded-lg flex items-center justify-center shrink-0',
      rounded && '!rounded-full'
    ]"
    :style="{
      width: `${size}px`,
      height: `${size}px`
    }"
  >
    <svg-icon
      name="work-flow"
      svg-class="text-[#7C5CFC]"
      :style="{
        width: `${iconSize}px`,
        height: `${iconSize}px`
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ size?: number; rounded?: boolean }>(), {
  size: 48,
  rounded: false
})

const iconSize = computed(() => Math.ceil(props.size / 2))
</script>
