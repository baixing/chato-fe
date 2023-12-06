<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full relative pb-2">
      <router-view />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useByteDancePromotion from '@/composables/useByteDancePromotion'
// import useFavicon from '@/composables/useFavicon'
import { Elementlocales } from '@/locales'
import { useLocales } from '@/stores/locales'
import { useStorage } from '@vueuse/core'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import { randomString } from './utils/help'

// 设置不同环境的 Favicon
// useFavicon()
useBaiduPromotion()
useByteDancePromotion()
const { locale } = storeToRefs(useLocales())
const clocale = computed(() => Elementlocales[locale.value])
const $uid = useStorage('uid', '')
const initUid = () => {
  if (!$uid.value || $uid.value === 'undefined') {
    $uid.value = 'uid' + randomString(32)
  }
}
onMounted(() => initUid())
</script>

<style lang="scss" scoped>
.xn-flashing {
  border: 2px solid rgba(124, 92, 252);
  animation: blink 2s linear infinite;
}
@keyframes blink {
  0% {
    border-color: transparent;
  }
  50% {
    border-color: rgba(124, 92, 252);
  }
  100% {
    border-color: transparent;
  }
}
</style>
