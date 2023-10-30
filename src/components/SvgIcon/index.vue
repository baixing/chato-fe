<template>
  <svg :class="svgClass" aria-hidden="true">
    <use :href="symbolId" :fill="color" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  prefix: {
    type: String,
    default: 'icon'
  },
  name: {
    type: String,
    required: true
  },
  color: {
    type: String
    // default: '#333',
  },
  svgClass: {
    type: any,
    default: 'svg-icon'
  }
})
const symbolId = computed(() => `#${props.prefix}-${props.name}`)
</script>

<style lang="scss" scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  // color: inherit;
}
</style>
