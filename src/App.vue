<template>
  <el-config-provider :locale="clocale">
    <div class="flex flex-col flex-1 h-full relative pb-[0.5px]">
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
import dayjs from 'dayjs'
import { ElConfigProvider } from 'element-plus'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { api as viewerApi } from 'v-viewer'
import { computed, onMounted } from 'vue'
import useGlobalProperties from './composables/useGlobalProperties'
// 设置不同环境的 Favicon
// useFavicon()
useBaiduPromotion()
useByteDancePromotion()
const { locale } = storeToRefs(useLocales())
const { $sensors } = useGlobalProperties()
const clocale = computed(() => Elementlocales[locale.value])
const $uid = useStorage('uid', '')
const host = window.location.host
const initUid = () => {
  if (!$uid.value || $uid.value === 'undefined') {
    $uid.value = uuidv4()
  }
}
onMounted(() => {
  initUid()
  sensors()
  document.body.style.overflow = 'hidden'
})
const sensors = () => {
  $sensors?.track('a_wang:' + host, {
    name: '阿旺界面打点',
    type: 'a_wang:' + host,
    user: $uid.value,
    data: {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss')
    }
  })
}

// 全局挂载图片预览 api
window.previewImages = (imageStr: string, imageIndex = 0) => {
  const imageUrlList = imageStr ? imageStr.split(',') : []
  viewerApi({
    options: {
      inline: true,
      button: true,
      navbar: true,
      title: false,
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

// 检测浏览器是否支持0.5px -> 1px
const onCheckPx = () => {
  document.addEventListener('DOMContentLoaded', function () {
    // 创建一个元素来测试
    var testElement = document.createElement('div')
    // 应用0.5px的padding-bottom
    testElement.style.paddingBottom = '0.5px'
    // 将元素添加到DOM中以获取计算样式
    document.body.appendChild(testElement)
    // 获取计算后的样式
    var computedStyle = window.getComputedStyle(testElement)
    // 检查计算后的样式是否实际应用了0.5px
    if (computedStyle.paddingBottom !== '0.5px') {
      // 如果没有应用0.5px，则使用1px
      var elements = document.querySelectorAll('.pb-[0\\.5px]')
      elements.forEach(function (el: any) {
        el.style.paddingBottom = '1px'
      })
    }
    // 清理测试元素
    document.body.removeChild(testElement)
  })
}

onCheckPx()
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
