<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full relative">
      <router-view />
      <img
        v-if="isMobile"
        data-sensors-click
        id="Chato_mobile_xiaona_chat_click"
        src="@/assets/img/xiaona.png"
        class="absolute w-11 h-11 object-cover right-[2px] bottom-20 rounded-full shadow-lg xn-flashing"
        @click="onContactXN"
      />
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import useBaiduPromotion from '@/composables/useBaiduPromotion'
import useByteDancePromotion from '@/composables/useByteDancePromotion'
import useFavicon from '@/composables/useFavicon'
import { Elementlocales } from '@/locales'
import { useLocales } from '@/stores/locales'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import { useBasicLayout } from './composables/useBasicLayout'

// 设置不同环境的 Favicon
useFavicon()
useBaiduPromotion()
useByteDancePromotion()
const { isMobile } = useBasicLayout()
const { locale } = storeToRefs(useLocales())
const clocale = computed(() => Elementlocales[locale.value])

const onContactXN = () => {
  window.open(`https://admin.sdlian.cn/l/ZkjRKDiEcb`, '_blank')
}
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
