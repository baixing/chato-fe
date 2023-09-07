<template>
  <div class="w-full h-full flex justify-center items-center upgrate-version-container">
    <img :src="ImagePath" :class="dynamicImg" alt="" />
  </div>
</template>

<script setup lang="ts">
import useImagePath from '@/composables/useImagePath'
import { ELangKey } from '@/enum/locales'
import { computed, ref } from 'vue'
const { ImagePath } = useImagePath('upgrate-version')
const locale = ref(ELangKey.en)

const dynamicImg = computed(() => {
  if (locale.value === ELangKey.en) {
    return 'w-[550px] h-[200px]'
  } else {
    return 'w-[400px] h-[200px]'
  }
})
</script>

<style scoped lang="scss"></style>
