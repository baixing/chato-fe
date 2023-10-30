<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :href="symbolId" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    prefix?: string
    name: string
    color?: string
    svgClass?: string | string[]
  }>(),
  {
    prefix: 'icon',
    svgClass: 'svg-icon'
  }
)

const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
}
</style>
