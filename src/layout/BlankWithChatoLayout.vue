<template>
  <div
    class="flex flex-col items-center justify-center w-full h-full bg-white"
    v-loading="internalLoading"
  >
    <img src="@/assets/img/logo-header.png" alt="" class="w-[195px] h-[43px] lg:w-[146px] lg:h-8" />
    <h1 class="mb-14 mt-6 text-xl font-normal lg:text-lg lg:mb-10">
      {{ $t('基于 AI 技术轻松创建对话机器人') }}
    </h1>
    <div class="bg-[#f2f3f5] rounded-lg w-[440px] lg:w-[90%]">
      <slot></slot>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  loading?: boolean
}>()

const internalLoading = computed(() => props.loading)
</script>
