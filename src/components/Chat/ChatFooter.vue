<template>
  <div
    class="flex gap-2 items-center justify-center px-5 overflow-hidden h-5 cursor-pointer"
    @click="() => emit('click')"
  >
    <span class="shrink-0 h-full">
      <img v-if="logo" :src="logo" class="h-full max-w-[66px] object-cover" />
    </span>
    <p class="theme-color text-xs truncate leading-5">{{ name }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  logo?: string
}>()

const emit = defineEmits(['click'])

const name = computed(() => props.name)
const logo = computed(() => props.logo)
</script>
