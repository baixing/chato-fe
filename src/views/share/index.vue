<template>
  <div
    class="container-preview-page bg-white relative parent-element"
    :class="[isIphoneBol && 'pb-4']"
  >
    <div
      class="flex items-center justify-center h-14 bg-white mb-0 text-sm font-medium gap-2 shrink-0"
      style="border-bottom: 1px solid #eee"
      v-if="!isInApplet"
    >
      <Avatar
        :avatar="detail.avatar || DefaultAvatar"
        :size="28"
        :name="detail.name.slice(0, 2)"
        class="w-7 h-7 rounded-full shrink-0 overflow-hidden"
      />
      <span>{{ detail.name.slice(0, 11) || '...' }}</span>
      <span
        class="flex w-fit cursor-pointer rounded-full absolute z-[999] top-0 right-0 h-14 items-center text-base pr-5"
      >
      </span>
    </div>
    <div
      :class="['flex flex-col h-full w-full overflow-hidden']"
      v-loading="$isLoading"
      element-loading-background="#fffc"
    >
      <div class="chat-history chat-center space-y-6">
        <template v-for="item in history" :key="item.id">
          <MessageItem :isLast="false" :message="item" :detail="detail" :isInternal="false" />
        </template>
      </div>
      <div class="chat-center py-5">
        <div class="flex justify-center">
          <el-button
            class="btn-grad !text-white !h-full !px-8"
            @click="onLinkToChat(detail.slug as string)"
            >前往对话</el-button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getShareList } from '@/api/chat'
import DefaultAvatar from '@/assets/img/avatar.png'
import MessageItem from '@/components/Chat/ChatMessageItem.vue'
import { useSource } from '@/composables/useSource'
import { CHATO_SOURCE_APPLET } from '@/constant/common'
import { EMessageDisplayType, EWsMessageStatus } from '@/enum/message'
import type { IDomainInfo } from '@/interface/domain'
import type { IMessageItem } from '@/interface/message'
import { formatChatMessageAnswer } from '@/utils/chat'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import wx from 'weixin-js-sdk'

const route = useRoute()
const router = useRouter()
const { source } = useSource()
const detail = ref<IDomainInfo>({} as IDomainInfo) // 机器人详情
const $isLoading = ref(false)
const history = ref<IMessageItem[]>([])
const isInApplet = computed(() => source.value === CHATO_SOURCE_APPLET) // 判断是否在小程序环境
const isIphoneBol = computed(() =>
  route.query.system ? decodeURIComponent(route.query.system as string).includes('iOS') : false
)
const shareId = computed(() => route.params.shareId)
const onLinkToChat = (slug: string) => {
  if (!isInApplet.value) {
    router.replace(`/c/bot/${slug}`)
  } else {
    wx.miniProgram.navigateTo({
      url: '/pages/index/index?slug=' + slug
    })
  }
}
// const getBotInfo = async () => {
//   await getDomainDetailPublic(botSlug.value).then((res) => (detail.value = res.data?.data || {}))
// }
const getHistory = async () => {
  const res = await getShareList(shareId.value.toString())
  if (res.data?.data.length === 0) return
  detail.value = res.data?.data[0].domain
  const list = res.data.data
  const newHistory = [...history.value]
  for (let i = 0; i < list.length; i++) {
    const list_item = list[i]
    const question: IMessageItem = {
      type: list_item.type,
      displayType: EMessageDisplayType.question,
      id: `${list_item.id}_q`,
      content: list_item.question,
      questionId: list_item.id,
      evaluation: list_item.evaluation,
      question: list_item.question,
      status: EWsMessageStatus.done
    }
    const answer: IMessageItem = {
      type: list_item.type,
      displayType: EMessageDisplayType.answer,
      id: `${list_item.id}_a`,
      content: formatChatMessageAnswer({ content: list_item.answer }),
      ref_source_len: list_item.ref_source_len,
      questionId: list_item.id,
      evaluation: list_item.evaluation,
      question: list_item.question,
      status: list_item.status,
      command: list_item.command
    }

    if (!list_item.answer_deleted && list_item.status !== EWsMessageStatus.pending) {
      newHistory.unshift(...[answer])
    }
    if (!list_item.question_deleted) {
      newHistory.unshift(...[question])
    }
    history.value = newHistory
  }
}
onMounted(async () => {
  await getHistory()
})
</script>

<style lang="scss" scoped>
.chat-center {
  @apply px-[24%] lg:px-4 xl:px-[12%] 2xl:px-[18%];
}
.container-preview-page {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
  height: 100%;
  touch-action: manipulation;
  display: flex;
  flex-direction: column;
}
.chat-history {
  @apply py-4;
  flex: auto 1 1;
  box-sizing: border-box;
  max-width: 100vw;
  overflow-x: hidden;
  overflow-y: auto;
}
.btn-grad {
  background: linear-gradient(117deg, #0547ff -84%, #d683ff 125%);
}
</style>
