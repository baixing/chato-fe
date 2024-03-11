<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full relative">
      <router-view />
      <img
        v-if="xnVisible"
        data-sensors-click
        id="Chato_mobile_xiaona_chat_click"
        src="@/assets/img/xiaona.png"
        class="absolute w-11 h-11 object-cover right-[2px] bottom-20 rounded-full shadow-lg z-[99] xn-flashing"
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
import { api as viewerApi } from 'v-viewer'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBasicLayout } from './composables/useBasicLayout'
import { XIAONAQIWEI } from './constant/common'
import { RoutesMap } from './router'

// 设置不同环境的 Favicon
useFavicon()
useBaiduPromotion()
useByteDancePromotion()
const route = useRoute()
const { isMobile } = useBasicLayout()
const { locale } = storeToRefs(useLocales())
const clocale = computed(() => Elementlocales[locale.value])

const xnVisible = computed(() => {
  return (
    isMobile.value &&
    ![
      RoutesMap.chat.c,
      RoutesMap.chat.release,
      RoutesMap.home.homeChat,
      RoutesMap.tranning.botChat
    ].includes(route.name as string)
  )
})

const onContactXN = () => {
  window.open(XIAONAQIWEI, '_blank')
}

// 全局挂载图片预览 api
window.previewImages = (imageStr: string, imageIndex = 0) => {
  const imageUrlList = imageStr ? imageStr.split(',') : []
  viewerApi({
    options: {
      inline: true,
      button: true,
      navbar: true,
      title: true,
      toolbar: true,
      tooltip: false,
      movable: true,
      zoomable: true,
      rotatable: false,
      scalable: false,
      transition: true,
      fullscreen: false,
      keyboard: false,
      initialViewIndex: Number(imageIndex)
    },
    images: imageUrlList
  })
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
