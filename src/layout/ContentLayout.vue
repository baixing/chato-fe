<template>
  <div class="page-body-container">
    <div
      :class="[
        'page-center-container page-content-container',
        centerFull && 'h-full !pb-0',
        full && 'w-full max-w-none !pb-0 lg:!p-0'
      ]"
    >
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    centerFull?: boolean
    full?: boolean
  }>(),
  {
    centerFull: false,
    full: false
  }
)
</script>
