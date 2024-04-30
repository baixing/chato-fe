<template>
  <Modal
    width="29%"
    mobile-width="95%"
    title="新用户礼包"
    :showClose="false"
    :footer="false"
    :closeOnClickMask="true"
    v-model:visible="showKimi"
    class="pay-tip-container text-[#888]"
  >
    <template #header>
      <div class="w-full text-center text-base">{{ KIMI_MODAL_TITLE[slug] }}</div>
    </template>
    <div class="bg-[#F2F2F2] rounded-md px-5 py-4" style="font-feature-settings: 'kern' on">
      <p
        style="font-family: 思源黑体"
        class="flex items-center text-left mb-1 md:text-xs text-[#000] text-sm"
      >
        <img
          src="https://afu-1255830993.cos.ap-shanghai.myqcloud.com/chato/production/upload/chato_image/avater/4be0783a8a9272c4c0b1a454e4644558.ico"
          class="mr-2 !w-[16px] !h-4"
        />
        kimi：
      </p>
      <div class="indent-4 text-sm leading-7 md:leading-5 text-[#888888]">
        <svg-icon name="left-quotation" class="!mb-1"></svg-icon>
        {{ kimiContent }}
        <svg-icon name="right-quotation"></svg-icon>
      </div>
    </div>
    <ul class="w-full my-6 md:pl-1 pl-2">
      <li
        v-for="desc in equityList"
        :key="desc"
        class="text-[#3D3D3D] flex items-center md:text-xs text-sm !leading-9"
      >
        <svg-icon
          name="check-mark"
          class="!w-4 !h-4 !text-[#000000] !mr-3 md:!mr-[6px] !mt-[-3px]"
        />
        {{ desc }}
      </li>
    </ul>

    <el-button
      type="primary"
      class="!rounded-full !bg-[#333333] !text-lg w-full !font-medium !text-[#CB9F67] !h-[46px] text-center !border-none !my-[10px]"
      @click="onHandleRouterKimi()"
    >
      立即体验
    </el-button>
  </Modal>
</template>

<script setup lang="ts">
import Modal from '@/components/Modal/index.vue'
import useBaidu from '@/composables/useBaidu'
import useClickId from '@/composables/useDouyin'
import { KIMI_MODAL_TITLE, KIMI_TR_PARAM1 } from '@/constant/common'
import { useKimiStore } from '@/stores/kimi'
import { baiduCallbackAPI, douYinCallbackAPI } from '@/utils/callback'
import { useStorage } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'

const props = defineProps<{ slug: string }>()

const route = useRoute()
const keyword = route.query.keyword as string
const { clickId } = useClickId(route)
const { bdvid } = useBaidu(route)
const kimiStore = useKimiStore()
const { showKimi, question } = storeToRefs(kimiStore)

const equityList = ['永久免费使用', '每日无次数限制', '支持200万字无损上下文']

const kimiContent =
  '有着超大“内存”的智能助手，可以一口气读完二十万字的小说，还会上网冲浪，快来跟他聊聊吧'

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
  window.location.href = `http://kimi.moonshot.cn/?send_immediately=true&tr_param1=${
    KIMI_TR_PARAM1[props.slug]
  }&tr_param2=oldpage&Campaign_group_id=baixing&prefill_prompt=hello&utm_source=Chat&utm_campaign=baixing_kimi&utm_content=${
    KIMI_MODAL_TITLE[props.slug]
  }`
}
</script>
