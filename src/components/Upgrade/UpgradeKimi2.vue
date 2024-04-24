<template>
  <div>
    <!-- 页面内容，实际上用户可能看不到，因为页面将被重定向 -->
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { baiduCallbackAPI } from '@/utils/callback'
import { useRoute } from 'vue-router'
import { useStorage } from '@vueuse/core'
import useBaidu from '@/composables/useBaidu'
import { KIMI_MODAL_TITLE, KIMI_TR_PARAM1 } from '@/constant/common'

const props = defineProps<{ slug: string }>()

const route = useRoute()
const { bdvid } = useBaidu(route)
const baiduAPI = useStorage('baiduAPI', false)

const redirectToKimi = () => {
  if (bdvid.value && !baiduAPI.value) {
    baiduCallbackAPI(bdvid.value, () => (baiduAPI.value = true))
  }
  // 你希望用户跳转去的外部链接
  const externalUrl = `http://kimi.moonshot.cn/?tr_param1=${
    KIMI_TR_PARAM1[props.slug]
  }&tr_param2=newpage&Campaign_group_id=baixing&prefill_prompt=hello&utm_source=Chat&utm_campaign=baixing_kimi&utm_content=${
    KIMI_MODAL_TITLE[props.slug]
  }`
  // 用 replace 方法替换当前页面
  window.location.replace(externalUrl)
}

// 使用 onMounted 钩子来在组件挂载完成后执行重定向
onMounted(() => {
  redirectToKimi()
})
</script>
