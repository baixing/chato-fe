<template>
  <div>正在跳转阿旺小程序...</div>
</template>

<script setup lang="ts">
import useClickId from '@/composables/useClickId'
import { douYinCallbackAPI } from '@/utils/callback'
import { useRoute } from 'vue-router'

const route = useRoute()
const { clickId } = useClickId(route)

const init = () => {
  try {
    clickId.value && douYinCallbackAPI(clickId.value, () => {})
  } catch (error) {
  } finally {
    location.href = 'https://admin.sdlian.cn/l/hBlc2rImLp'
  }
}

init()
</script>

<style scoped></style>
