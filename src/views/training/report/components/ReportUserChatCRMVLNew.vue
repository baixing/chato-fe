<template>
  <div
    v-loading="chatHistoryLoading"
    class="flex flex-col gap-5 w-full h-[calc(100vh-186px)] lg:h-[calc(100vh-216px)] overflow-hidden"
  >
    <virtual-list
      ref="virtualRef"
      :list-data="chatHistory"
      :estimated-item-size="100"
      class="flex-1"
      item-class="w-full flex flex-col mb-4 chato-chat-center"
      @scroll-top="onNextPage"
    >
      <template #more>
        <div v-show="hasMore" class="text-xs text-[#B5BED0] text-center py-3">Loading...</div>
      </template>
      <template #default="{ rowData }">
        <ChatCRMMessage :message="rowData" :question-bg="domainInfo.message_style" />
      </template>
    </virtual-list>
    <div class="chato-chat-center flex items-center gap-2 w-full">
      <el-button round @click="onChangeChatMode" class="!h-full !rounded-3xl">
        {{ $t(domainInfo.human_reply_switch ? '转机器人' : '转人工') }}
      </el-button>
      <div v-if="domainInfo.human_reply_switch" class="input-container">
        <el-input
          resize="none"
          type="textarea"
          :autosize="{ maxRows: 5 }"
          v-model="inputText"
          :placeholder="$t(inputPlaceholder)"
          @click="scrollChatHistoryBottom"
          @keydown.enter="onKeydownEnter"
        />
        <el-tooltip :content="$t(`发送`)" placement="top" :hide-after="0">
          <span
            @click="onSend"
            data-script="Chato-send-question"
            class="send-btn transition-colors pl-1"
          >
            <svg-icon
              :svg-class="[
                'w-6 h-6 text-[#B5BED0] transition-colors',
                inputText && '!text-[#7C5CFC]'
              ]"
              name="chat-send"
            />
          </span>
        </el-tooltip>
      </div>
      <div
        v-else
        class="input-container !min-h-[46px] bg-neutral-100 text-sm justify-center !px-0 !border-none"
      >
        {{ $t('机器人自动回复中...') }}
      </div>
    </div>
  </div>
  <CustomerFormDialog
    v-model:visible="customerFormState.visible"
    :form-id="customerFormState.formId"
    :title="customerFormState.title"
    :uid="customerFormState.uId"
  />
</template>

<script setup lang="ts">
import { chatToBotHistoryB } from '@/api/chat'
import { updateDomainReplySwitch } from '@/api/domain'
import CustomerFormDialog from '@/components/Customer/CustomerFormDialog.vue'
import VirtualList from '@/components/VirtualList/index.vue'
import { useBasicLayout } from '@/composables/useBasicLayout'
import { useSource } from '@/composables/useSource'
import { currentEnvConfig } from '@/config'
import { XSSOptions } from '@/constant/xss'
import { EMessageDisplayType } from '@/enum/message'
import type { IPage } from '@/interface/common'
import type { ICRMMessage } from '@/interface/message'
import { useAuthStore } from '@/stores/auth'
import { useBase } from '@/stores/base'
import { useDomainStore } from '@/stores/domain'
import { useDebounceFn, useWebSocket } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { v4 as uuidv4 } from 'uuid'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, toRaw, watch } from 'vue'
import { useRoute } from 'vue-router'
import xss from 'xss'
import ChatCRMMessage from './ChatCRMMessage.vue'

const route = useRoute()
const { isMobile } = useBasicLayout()
const { source } = useSource()
const authStoreI = useAuthStore()
const base = useBase()
const domainStoreI = useDomainStore()
const { authToken } = storeToRefs(authStoreI)
const { domainInfo } = storeToRefs(domainStoreI)
const { userInfo } = storeToRefs(base)

const inputPlaceholder = computed(() =>
  isMobile.value ? '请输入回复' : '输入回复内容，换行可通过shift+回车'
)
const senderUID = computed(() => route.params.chatId as string)

const customerFormState = reactive<{
  visible: boolean
  formId: string
  uId: string
  title: string
}>({
  visible: false,
  formId: '',
  uId: '',
  title: ''
})

const inputText = ref('')
const isChatByHuman = computed({
  get: () => domainInfo.value.human_reply_switch,
  set: (v) => v
})
const needScrollBottom = ref(true)
const virtualRef = ref()
const chatHistoryEl = ref<HTMLDivElement>()
const chatHistoryLoading = ref(false)
const chatHistory = ref<ICRMMessage[]>([])
const chatHistoryPagination = reactive<IPage>({
  page: 1,
  page_count: 1,
  page_size: 10,
  total: 0
})
const latestChatQuestionId = computed(() => chatHistory.value.at(-1)?.question_id || 0)

const onChangeChatMode = async () => {
  try {
    await updateDomainReplySwitch({
      domain_id: domainInfo.value.id,
      human_reply_switch: domainInfo.value.human_reply_switch ? 0 : 1
    })
    domainStoreI.initDomainList(route)
  } catch (e) {}
}

const hasMore = computed(() => chatHistoryPagination.page !== chatHistoryPagination.page_count)

