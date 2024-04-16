<template>
  <Modal
    v-model:visible="showKimi"
    width="24%"
    mobile-width="90%"
    :footer="false"
    :showClose="true"
    :alignCenter="true"
  >
    <template #header>
      <div></div>
    </template>
    <div class="flex flex-col justify-center items-center gap-7 py-5">
      <el-text size="large" type="info">永久免费使用的AI助手</el-text>
      <el-button type="primary" plain @click="onHandleRouterKimi()">点我立即领取</el-button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import useBaidu from '@/composables/useBaidu'
import useClickId from '@/composables/useDouyin'
import { useKimiStore } from '@/stores/kimi'
import { baiduCallbackAPI, douYinCallbackAPI } from '@/utils/callback'
import { useStorage } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const route = useRoute()
const { clickId } = useClickId(route)
const { bdvid } = useBaidu(route)
const kimiStore = useKimiStore()
const { showKimi, question } = storeToRefs(kimiStore)

const douyinAPI = useStorage('douyinAPI', false)
const baiduAPI = useStorage('baiduAPI', false)

const onHandleRouterKimi = () => {
  let source = 'baidu'
  if (clickId.value && !douyinAPI.value) {
    source = 'douyin'
    douYinCallbackAPI(clickId.value, () => (douyinAPI.value = true))
  }

  if (bdvid.value && !baiduAPI.value) {
    baiduCallbackAPI(bdvid.value, () => (baiduAPI.value = true))
  }
  window.location.href = `http://kimi.moonshot.cn/_prefill_chat?send_immediately=true&prefill_prompt=${question.value}&utm_campaign=TR_cAOfw0mv&utm_source=${source}&utm_medium=link&utm_campaign=kimi小助手`
}
</script>
