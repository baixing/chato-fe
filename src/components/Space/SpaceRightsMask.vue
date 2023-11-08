<template>
  <div
    v-show="maskVisible"
    class="absolute bg-[#ffffffb3] w-full top-0 left-0 right-0 bottom-0 flex items-center justify-center text-sm text-[#3D3D3D] z-[2]"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
}>()

const maskVisible = computed(() => props.visible)
</script>