const onNextPage = useDebounceFn(async () => {
  // 翻页
  if (!hasMore.value) {
    return
  }
  needScrollBottom.value = false
  chatHistoryPagination.page++
  const viewHistoryIdIndex = chatHistory.value[0].id
  await initChatHistory(chatHistoryPagination.page)
  virtualRef.value.setScrollToIndex(viewHistoryIdIndex)
}, 100)

const scrollChatHistoryBottom = () => {
  nextTick(() => {
    console.log(chatHistory.value.at(-1).id, '--chatHistory.value.at(-1)')
    chatHistory.value &&
      virtualRef.value &&
      virtualRef.value.setScrollToIndex(chatHistory.value.at(-1).id)
  })
}

const initChatHistory = async (page = 1) => {
  try {
    chatHistoryLoading.value = true
    const {
      data: {
        data,
        meta: { pagination }
      }
    } = await chatToBotHistoryB({
      sender: String(userInfo.value.id) || '',
      domain_slug: domainInfo.value.slug,
      page,
      page_size: chatHistoryPagination.page_size
    })

    const newChatHistory = [...toRaw(chatHistory.value)]
    data.forEach((item, index) => {
      const question: ICRMMessage = {
        id: `${item.id}_${index}_q`,
        sender_uid: senderUID.value,
        display_type: EMessageDisplayType.question,
        content: item.question,
        question_id: item.id,
        source: item.source
      }
      const answer: ICRMMessage = {
        id: `${item.id}_${index}_a`,
        sender_uid: senderUID.value,
        display_type: EMessageDisplayType.answer,
        content: item.answer,
        question_id: item.id,
        source: item.source
      }

      if (item.question && !item.question_deleted) {
        newChatHistory.unshift(question)
      }
      if (item.answer && !item.answer_deleted) {
        newChatHistory.unshift(answer)
      }
    })
    chatHistory.value = newChatHistory
    chatHistoryPagination.page = pagination.page
    chatHistoryPagination.page_count = pagination.page_count

    nextTick(() => {
      needScrollBottom.value = true
    })
  } catch (e) {
  } finally {
    chatHistoryLoading.value = false
  }
}

const onKeydownEnter = (e: KeyboardEvent) => {
  if (!e.shiftKey && e.keyCode === 13) {
    e.cancelBubble = true
    e.stopPropagation()
    e.preventDefault()
    onSend()
  }
}

const socketInstance = useWebSocket(
  `wss://${currentEnvConfig.socketCRMURL}?token=${authToken.value}`,
  {
    autoReconnect: true,
    onMessage: (ws, msgEvent) => {
      const { data } = msgEvent
      if (!data) {
        return
      }
      const chatMsgItem = JSON.parse(msgEvent.data)
      chatHistory.value.push({ ...chatMsgItem, id: uuidv4() })
    }
  }
)

const onSend = async () => {
  const text = String(inputText.value).trim()
  inputText.value = ''
  const xssFilterText = xss(text, XSSOptions)
  const newChatMessgae: ICRMMessage = {
    sender_uid: senderUID.value,
    content: xssFilterText,
    question_id: latestChatQuestionId.value,
    source: source.value,
    display_type: EMessageDisplayType.answer
  }
  try {
    socketInstance.send(JSON.stringify(newChatMessgae))
  } catch (err) {
    chatHistory.value[chatHistory.value.length - 1].content = err
  }
}

const onElClick = (event) => {
  const target = (event.target || event.srcElement) as HTMLElement
  if (target?.id === 'Chato-customer-collect-form') {
    event.stopPropagation()
    customerFormState.formId = target.getAttribute('data-form-id')
    customerFormState.uId = target.getAttribute('data-uid')
    customerFormState.visible = true
    customerFormState.title = target.innerText
  }
}

watch(
  () => domainInfo.value.slug,
  (slug) => {
    if (slug) {
      chatHistory.value = []
      initChatHistory()
    }
  },
  { immediate: true }
)

watch(
  chatHistory,
  () => {
    needScrollBottom.value && scrollChatHistoryBottom()
  },
  { deep: true }
)

onMounted(() => {
  document.addEventListener('click', onElClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onElClick)
  // socketInstance.close()
})
</script>

<style lang="scss" scoped>
.input-container {
  @apply box-border rounded-3xl py-1 pl-4 pr-1 flex-1 flex items-center border border-solid border-[#e4e7ed] min-h-[44px];

  .send-btn {
    @apply w-9 h-9 cursor-pointer rounded-full box-border flex items-center justify-center shrink-0 hover:bg-[#f2f3f5];
    &:hover {
      svg {
        color: #7c5cfc;
      }
    }
  }

  :deep(.el-textarea) {
    display: flex;
    align-items: center;
  }

  :deep(.el-textarea__inner) {
    box-shadow: none;
    font-weight: normal;
    flex: 1;
    color: #303133;
    padding: 0 12px 0 0;
    font-size: 15px;
    line-height: 15px;
    min-height: 15px !important;

    &::placeholder {
      color: #9da3af;
    }
  }

  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    color: #303133;
    background-color: transparent;
  }
}
</style>
